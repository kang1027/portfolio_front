# 개요

뉴스와 RSS 피드를 하나의 플랫폼에서 구독하고 검색할 수 있는 정보 구독 서비스입니다.

## 서비스 링크

- **웹**: [https://kang1027.com/omninews](https://kang1027.com/omninews)
- **iOS**: [App Store](https://apps.apple.com/kr/app/omninews/id6746567181?l=en-GB)
- **Android**: [Google Play](https://play.google.com/store/apps/details?id=com.kdh.omninews)

## 프로젝트 개요

Omninews는 뉴스 서비스와 RSS 리더의 기능을 하나로 통합한 멀티 플랫폼 정보 구독 서비스입니다. 사용자는 큐레이션된 뉴스를 카테고리별로 확인하면서 동시에 원하는 RSS 피드를 자유롭게 구독하고 관리할 수 있습니다.

### 핵심 목표

1. **통합 경험**: 뉴스 앱과 RSS 리더를 별도로 사용하지 않고 하나의 인터페이스에서 모든 정보를 소비
2. **Reverse RSS**: 일반적인 RSS 리더가 채널 단위 검색만 제공하는 것과 달리, 개별 RSS 아이템(글)까지 검색 가능
3. **멀티 플랫폼**: iOS, Android, Web에서 동일한 사용자 경험 제공

## 주요 기능

### 뉴스

- 카테고리별 뉴스 보기 (IT/과학, 세계, 정치, 경제, 사회, 문화, 주요 뉴스)
- 사용자가 직접 검색하여 뉴스 카테고리 추가
- 뉴스 북마크 및 읽은 기록

### RSS

- RSS/Atom 피드 구독
- 폴더 기반 채널 관리
- 새 글 발행 시 푸시 알림
- RSS를 제공하지 않는 사이트(Instagram 등)의 커스텀 RSS 생성

### 검색

- **RSS 아이템 검색**: 구독한 모든 채널의 과거 글까지 검색 (Reverse RSS)
- **RSS 채널 검색**: 새로운 채널 발견
- **외부 뉴스 검색**: 웹 뉴스 검색
- AI 임베딩 기반 의미론적 검색

### 사용자

- 소셜 로그인 (Google, Kakao, Apple)
- 테마 설정 (라이트, 다크, 블루, 페이퍼)
- 알림 설정
- 프리미엄 구독 (광고 제거)

## Reverse RSS란?

일반적인 RSS 리더는 사용자가 채널을 구독하면 새로운 글이 발행될 때 알려주는 방식입니다. 채널 자체는 검색할 수 있지만, 개별 글(아이템)을 검색하는 기능은 찾기 어렵습니다.

Omninews는 백그라운드 스케줄러가 주기적으로 모든 RSS 채널의 아이템을 수집하여 데이터베이스에 저장하고 인덱싱합니다. 이를 통해 사용자는:

- 어느 채널에 있었는지 모르는 글을 검색할 수 있습니다
- 특정 주제에 대한 글을 여러 채널에 걸쳐 검색할 수 있습니다
- 과거에 발행된 글도 찾을 수 있습니다

이러한 역방향 검색 기능을 "Reverse RSS"라고 부릅니다.

## 아키텍처

![Omninews_architecture](https://github.com/user-attachments/assets/0e0fd22f-c8fd-45fe-996a-7616f55b01bc)

## 프로젝트 구조

이 저장소는 Omninews 프로젝트의 모노레포로, 다음 4개의 독립적인 모듈로 구성되어 있습니다:

```
Omninews/
├── Omninews_back/          # Backend API Server
├── Omninews_front/         # Mobile App (Flutter)
├── Omninews_web/           # Web Application (React)
└── Omninews_scheduler/     # Background Scheduler
```

각 모듈의 자세한 내용은 해당 디렉토리의 README를 참고하세요.

| 모듈          | 설명            | 기술 스택          | README                                                      |
| ------------- | --------------- | ------------------ | ----------------------------------------------------------- |
| **Backend**   | REST API 서버   | Rust + Rocket      | [→ README](https://github.com/Omni-News/Omninews_back)      |
| **Frontend**  | 모바일 앱       | Flutter            | [→ README](https://github.com/Omni-News/Omninews_front)     |
| **Web**       | 웹 애플리케이션 | React + TypeScript | [→ README](https://github.com/Omni-News/Omninews_web)       |
| **Scheduler** | 백그라운드 작업 | Rust + Tokio       | [→ README](https://github.com/Omni-News/Omninews_scheduler) |

## 기술 개요

### Backend

- Rust + Rocket 프레임워크로 구현된 REST API 서버
- JWT 기반 인증 및 소셜 로그인 (Google, Kakao, Apple)
- rust-bert + Annoy를 활용한 AI 기반 검색 엔진
- MySQL 데이터베이스

### Frontend

- Flutter로 개발된 크로스 플랫폼 모바일 앱 (iOS/Android)
- Firebase 푸시 알림
- 인앱 결제 (iOS)
- Google Ads 통합

### Web

- React + TypeScript로 개발된 웹 애플리케이션
- Material-UI 기반 반응형 디자인
- Zustand + TanStack Query를 활용한 상태 관리

### Scheduler

- Rust + Tokio 기반 비동기 스케줄러
- 정기적인 뉴스 및 RSS 수집
- 푸시 알림 발송
- AI 임베딩 인덱싱
- Google Gemini를 활용한 뉴스 요약

## 플랫폼별 지원 기능

| 기능      | iOS | Android | Web  |
| --------- | --- | ------- | ---- |
| 뉴스 보기 | ✅  | ✅      | ✅   |
| RSS 구독  | ✅  | ✅      | ✅   |
| 검색      | ✅  | ✅      | ✅   |
| 푸시 알림 | ✅  | ✅      | 제한 |
| 인앱 구매 | ✅  | 무료    | 제한 |
| 광고      | ✅  | ✅      | 없음 |

## 라이선스

Copyright © 2024-2025 강(kang). All rights reserved.
