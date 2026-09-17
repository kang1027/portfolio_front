# 홈서버 인프라

개인 프로젝트를 직접 운영하기 위해 구축한 온프레미스 홈서버

- **현재 구성**: M4 Mac mini · k3s 단일 노드
- **운영 규모**: 워크로드 20여 개, 웹·앱 서비스 6종 상시 운영

## 개요

OmniNews, ClassicMap 같은 개인 서비스는 클라우드 대신 홈서버에서 직접 운영하고 있습니다. 비용을 줄이고 인프라 전반을 직접 제어하기 위해 시작했고, 세 단계에 걸쳐 구성을 바꿔왔습니다.

## 구성 변화

### 1차 — WSL2 + Docker

- WSL2 위에서 서비스를 Docker 컨테이너로 운영
- 공인 IP를 직접 노출해 외부 요청을 받는 구조

### 2차 — Tailscale + Cloudflare Tunnel

- 공인 IP 노출을 없애고 **외부 요청은 Cloudflare Tunnel로만** 받도록 전환
- 서버 **관리 접근은 Tailscale 사설망**으로 분리

### 3차 — M4 Mac mini + k3s

- 서버를 M4 Mac mini로 옮기면서 **k3s 기반 Kubernetes**로 전환
- 기존 Docker Compose 정의를 **Kustomize 매니페스트**로 옮김
- DB는 덤프 기반으로 순차 이관

## 현재 구조

- **DB**: StatefulSet + 로컬 볼륨으로 운영
- **외부 진입**: Caddy와 cloudflared를 묶은 **edge 워크로드 하나**로 모아, 외부 트래픽이 한 곳을 거쳐 각 서비스로 분기
- **규모**: 단일 노드에서 워크로드 20여 개, 웹·앱 서비스 6종 상시 운영

## 기술 스택

- **런타임**: k3s (Kubernetes), Docker
- **구성 관리**: Kustomize
- **네트워크**: Cloudflare Tunnel (cloudflared), Tailscale, Caddy
- **하드웨어**: M4 Mac mini
