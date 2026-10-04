---
title: "Selenium vs Playwright vs aside 브라우저 벤치마크"
summary: "Selenium, Playwright, aside 세 에이전트에게 브라우저 검수를 시켜보았다."
date: "2026-10-01"
group: "dev"
tags: ["AI 에이전트", "브라우저 자동화", "QA", "Selenium", "Playwright", "aside", "벤치마크"]
icon: "i-fa-solid:code"
---

aside가 출시된 이후, 웹 서핑 등 일상적인 작업들을 aside를 시켜오며 브라우저 검수용으로도 좋지 않을까? 라는 생각을 자연스레 하게 되었다.

aside는 Claude와 Codex 플러그인을 제공하기에, 이를 깔아 에이전트 CLI에서 aside를 실행시킬 수 있다.

그래서 비교한 자료부터 찾아봤는데, [aside](https://aside.com/)가 공개한 [벤치마크](https://github.com/at-inc/aside-benchmarks)는 웹 작업을 끝까지 해내는 비율을 잰 것이었고 웹 테스트 쪽 벤치마크인 [WebTestBench](https://arxiv.org/html/2603.25226v1)는 Playwright만 썼다. 에이전트에게 웹 검수를 시킬 때 보통 붙이던 Selenium과 aside를 검수 용도로 나란히 놓고 잰 자료는 없어서, 이번 포스트에서는 직접 사이트를 만들어 비교해 보고자 한다.

처음에는 Selenium과 aside만 비교할 생각이었다. 그런데 `aside repl`이 Playwright 문법을 흉내 낸 도구라서 원조인 Playwright를 빼면 비교가 반쪽이라는 생각이 들었고, 결국 다음 날 같은 사이트로 Playwright까지 돌렸다.

이번 비교를 하며 가장 기억에 남았던 건 사실 점수가 아니었다. 저장 버튼을 누르면 서버가 500 에러를 내는 화면이 있었는데, aside로 이 화면을 검수하던 에이전트가 "저장이 잘 된다"고 보고한 것이다. (놓친 것도 아니고 정반대로 본 것이다.) 왜 이런 일이 생겼는지는 아래에서 화면과 함께 보여주고자 한다.

## 어떻게 비교했나?

검수 실력을 재려면 먼저 정답이 있어야 한다. 이에 버그를 일부러 심어 둔 사이트를 세 개 만들었는데, 결함 27개를 숨긴 커피 용품 쇼핑몰과 움직이는 요소가 많은 SaaS 랜딩·대시보드(결함 16개), 그리고 자동화하기 까다로운 작업 12개를 모아 둔 사내 포털이다.

에이전트는 Claude Code의 서브에이전트(Claude Opus 5.5)를 썼고, 프롬프트는 똑같이 준 채 브라우저 도구를 설명하는 부분만 바꿨다. Selenium과 Playwright는 같은 Chrome을 headless로 띄우게 했으며, 애니메이션 화면을 검수시킬 때 준 프롬프트는 아래와 같다.

```text
You are a senior QA engineer doing a black-box audit of "Pulse",
a SaaS analytics product: a marketing landing page plus a dashboard.
The site has many animated and dynamic components (carousels, counters,
loaders, toasts, modals, menus, feeds), so pay attention to how things
behave over time and during and after interactions.
Report only defects you actually verified through the browser.

BROWSER TOOL FOR THIS AUDIT
(Selenium 쪽)   Selenium WebDriver for Python ... Run Chrome in headless mode.
(Playwright 쪽) Playwright for Python ... chromium.launch(channel="chrome", headless=True)
(aside 쪽)      The Aside browser, driven through the `aside repl` CLI ...
```

aside는 쓰는 방법이 두 가지인데, aside 자체 에이전트에게 일을 통째로 맡기는 `aside exec`와 스크립트로 브라우저를 직접 조종하는 `aside repl`이다. 이번에는 `aside repl`을 썼는데, 판단은 같은 모델이 하고 손만 바꿔야 공정한 비교라고 생각했기 때문이다.

채점은 결과에서 도구 이름을 지운 뒤 다른 에이전트에게 정답지와 대조하게 했고, 자동화 작업은 성공 여부를 서버가 직접 기록하게 했다.

중간에 사고도 두 번 있었다. 첫날은 인터넷이 끊기는 바람에 에이전트 세 개가 죽어서 다시 돌렸다. 둘째 날 Playwright를 돌릴 때는 작업 폴더를 이전 결과 요약이 있는 폴더 안에 두는 바람에 에이전트가 그 요약을 읽어 버렸는데, 한 에이전트가 "이전 결과가 보였다"고 스스로 적어 준 덕에 알아챘다. (스스로 털어놓지 않았다면 그대로 넘어갔을지도 모른다.) 그 실행은 전부 버리고 폴더를 분리해서 다시 돌렸다.

## 쇼핑몰 검수: 셋 다 27개를 다 찾았다

쇼핑몰에는 장바구니 소계가 수량을 무시하는 계산 오류나 10%라던 쿠폰이 1%만 깎이는 버그, 틀린 비밀번호로도 로그인되는 보안 구멍, 프런트엔드 JS에 그대로 들어 있는 결제 비밀 키 같은 결함 27개를 심었다.

![](/blog/selenium-vs-aside-agent-benchmark/sva-brewly-overlay.png)

*빨간 점선이 결제 버튼을 덮고 있는 투명한 레이어로, 사람은 이 버튼을 누를 수 없다. 소계($72.50)가 줄 합계와 맞지 않는 것도 심어 둔 버그다.*

사실 쇼핑몰 검수는 결과만 보면 좀 싱거웠다. 세 도구 모두 세 번씩 돌렸는데, 세 번 다 결함 27개를 전부 찾아냈기 때문이다. 이에 정확도보다는 걸린 시간과 토큰을 비교해 보았다.

| Opus 5.5, 각 3회 | Selenium | Playwright | aside |
| --- | --- | --- | --- |
| 찾은 결함 | 27/27 | 27/27 | 27/27 |
| 걸린 시간 | 약 15분 | 7~11분 | 약 15분 |
| 토큰 | 3.17M | 1.2~1.8M | 3.50M |

차이는 과정에서도 보였는데, 위 사진의 투명 레이어가 대표적이다. Selenium은 버튼을 누르려는 순간 "다른 요소가 클릭을 받는다"는 에러를 내고, Playwright는 버튼이 눌릴 수 있게 될 때까지 기다리다가 "투명 레이어가 클릭을 가로챈다"는 로그와 함께 타임아웃을 낸다. 즉, 둘 다 그 자체로 버그의 증거가 된다. 그런데 aside의 `click()`은 버튼이 가려져 있으면 에러 없이 스크립트 클릭으로 바꿔서 그냥 눌러 버린다. 그래서 aside 쪽 에이전트 하나는 처음에 이 버그를 놓쳤다가, 실제 마우스 좌표로 다시 눌러 보고서야 찾았다고 기록을 남겼다.

aside 쪽 에이전트들은 빠진 기능도 알아서 돌아서 갔다. 콘솔 에러를 받을 수 없으니 페이지에 직접 훅을 심었고, 화면 크기를 바꿀 수 없으니 375px짜리 iframe을 띄워 모바일 화면을 확인했다. Playwright는 이런 게 전부 기본 기능이라 우회할 일이 없었는데, 이 차이가 그대로 시간 차이로 이어진 것이 아닐까 싶다.

그렇다면 모델을 낮추면 어떨까? Haiku 4.5로 낮추자 셋 다 무너졌는데, 그 안에서도 차이가 났다. Selenium은 결함의 14%, Playwright는 10%, aside는 7%를 찾았다. 토큰은 aside가 다른 둘의 세 배 가까이 썼다. 오탐의 모양도 달랐는데, Selenium과 Playwright 쪽은 `/login`처럼 존재하지 않는 주소를 넣어 보고 "로그인 페이지가 없다"고 하는 식이었고 aside 쪽은 "헤더 링크가 하나도 동작하지 않는다"처럼 도구 문제를 사이트 결함으로 착각했다. (헤더 링크는 멀쩡했다.)

## 움직이는 화면은 어떻게 검수했나?

두 번째 사이트는 움직이는 요소가 많은 랜딩 페이지와 대시보드다. 랜딩에는 캐러셀과 숫자가 올라가는 카운터, 흐르는 공지 티커와 늦게 끼어드는 배너를 넣었고 대시보드에는 로딩 스켈레톤과 토스트, 모달을 넣었다. 결함은 모두 시간이 지나거나 무언가를 눌러야 보이게 심었다.

![](/blog/selenium-vs-aside-agent-benchmark/sva-pulse-landing.png)

*랜딩 페이지로, 캐러셀은 첫 번째 슬라이드인데 점은 네 번째가 켜져 있다. "12,480팀이 쓴다"는 문구 아래 카운터도 12,479에서 멈춰 있는데, 둘 다 심어 둔 결함이다.*

![](/blog/selenium-vs-aside-agent-benchmark/sva-pulse-layout-shift.gif)

*페이지가 뜨고 1.5초 뒤 배너가 위에서 끼어들면서 화면 전체를 140px 밀어낸다. 그 순간 버튼을 누르려던 사용자는 엉뚱한 곳을 누르게 된다.*

빨간 LIVE 띠는 초당 5번 깜빡이게 만들었는데, 접근성 기준에서 광과민성 발작 위험으로 보는 초당 3번을 넘는 속도다. 실제 깜빡임을 GIF로 넣으면 보는 사람에게도 위험할 수 있어서 두 장면만 넣었다.

![](/blog/selenium-vs-aside-agent-benchmark/sva-pulse-flash.png)

*같은 자리를 0.1초 간격으로 두 번 찍은 것으로, 실제 화면에서는 이게 초당 5번 반복된다.*

![](/blog/selenium-vs-aside-agent-benchmark/sva-pulse-modal.png)

*초대 모달은 나타나는 애니메이션이 끝나지 않아 투명도 35%에서 멈춰 있다.*

도구마다 두 번씩 돌려서, 결함 16개를 각각 몇 번 찾았는지 표로 옮겨 보았다.

| 심어 둔 결함 | Selenium | Playwright | aside |
| --- | --- | --- | --- |
| 캐러셀 3번 슬라이드 이미지 깨짐 | 2/2 | 2/2 | 2/2 |
| 캐러셀 점이 한 칸씩 밀림 | 2/2 | 2/2 | 2/2 |
| 카운터가 12,479에서 멈춤 | 2/2 | 2/2 | 2/2 |
| LIVE 띠가 초당 5번 깜빡임 | 2/2 | 2/2 | 2/2 |
| 공지 티커를 멈출 수 없음 | 2/2 | 2/2 | 2/2 |
| 모션 줄이기 설정 무시 | 2/2 | 2/2 | 2/2 |
| 늦게 끼어드는 배너가 화면을 밂 | 2/2 | 2/2 | 1/2 |
| 저장 실패인데 "Saved ✓" 표시 | 2/2 | 2/2 | **0/2** |
| 매출 카드가 계속 로딩 중 | 2/2 | 2/2 | 2/2 |
| 내보내기 버튼 스피너가 안 멈춤 | 2/2 | 2/2 | 2/2 |
| 업로드 진행률이 87%에서 멈춤 | 2/2 | 2/2 | 2/2 |
| 초대 모달이 반투명하게 멈춤 | 2/2 | 2/2 | 2/2 |
| FAQ 답변이 중간에 잘림 | 2/2 | 2/2 | 2/2 |
| Resources 메뉴가 마우스가 닿기 전에 닫힘 | 2/2 | 2/2 | 2/2 |
| 활동 피드가 40개에서 멈춤 | 2/2 | 2/2 | 2/2 |
| 배경 애니메이션 때문에 버벅임 | 2/2 | 2/2 | 1/2 |

걸린 시간은 Playwright가 약 8분, Selenium과 aside가 25분 안팎이었다. aside 쪽도 움직이는 것 자체는 잘 잡았는데, 깜빡임은 투명도를 0.04초 간격으로 찍어서 속도를 쟀고 모션 줄이기 설정은 흉내 낼 기능이 없으니 스타일시트를 직접 읽어서 판단했다.

문제는 맨 앞에서 말한 저장 버그였다.

![](/blog/selenium-vs-aside-agent-benchmark/sva-pulse-save.gif)

*"Save changes"를 누르면 바로 "Saved ✓"가 뜨지만, 실제로는 서버가 500 에러를 냈다. 오른쪽 아래 빨간 에러 토스트는 1.2초 만에 사라진다.*

Selenium은 브라우저 로그에서, Playwright는 응답 이벤트로 500을 바로 봤다. 하지만 aside에는 네트워크 응답을 받을 방법이 없어서 `page.on('response')`를 걸어도 이벤트가 오지 않는다. 에러 토스트도 1.2초 만에 사라지니, 에이전트가 다음 명령을 보내는 사이에 이미 없어진 것이 아닐까 싶다. 결국 두 번 모두 "빈 이름도 오류 없이 저장된다"는, 실제와 정반대인 보고를 냈다.

## 자동화 작업 12개: Playwright가 3분 만에 끝냈다

세 번째 사이트에는 자동화할 때 자주 막히는 상황을 모아 작업 12개를 만들었다.

| 작업 | Selenium | Playwright | aside |
| --- | --- | --- | --- |
| closed Shadow DOM 안의 프로필 폼 저장 | 2/2 | 2/2 | 2/2 |
| 다른 출처 iframe 안의 결제 폼 입력 | 2/2 | 2/2 | 2/2 |
| 칸반 카드 드래그앤드롭 | 2/2 | 2/2 | 2/2 |
| 무한스크롤 목록에서 237번 티켓 찾아 배정 | 2/2 | 2/2 | 2/2 |
| 직접 만든 콤보박스·달력으로 회의실 예약 | 2/2 | 2/2 | 2/2 |
| 확인 창 두 번을 거쳐 사용자 삭제 | 2/2 | 2/2 | **0/2** |
| 팝업 창에서 OAuth 연결 | 2/2 | 2/2 | 2/2 |
| CSV를 내려받아 합계 제출 | 2/2 | 2/2 | 2/2 |
| 숨겨진 파일 입력으로 업로드 | 2/2 | 2/2 | 2/2 |
| 마우스를 올려야 열리는 메뉴로 API 키 교체 | 2/2 | 2/2 | 2/2 |
| 에디터에 굵은 글씨와 목록 작성 | 2/2 | 2/2 | 2/2 |
| 캔버스 서명 (실제 마우스 입력만 인정) | 2/2 | 2/2 | 2/2 |
| 걸린 시간 | 약 10분 | 약 3분 | 약 27분 |

aside가 못 한 건 사용자 삭제 하나였다. 삭제 버튼을 누르면 브라우저 기본 확인 창이 뜨고 이어서 DELETE를 입력하는 창이 뜨는데, aside는 이 창을 알아서 닫아 버리고 수락할 방법을 주지 않는다.

![](/blog/selenium-vs-aside-agent-benchmark/sva-opsdesk-delete.png)

*같은 버튼을 눌렀을 때의 결과로, Selenium은 확인 창을 수락해 temp-user-3을 지웠고 aside는 창이 저절로 닫혀 "Deletion cancelled"로 끝났다. (Playwright도 확인 창을 받아서 지웠다.)*

의외였던 건 closed Shadow DOM이다. 셋 다 안쪽 입력창에 바로 입력하지 못했는데, 접근성 트리를 쓰는 aside나 Playwright 스냅샷이라면 보일 줄 알았지만 아니었다. 결국 셋 다 좌표를 누르고 키보드로 입력해서 해냈다.

그럼 시간은 어땠을까? Playwright는 12개를 스크립트 하나로 약 3분 만에 끝냈다. 확인 창과 팝업, 다운로드와 파일 선택이 전부 기본 API에 있어서 막히는 데가 없었던 것이다. Selenium은 약 10분, aside는 약 27분이 걸렸다. `aside repl`은 호출할 때마다 새 세션을 열고 끝나면 탭을 닫아 버려서, 에이전트들이 파이프로 세션을 붙잡아 두는 우회책을 직접 만들어 쓰느라 시간이 걸렸다.

## 봇 차단은 aside가 압승했다

마지막으로 봇 탐지를 시험해 보라고 공개된 페이지들에 한 번씩 들어가 봤다. (실제 서비스를 상대로 우회를 시도하거나 CAPTCHA를 푸는 건 하지 않았다.)

![](/blog/selenium-vs-aside-agent-benchmark/sva-bot-cloudflare.png)

*Cloudflare 챌린지 연습 페이지로, Selenium은 "사람인지 확인" 단계에서 멈췄고 aside는 바로 통과했다. Playwright도 Selenium과 똑같이 멈췄다.*

![](/blog/selenium-vs-aside-agent-benchmark/sva-bot-recaptcha.png)

*reCAPTCHA v2 데모에서 같은 체크박스를 눌렀더니 Selenium에는 이미지 챌린지가 떴고 aside는 바로 통과했다. Playwright에도 이미지 챌린지가 떴는데, 이미지 챌린지는 풀지 않았다.*

| 테스트 | Selenium | Playwright | aside |
| --- | --- | --- | --- |
| [sannysoft](https://bot.sannysoft.com/) 지문 검사 31개 (headless) | 4개 실패 | 4개 실패 | 모두 통과 |
| [BrowserScan](https://www.browserscan.net/bot-detection) 판정 | Robot | Robot | Normal |
| [CreepJS](https://abrahamjuliot.github.io/creepjs/) headless 지수 (headless) | 100% | 100% | 0% |
| [Cloudflare 챌린지](https://www.scrapingcourse.com/cloudflare-challenge)·[안티봇 챌린지](https://www.scrapingcourse.com/antibot-challenge) 연습 페이지 | 차단 | 차단 | 통과 |
| [reCAPTCHA v2 데모](https://www.google.com/recaptcha/api2/demo) | 이미지 챌린지 | 이미지 챌린지 | 통과 |

Selenium과 Playwright는 창을 띄우는 일반 모드로 바꿔도 `navigator.webdriver` 흔적 때문에 결과가 거의 같았다. 같은 컴퓨터에서 결과가 갈린 건 브라우저 지문과 자동화 흔적, 그리고 aside가 그대로 쓰는 실제 사용자 프로필 때문이라고 생각한다. reCAPTCHA v3 점수도 쟀는데, 측정한 날의 네트워크(IP)에 따라 크게 달라져서 표에서는 뺐다. 다만 공개 테스트 페이지에서 나온 결과일 뿐이라, 실제 서비스의 엔터프라이즈 봇 차단이나 대량 요청까지 통과한다는 뜻은 아니다.

## 마무리

| 실험 | Selenium | Playwright | aside |
| --- | --- | --- | --- |
| 쇼핑몰 검수 (Opus) | 27/27 | 27/27 | 27/27 |
| 쇼핑몰 검수 (Haiku) | 14% | 10% | 7% |
| 움직이는 화면 검수 | 16/16 | 16/16 | 14/16 |
| 자동화 작업 12개 | 12/12, 약 10분 | 12/12, 약 3분 | 11/12, 약 27분 |
| 봇 탐지 테스트 | 대부분 걸림 | 대부분 걸림 | 모두 통과 |

검수와 자동화만 보면 Playwright가 가장 나았다. 찾은 결함은 Selenium과 같았지만 시간과 토큰은 절반 이하였는데, 콘솔·네트워크 이벤트와 화면 크기 변경, 확인 창 처리처럼 검수에 필요한 게 전부 기본 기능이라 에이전트가 우회책을 짤 필요가 없었기 때문이다. aside의 `aside repl`은 바로 그 Playwright 문법을 흉내 냈지만 정작 이 기능들이 빠져 있었다(2026년 10월, aside CLI 1.26.916 기준).

다만 aside는 애초에 로그인된 사이트에서 일을 끝내려고 만든 브라우저이고, 실제 사용자 프로필로 움직이는 덕분에 봇 차단은 셋 중 혼자 통과했다. 즉, 검수에서는 단점이던 부분이 봇 차단 앞에서는 장점이 되는 것이다.

이에 나는 앞으로 둘을 나눠 쓰고자 한다. 검수와 CI 자동화는 Playwright로 하고, 봇 차단이 걸린 사이트나 로그인 세션이 꼭 필요한 작업만 aside에 맡길 생각이다.

물론 직접 만든 작은 사이트에서 조건마다 두세 번씩만 돌린 결과라 일반화하기에는 한계가 있다. Playwright는 하루 뒤 다른 네트워크에서 돌렸기 때문에 시간 비교에도 그만큼 오차가 있다. aside 자체 에이전트에게 통째로 맡기는 `aside exec`도 아직 재지 못했는데, 같은 사이트로 이어서 재 보고 다시 정리하고자 한다. (aside에 연결해 둔 Claude 계정이 사용량 제한에 걸려서 미뤄 둔 참이다.) 🙂
