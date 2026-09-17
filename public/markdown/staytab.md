<p class="app-readme-logo"><img src="https://raw.githubusercontent.com/kang1027/StayTab/main/assets/staytab-icon.png" width="112" height="112" alt="StayTab" /></p>

<h1 class="app-readme-title">StayTab</h1>

<p class="app-readme-tagline"><strong>매일 쓰는 앱을 종료한 뒤에도 Command-Tab의 같은 자리에 유지해요.</strong></p>

<p class="app-readme-badges">
  <a href="https://github.com/kang1027/StayTab/releases"><img src="https://img.shields.io/github/v/release/kang1027/StayTab?label=release&amp;color=6D5DFB" alt="Release" /></a>
  <a href="https://github.com/kang1027/StayTab/blob/main/LICENSE"><img src="https://img.shields.io/github/license/kang1027/StayTab?color=6D5DFB" alt="License" /></a>
  <a href="https://www.apple.com/macos"><img src="https://img.shields.io/badge/macOS-13%2B-111111?logo=apple&amp;logoColor=white" alt="macOS" /></a>
  <a href="https://swift.org"><img src="https://img.shields.io/badge/Swift-5-F05138?logo=swift&amp;logoColor=white" alt="Swift" /></a>
</p>

<p class="app-readme-language"><a href="https://github.com/kang1027/StayTab/blob/main/README.md">English</a> · <a href="https://github.com/kang1027/StayTab/blob/main/README.ko.md">한국어</a></p>

<figure class="app-readme-figure">
  <img src="https://raw.githubusercontent.com/kang1027/StayTab/main/assets/switcher-hero.png" width="772" alt="Always와 Running now 영역이 분리된 StayTab 앱 전환기" />
  <figcaption>고정 앱은 Always 영역을 유지해요. 종료된 Docker는 바로 실행할 수 있고, 임시 앱은 Running now에만 표시돼요.</figcaption>
</figure>

## Command-Tab 안의 고정된 내 자리

macOS 기본 앱 전환기는 실행 중인 앱만 기억해요. StayTab은 매일 쓰는 앱을 위한 고정 영역을 만들고, 잠깐 사용하는 앱은 별도의 실행 중 영역에 보여줘요.

- **항상 Command-Tab에 표시.** 고정한 앱은 종료해도 순서와 자리를 유지하고, 선택하면 같은 자리에서 다시 실행해요. `K`, `FI`, `SET` 같은 키로 원하는 앱에 바로 이동할 수 있어요.
- **현재 실행 중.** 나머지 앱은 실행 중일 때만 나타나고, 종료하면 목록에서도 자연스럽게 사라져요. 별도의 등록이나 정리가 필요 없어요.

`⌘Tab`을 짧게 누르면 이전에 사용하던 앱으로 바로 돌아가요. 길게 누르면 StayTab이 열리고, `⌘⇧Tab`으로 반대로 이동하며, 선택한 창에는 즉시 키보드 포커스가 들어가요.

## 고정 영역 설정하기

<figure class="app-readme-figure">
  <img src="https://raw.githubusercontent.com/kang1027/StayTab/main/assets/settings-pinned-apps.png" width="720" alt="StayTab 고정 앱 설정" />
  <figcaption>순서를 한 번 정한 뒤 자동 또는 사용자 지정 한 자에서 세 자까지의 점프 키로 이동할 수 있어요.</figcaption>
</figure>

## 주요 기능

- **고정 앱 목록.** 메일, 브라우저, 터미널, 노트, 음악처럼 매일 쓰는 앱을 예측 가능한 순서로 유지해요.
- **종료된 앱 다시 실행.** 앱을 종료해도 목록에서 사라지지 않으며 같은 자리에서 다시 열 수 있어요.
- **명확한 영역 분리.** 고정 앱과 잠깐 실행한 앱을 서로 다른 영역에 표시해요.
- **빠른 점프 키.** 앱 이름의 가장 짧은 사용 가능 접두사를 최대 세 글자까지 자동 배정하며, 문자와 숫자 조합을 직접 지정할 수도 있어요.
- **macOS다운 전환.** 빠른 `⌘Tab`, 역방향 전환, 창 포커스, Space, 최소화 창, 키보드 입력을 자연스럽게 처리해요.
- **로컬 우선.** 계정, 텔레메트리, 분석, 원격 앱 사용 기록이 없어요.

## 설치

### DMG 다운로드 (권장)

1. [GitHub Releases](https://github.com/kang1027/StayTab/releases/latest)에서 `StayTab-*.dmg`를 내려받아요.
2. DMG를 열고 **StayTab**을 Applications 폴더로 옮겨요.
3. StayTab을 실행하고 macOS가 요청할 때 손쉬운 사용 권한을 허용해요.

공식 바이너리는 Developer ID로 서명하고 Apple 공증을 거쳤어요. 설치 후에는 **설정 → 일반 → 업데이트 확인**에서 서명된 GitHub 릴리스를 자동으로 확인할 수 있어요.

### 소스에서 빌드

Xcode 26 이상이 필요해요. 앱은 macOS 13 Ventura 이상과 Apple Silicon·Intel Mac을 지원해요.

```sh
git clone https://github.com/kang1027/StayTab.git
cd StayTab

xcodebuild \
  -project BetterCmdTab.xcodeproj \
  -scheme "BetterCmdTab Debug" \
  -configuration Debug \
  CODE_SIGNING_ALLOWED=NO \
  build
```

## 권한과 개인정보

StayTab은 전환 단축키를 확인하고 선택한 창에 포커스를 주기 위해 손쉬운 사용 권한을 사용해요. 창 제목, 앱 상태, 최근 사용 순서, 환경설정은 Mac 안에만 남고, 네트워크 통신은 사용자가 켠 GitHub Releases 업데이트 확인뿐이에요. 자세한 내용은 [개인정보 처리](https://github.com/kang1027/StayTab/blob/main/PRIVACY.md)와 [보안 정책](https://github.com/kang1027/StayTab/blob/main/SECURITY.ko.md)을 확인해 주세요.

## 라이선스와 원본

StayTab은 [GNU General Public License v3.0](https://github.com/kang1027/StayTab/blob/main/LICENSE)으로 배포해요.

이 프로젝트는 [@rokartur](https://github.com/rokartur)와 기여자들이 만든 [BetterCmdTab](https://github.com/rokartur/BetterCmdTab)의 수정 배포판이에요. 원본 저작권, 기여 기록, GPL-3.0 권리를 보존하며, BetterCmdTab의 공식 제품이나 보증을 받은 배포판이 아니에요. 변경 및 저작권 고지는 [NOTICE.md](https://github.com/kang1027/StayTab/blob/main/NOTICE.md)에 있어요.
