# ClassicMap

클래식 음악을 처음 접하는 사람들을 위한 종합 가이드 플랫폼

## 프로젝트 개요

ClassicMap은 클래식 음악 입문자가 작곡가, 연주자, 작품, 공연 정보를 쉽게 탐색하고, 같은 곡의 다양한 해석을 비교할 수 있는 모바일/웹 애플리케이션입니다.

## 핵심 기능

### 1. 연주 비교 (Performance Comparison)

한 곡에 대해 여러 연주자가 서로 다른 해석으로 연주한 영상을 정확히 같은 부분만 추출하여 비교할 수 있습니다.

**기술적 구현:**

- **DTW(Dynamic Time Warping) 알고리즘**을 활용하여 템포가 다른 연주 간에도 대응되는 구간을 정확하게 찾아냅니다
- Chroma CENS 특징 추출을 통해 음높이 변화에 강건한 매칭을 수행합니다
- YouTube 영상에서 동일한 악장/섹션의 시작과 끝 시간을 자동으로 계산하여 데이터베이스에 저장합니다
- 사용자는 여러 연주를 동시에 재생하며 해석의 차이를 직접 비교할 수 있습니다

### 2. 작곡가 타임라인

시대별 작곡가들을 시각적으로 탐색하고, 각 작곡가의 생애와 대표작을 확인할 수 있습니다.

### 3. 연주자 데이터베이스

오케스트라, 지휘자, 연주자 정보를 검색하고, 수상 이력과 경력을 조회할 수 있습니다.

### 4. 공연 정보

- KOPIS(공연예술통합전산망) API 연동을 통한 실시간 국내 클래식 공연 정보 제공
- 공연장, 일정, 박스오피스 정보 확인
- 사용자 평점 및 리뷰 기능

### 5. 음원 연동

Spotify 및 Apple Music과 연동하여 작품의 음원을 바로 들을 수 있습니다.

## 프로젝트 구조

프로젝트는 세 개의 주요 컴포넌트로 구성됩니다:

### [ClassicMap_back](https://github.com/ClassicMap/ClassicMap_back) (백엔드)

Rust 기반의 RESTful API 서버

**기술 스택:**

- Rust 1.89
- Rocket 0.5 (비동기 웹 프레임워크)
- MySQL 8.0 with SQLx
- JWT 인증 (Clerk 연동)
- Docker & Docker Compose

**주요 모듈:**

- Composer, Artist, Piece 데이터 관리
- Concert, Performance, Recording 정보 제공
- KOPIS API 스케줄러 (자동 공연 정보 동기화)
- 사용자 인증 및 평점 시스템

**코드 규모:** 약 7,500 라인

### [ClassicMap_front](https://github.com/ClassicMap/ClassicMap_front) (프론트엔드)

React Native 기반의 크로스플랫폼 애플리케이션

**기술 스택:**

- React Native 0.81.5 with Expo 54.0
- TypeScript 5.9
- Expo Router 6.0 (파일 기반 라우팅)
- TanStack Query 5.90 (상태 관리 및 캐싱)
- NativeWind 4.2 (Tailwind CSS for React Native)
- Clerk Expo 2.16 (인증)
- React Native YouTube Iframe

**주요 화면:**

- Home: 추천 콘텐츠 대시보드
- Artists: 연주자 디렉토리
- Concerts: 공연 정보 목록
- Compare: YouTube 영상 비교 (DTW 기반)
- Timeline: 작곡가 연대기

### [ClassicMap_services](https://github.com/ClassicMap/ClassicMap_services) (데이터 수집 도구)

데이터베이스 구축을 위한 데이터 수집 및 처리 파이프라인

**1. ClassicMap_core (Rust)**

- 기존 레코드의 URL/이미지 업데이트
- Spotify/Apple Music API 연동

**2. piece_data_collection (Python)**

- CSV 파일로부터 작품 데이터 임포트
- 음원 URL 자동 수집
- SQL INSERT 문 생성

**3. artist_data_collection (Python)**

- Wikipedia, Apple Music, MusicBrainz API 연동
- 연주자 프로필, 이미지, 경력 수집

**4. match_similar_pieces (Python)**

- **DTW 알고리즘 구현 핵심**
- librosa를 사용한 음악 신호 처리
- YouTube 영상에서 대응 구간 자동 검색
- Chroma CENS 특징 기반 템포 독립적 매칭
- 성능 세그먼트 데이터베이스 생성

## DTW 알고리즘 상세

**위치:** [comparsion.py](https://github.com/ClassicMap/ClassicMap_services/tree/master/match_similar_pieces)

**동작 원리:**

1. yt-dlp를 통해 YouTube 오디오 다운로드
2. librosa로 Chroma CENS 특징 추출 (음높이 클래스 프로파일)
3. 기준 연주의 특정 구간(쿼리)과 대상 연주 전체를 DTW로 정렬
4. Cosine 거리 메트릭 및 subsequence 모드 사용
5. 최적 정렬 경로로부터 대응 시간 구간 계산
6. 데이터베이스에 각 연주의 시작/종료 시간 저장

이를 통해 연주자마다 다른 템포로 연주해도 동일한 악장이나 주제 부분을 정확하게 매칭할 수 있습니다.

## 시스템 아키텍처

![ClassicMap_architecture](https://github.com/user-attachments/assets/265603c5-c5b5-4c9c-93a8-0a78ea59936f)

## 개발 환경 설정

### 백엔드 실행

```bash
cd ClassicMap_back
docker-compose up -d
```

백엔드 API는 포트 1037에서 실행됩니다.

### 프론트엔드 실행

```bash
cd ClassicMap_front
npm install
npx expo start
```

### 데이터 수집 도구

각 서비스 디렉토리의 README를 참조하세요.

## 배포 현황

- **웹:** https://kang1027.com/omninews
- **iOS:** App Store 심사 중
- **Android:** Google Play 심사 중
- **백엔드:** Docker Compose (MySQL + Rust API, 포트 1037)

## 데이터베이스 스키마

주요 테이블:

- `composers`: 작곡가 정보 (시대, 등급, 바이오, 이미지)
- `pieces`: 작품 정보 (형식, 음원 URL, 난이도, 연주 시간)
- `artists`: 연주자 정보 (카테고리, 등급, 수상 이력)
- `concerts`: 공연 정보 (KOPIS 연동)
- `performances`: 영상 세그먼트 (YouTube 영상 ID, 시간 범위)
- `performance_sectors`: 악장/섹션 구분
- `recordings`: 앨범/녹음 정보
- `venues`, `halls`: 공연장 정보
- `users`: 사용자 관리

## 라이선스

Copyright 2025 Kang. All rights reserved.
