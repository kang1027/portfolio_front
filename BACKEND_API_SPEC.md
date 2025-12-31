# Backend API 구현 가이드

포트폴리오에서 실시간 Apple Music 재생 정보를 보여주기 위한 백엔드 API 스펙입니다.

---

## 아키텍처 개요

```
백엔드 (10초마다 Apple Music API 호출) → 캐시에 저장
                                        ↓
                              WebSocket으로 푸시
                                        ↓
                            프론트엔드 (실시간 수신)
```

**핵심:**
- 백엔드가 **10초마다** Apple Music API를 호출하여 최신 정보를 캐시에 저장
- 곡 정보가 변경되면 **WebSocket을 통해 연결된 모든 클라이언트에게 푸시**
- Apple Music API 호출 횟수 최소화 (Rate Limit 걱정 없음)
- 실시간 업데이트 (폴링 불필요)

---

## 1. GET `/api/admin/get-developer-token`

프론트엔드에서 MusicKit 초기화를 위한 Developer Token을 요청합니다.

### Request
```http
GET /api/admin/get-developer-token
```

### Response
```json
{
  "developerToken": "eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCIs..."
}
```

### 구현 예시 (Rust/Axum)

```rust
use apple_api::initialize_apple_music_api_jwt::get_apple_music_bearer_token;
use axum::{Json, response::IntoResponse};
use serde::Serialize;

#[derive(Serialize)]
struct DeveloperTokenResponse {
    developer_token: String,
}

async fn get_developer_token() -> impl IntoResponse {
    // JWT 토큰 생성
    let token = get_apple_music_bearer_token();

    Json(DeveloperTokenResponse {
        developer_token: token,
    })
}
```

---

## 2. POST `/api/admin/save-token`

관리자가 Apple Music 로그인 후 User Token을 저장합니다.

### Request
```http
POST /api/admin/save-token
Content-Type: application/json

{
  "userToken": "AppleMusic_User_Token_Here..."
}
```

### Response
```json
{
  "success": true
}
```

### 구현 예시 (Rust/Axum)

```rust
use axum::{Json, response::IntoResponse};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::RwLock;

#[derive(Deserialize)]
struct SaveTokenRequest {
    user_token: String,
}

#[derive(Serialize)]
struct SaveTokenResponse {
    success: bool,
}

// 전역 상태로 User Token 저장
struct AppState {
    user_token: Arc<RwLock<Option<String>>>,
    cached_track: Arc<RwLock<Option<CachedTrack>>>,
}

async fn save_token(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<SaveTokenRequest>
) -> impl IntoResponse {
    // User Token 저장
    let mut token = state.user_token.write().await;
    *token = Some(payload.user_token);

    Json(SaveTokenResponse { success: true })
}
```

---

## 2. WebSocket `/ws/now-playing`

현재 재생 중인 곡 정보를 실시간으로 전송합니다.

### Connection
```
ws://localhost:3000/ws/now-playing
```

### Message Format (재생 중)
```json
{
  "isPlaying": true,
  "track": {
    "title": "Sunflower",
    "artist": "Post Malone, Swae Lee",
    "album": "Spider-Man: Into the Spider-Verse",
    "artwork": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/...",
    "duration": 158,
    "currentTime": 45,
    "url": "https://music.apple.com/us/album/sunflower/1434584341?i=1434584831",
    "previewUrl": "https://audio-ssl.itunes.apple.com/..."
  },
  "timestamp": 1703472123000
}
```

### Message Format (재생 안함)
```json
{
  "isPlaying": false,
  "track": null,
  "timestamp": 1703472123000
}
```

### 구현 예시 (Rust/Axum)

```rust
use axum::{
    extract::{ws::WebSocket, State, WebSocketUpgrade},
    response::IntoResponse,
};
use futures::{SinkExt, StreamExt};
use tokio::sync::broadcast;

// WebSocket 핸들러
async fn ws_now_playing(
    ws: WebSocketUpgrade,
    State(state): State<Arc<AppState>>,
) -> impl IntoResponse {
    ws.on_upgrade(|socket| handle_socket(socket, state))
}

async fn handle_socket(socket: WebSocket, state: Arc<AppState>) {
    let (mut sender, mut receiver) = socket.split();

    // broadcast 채널 구독
    let mut rx = state.broadcast_tx.subscribe();

    // 연결 시 현재 상태 전송
    let current = state.cached_track.read().await;
    if let Some(track) = current.as_ref() {
        let json = serde_json::to_string(track).unwrap();
        let _ = sender.send(axum::extract::ws::Message::Text(json)).await;
    }

    // 메시지 수신 및 전송 루프
    let mut send_task = tokio::spawn(async move {
        while let Ok(msg) = rx.recv().await {
            if sender.send(axum::extract::ws::Message::Text(msg)).await.is_err() {
                break;
            }
        }
    });

    let mut recv_task = tokio::spawn(async move {
        while let Some(Ok(_)) = receiver.next().await {
            // 클라이언트로부터의 메시지 처리 (필요 시)
        }
    });

    // 하나의 태스크가 끝나면 둘 다 종료
    tokio::select! {
        _ = (&mut send_task) => recv_task.abort(),
        _ = (&mut recv_task) => send_task.abort(),
    };
}
```

---

## 3. 백엔드 폴링 로직 (핵심!)

백엔드가 **10초마다** Apple Music API를 호출하여 캐시를 업데이트하고, WebSocket으로 브로드캐스트합니다.

### 구현 예시 (Rust/Tokio)

```rust
use apple_api::initialize_apple_music_api_jwt::get_apple_music_bearer_token;
use reqwest::Client;
use serde_json::Value;
use tokio::time::{interval, Duration};
use tokio::sync::broadcast;

async fn start_polling(state: Arc<AppState>) {
    let mut interval = interval(Duration::from_secs(10)); // 10초마다

    loop {
        interval.tick().await;

        // User Token 확인
        let user_token = {
            let token = state.user_token.read().await;
            match token.as_ref() {
                Some(t) => t.clone(),
                None => continue, // User Token 없으면 스킵
            }
        };

        // Developer Token 생성
        let developer_token = get_apple_music_bearer_token();

        // Apple Music API 호출
        match fetch_now_playing(&developer_token, &user_token).await {
            Ok(track_data) => {
                // 캐시 업데이트
                let mut cache = state.cached_track.write().await;
                *cache = Some(track_data.clone());
                println!("✅ 캐시 업데이트: {:?}", cache);

                // WebSocket으로 브로드캐스트
                let json = serde_json::to_string(&track_data).unwrap();
                let _ = state.broadcast_tx.send(json);
            }
            Err(e) => {
                eprintln!("❌ Apple Music API 오류: {}", e);
            }
        }
    }
}

async fn fetch_now_playing(
    developer_token: &str,
    user_token: &str
) -> Result<CachedTrack, Box<dyn std::error::Error>> {
    let client = Client::new();

    // Recently Played 엔드포인트 (limit=1로 최신 곡만)
    let res = client
        .get("https://api.music.apple.com/v1/me/recent/played")
        .query(&[("limit", "1")])
        .bearer_auth(developer_token)
        .header("Music-User-Token", user_token)
        .send()
        .await?;

    if !res.status().is_success() {
        return Err(format!("API 오류: {}", res.status()).into());
    }

    let json: Value = res.json().await?;

    // 데이터 파싱
    let data = &json["data"];
    if data.as_array().map_or(true, |arr| arr.is_empty()) {
        // 재생 중인 곡 없음
        return Ok(CachedTrack {
            is_playing: false,
            track: None,
            timestamp: current_timestamp(),
        });
    }

    let item = &data[0];
    let attributes = &item["attributes"];

    let track = Track {
        title: attributes["name"].as_str().unwrap_or("Unknown").to_string(),
        artist: attributes["artistName"].as_str().unwrap_or("Unknown").to_string(),
        album: attributes["albumName"].as_str().unwrap_or("Unknown").to_string(),
        artwork: get_artwork_url(&attributes["artwork"]),
        duration: attributes["durationInMillis"].as_u64().unwrap_or(0) / 1000,
        current_time: 0, // Recently Played는 current time 제공 안함
        url: Some(attributes["url"].as_str().unwrap_or("").to_string()),
    };

    Ok(CachedTrack {
        is_playing: true,
        track: Some(track),
        timestamp: current_timestamp(),
    })
}

fn get_artwork_url(artwork: &Value) -> String {
    let url_template = artwork["url"].as_str().unwrap_or("");
    url_template
        .replace("{w}", "400")
        .replace("{h}", "400")
}

fn current_timestamp() -> u64 {
    use std::time::{SystemTime, UNIX_EPOCH};
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_millis() as u64
}
```

---

## 4. 메인 함수

폴링을 백그라운드에서 실행하고 WebSocket을 설정합니다.

```rust
use axum::{
    Router,
    routing::{get, post},
};
use std::sync::Arc;
use tokio::sync::{RwLock, broadcast};
use tower_http::cors::CorsLayer;

// AppState 구조체 정의
struct AppState {
    user_token: Arc<RwLock<Option<String>>>,
    cached_track: Arc<RwLock<Option<CachedTrack>>>,
    broadcast_tx: broadcast::Sender<String>, // WebSocket 브로드캐스트용
}

#[tokio::main]
async fn main() {
    // broadcast 채널 생성 (100개 메시지 버퍼)
    let (tx, _rx) = broadcast::channel(100);

    // 전역 상태 초기화
    let state = Arc::new(AppState {
        user_token: Arc::new(RwLock::new(None)),
        cached_track: Arc::new(RwLock::new(None)),
        broadcast_tx: tx,
    });

    // 백그라운드 폴링 시작
    let polling_state = state.clone();
    tokio::spawn(async move {
        start_polling(polling_state).await;
    });

    // CORS 설정
    let cors = CorsLayer::permissive(); // 개발용 (프로덕션에서는 특정 도메인만 허용)

    // 라우터 설정
    let app = Router::new()
        .route("/ws/now-playing", get(ws_now_playing)) // WebSocket
        .route("/api/admin/get-developer-token", get(get_developer_token))
        .route("/api/admin/save-token", post(save_token))
        .layer(cors)
        .with_state(state);

    // 서버 시작
    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000")
        .await
        .unwrap();

    println!("🚀 서버 시작: http://localhost:3000");
    axum::serve(listener, app).await.unwrap();
}
```

---

## 5. 전체 파일 구조

```
backend/
├── Cargo.toml
├── src/
│   ├── main.rs          # 메인 서버
│   ├── polling.rs       # Apple Music 폴링 로직
│   ├── handlers.rs      # API 핸들러
│   └── types.rs         # 타입 정의
└── .env                 # 환경 변수
```

### Cargo.toml

```toml
[package]
name = "apple-music-backend"
version = "0.1.0"
edition = "2021"

[dependencies]
axum = "0.7"
tokio = { version = "1", features = ["full"] }
serde = { version = "1", features = ["derive"] }
serde_json = "1"
reqwest = { version = "0.11", features = ["json"] }
tower-http = { version = "0.5", features = ["cors"] }
apple_api = { path = "../../snippet/apple_api" }
dotenv = "0.15"
```

---

## 6. 환경 변수

### `.env` (백엔드)

```bash
# Apple Music API (JWT 생성용)
APPLE_MUSIC_PRIVATE_KEY=<.p8 파일 내용>
APPLE_MUSIC_KEY_ID=<Key ID>
APPLE_MUSIC_TEAM_KEY=<Team ID>

# 서버 포트 (optional)
PORT=3000
```

**User Token은 환경 변수 불필요!** (프론트엔드에서 `/api/admin/save-token`으로 전송됨)

---

## 7. 작동 흐름

### 초기 설정 (관리자, 한 번만)
```
1. 프론트엔드에서 관리자 로그인
   ↓
2. Apple Music 인증
   ↓
3. User Token 발급
   ↓
4. POST /api/admin/save-token
   ↓
5. 백엔드 메모리에 User Token 저장
   ↓
6. 백그라운드 폴링 시작
```

### 실시간 업데이트 (지속적)
```
프론트엔드:
1. WebSocket 연결 (/ws/now-playing)
2. 연결 시 현재 재생 정보 수신
3. 위젯에 표시

백엔드 (10초마다):
1. Apple Music API 호출
2. 최신 재생 정보 가져오기
3. 캐시 업데이트
4. 곡 정보 변경 시 WebSocket으로 브로드캐스트

프론트엔드:
1. WebSocket 메시지 수신
2. 위젯 자동 업데이트 (실시간)
```

---

## 8. 장점

✅ **Rate Limit 걱정 없음**: 10초마다만 Apple Music API 호출
✅ **빠른 응답**: 프론트엔드 요청 시 캐시만 반환 (즉시 응답)
✅ **확장성**: 방문자가 100명이든 1000명이든 Apple Music API 호출 횟수는 동일
✅ **안정성**: Apple Music API 일시적 오류 시에도 마지막 캐시 데이터 제공

---

## 9. 프로덕션 체크리스트

- [ ] CORS를 특정 도메인만 허용
- [ ] User Token을 DB에 저장 (재시작 시에도 유지)
- [ ] 에러 로깅 추가
- [ ] Health check 엔드포인트 추가
- [ ] HTTPS 설정
- [ ] Rate limit 방어 로직 추가

---

## 10. 테스트

### 로컬 테스트
```bash
# 백엔드 실행
cargo run

# 다른 터미널에서
curl http://localhost:3000/api/now-playing
```

### User Token 저장 테스트
```bash
curl -X POST http://localhost:3000/api/admin/save-token \
  -H "Content-Type: application/json" \
  -d '{"userToken":"test_token"}'
```

---

## 참고

- Apple Music API 문서: https://developer.apple.com/documentation/applemusicapi/get_recently_played_resources
- JWT 생성 코드: `/Users/kang1027/project/snippet/apple_api/src/lib.rs`
