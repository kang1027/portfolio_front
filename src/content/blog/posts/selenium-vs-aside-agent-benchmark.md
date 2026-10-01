---
title: "Selenium vs aside 벤치마크"
summary: "AI 에이전트에게 웹 검수와 자동화를 시키며 Selenium과 aside를 비교했습니다. 무엇을 시켰고 aside가 어디서 막혔는지 화면과 함께 정리했습니다."
date: "2026-10-01"
group: "dev"
tags: ["AI 에이전트", "브라우저 자동화", "QA", "Selenium", "aside", "벤치마크"]
icon: "i-fa-solid:code"
---

이번 비교에서 가장 기억에 남는 건 점수가 아니었습니다. 저장 버튼을 누르면 서버가 500 에러를 내는 화면을 aside로 검수하던 에이전트가 "저장이 잘 된다"고 보고한 장면이었습니다. 놓친 게 아니라 정반대로 본 겁니다. 왜 그렇게 됐는지는 아래에서 화면과 함께 보여 드리겠습니다.

에이전트에게 웹 검수를 시킬 때 저는 보통 Selenium을 붙여 줍니다. 그러다 [aside](https://aside.com/)라는 AI 브라우저를 쓰게 됐는데, 애초에 에이전트용으로 만든 브라우저라면 검수도 더 잘하지 않을까 궁금해졌습니다. 비교한 자료를 찾아봤지만 aside가 공개한 [벤치마크](https://github.com/at-inc/aside-benchmarks)는 웹 작업을 끝까지 해내는 비율이었고, 웹 테스트 쪽 벤치마크인 [WebTestBench](https://arxiv.org/html/2603.25226v1)는 Playwright만 썼습니다. 검수 용도로 둘을 나란히 놓고 잰 자료는 없어서 직접 해 봤습니다.

## 실험은 이렇게 했습니다

검수 실력을 재려면 정답이 있어야 합니다. 그래서 버그를 일부러 심어 둔 사이트를 세 개 만들었습니다. 결함 27개를 숨긴 커피 용품 쇼핑몰, 움직이는 요소가 많은 SaaS 랜딩·대시보드(결함 16개), 그리고 자동화하기 까다로운 작업 12개를 모아 둔 사내 포털입니다.

에이전트는 Claude Code의 서브에이전트(Claude Opus 5.5)를 썼습니다. 프롬프트는 똑같이 주고 브라우저 도구를 설명하는 부분만 바꿨습니다. 애니메이션 화면을 검수시킬 때 준 프롬프트는 이런 식이었습니다.

```text
You are a senior QA engineer doing a black-box audit of "Pulse",
a SaaS analytics product: a marketing landing page plus a dashboard.
The site has many animated and dynamic components (carousels, counters,
loaders, toasts, modals, menus, feeds), so pay attention to how things
behave over time and during and after interactions.
Report only defects you actually verified through the browser.

BROWSER TOOL FOR THIS AUDIT
(Selenium 쪽) Selenium WebDriver for Python ... Run Chrome in headless mode.
(aside 쪽)    The Aside browser, driven through the `aside repl` CLI ...
```

aside는 쓰는 방법이 두 가지입니다. aside 자체 에이전트에게 일을 통째로 맡기는 `aside exec`와, Playwright 비슷한 스크립트로 브라우저를 직접 조종하는 `aside repl`입니다. 이번에는 `aside repl`을 썼습니다. 판단은 같은 모델이 하고 손만 바꿔야 공정한 비교라고 생각했습니다.

채점은 결과에서 도구 이름을 지운 뒤 다른 에이전트에게 정답지와 대조하게 했습니다. 자동화 작업은 성공 여부를 서버가 직접 기록하게 했습니다. 에이전트는 여러 개를 동시에 띄워 돌렸는데, 한 번은 중간에 인터넷이 끊겨 세 개가 죽는 바람에 다시 돌리기도 했습니다.

## 쇼핑몰 검수: 둘 다 27개를 다 찾았습니다

쇼핑몰에는 장바구니 소계가 수량을 무시하는 계산 오류, 10%라던 쿠폰이 1%만 깎이는 버그, 틀린 비밀번호로도 로그인되는 보안 구멍, 프런트엔드 JS에 그대로 들어 있는 결제 비밀 키 같은 결함 27개를 심었습니다.

![](/blog/selenium-vs-aside-agent-benchmark/sva-brewly-overlay.png)

*빨간 점선이 결제 버튼을 덮고 있는 투명한 레이어입니다. 사람은 이 버튼을 누를 수 없습니다. 소계($72.50)가 줄 합계와 맞지 않는 것도 심어 둔 버그입니다.*

결과는 싱거웠습니다. Selenium과 aside 모두 세 번씩 돌렸고, 세 번 다 27개를 찾았습니다. 오탐도 없었고, 걸린 시간(약 15분)과 토큰도 비슷했습니다.

그래도 과정에서는 차이가 보였습니다. 위 사진의 투명 레이어가 대표적입니다. Selenium은 버튼을 누르려는 순간 "다른 요소가 클릭을 받는다"는 에러를 냅니다. 그 에러 자체가 버그의 증거입니다. aside의 `click()`은 다릅니다. 버튼이 가려져 있으면 에러 없이 스크립트 클릭으로 바꿔서 그냥 눌러 버립니다. 그래서 aside 쪽 에이전트 하나는 처음에 이 버그를 놓쳤다가, 실제 마우스 좌표로 다시 눌러 보고서야 찾았다고 기록을 남겼습니다.

aside 쪽 에이전트들은 빈 기능도 알아서 돌아서 갔습니다. 콘솔 에러를 받을 수 없으니 페이지에 직접 훅을 심었고, 화면 크기를 바꿀 수 없으니 375px짜리 iframe을 띄워 모바일 화면을 확인했습니다. Opus 정도면 도구가 불편해도 결과는 맞춘다는 얘기입니다.

모델을 Haiku 4.5로 낮추자 차이가 났습니다. Selenium 쪽은 결함의 14%, aside 쪽은 7%를 찾았고, 토큰은 aside가 세 배 넘게 썼습니다. aside 쪽 Haiku는 "헤더 링크가 하나도 동작하지 않는다", "모바일 화면을 테스트할 수 없다"를 사이트 결함으로 보고했는데, 둘 다 도구 쪽 문제였습니다.

## 움직이는 화면 검수: 무엇을 시켰나

두 번째 사이트는 캐러셀, 숫자가 올라가는 카운터, 흐르는 공지 티커, 늦게 끼어드는 배너가 있는 랜딩 페이지와 로딩 스켈레톤, 토스트, 모달이 있는 대시보드입니다. 결함은 시간이 지나거나 무언가를 눌러야 보이게 심었습니다.

![](/blog/selenium-vs-aside-agent-benchmark/sva-pulse-landing.png)

*랜딩 페이지입니다. 캐러셀은 첫 번째 슬라이드인데 점은 네 번째가 켜져 있고, "12,480팀이 쓴다"는 문구 아래 카운터는 12,479에서 멈춰 있습니다. 둘 다 심어 둔 결함입니다.*

![](/blog/selenium-vs-aside-agent-benchmark/sva-pulse-layout-shift.gif)

*페이지가 뜨고 1.5초 뒤 배너가 위에서 끼어들면서 화면 전체를 140px 밀어냅니다. 그 순간 버튼을 누르려던 사용자는 엉뚱한 곳을 누르게 됩니다.*

빨간 LIVE 띠는 초당 5번 깜빡이게 만들었습니다. 접근성 기준에서 광과민성 발작 위험으로 보는 초당 3번을 넘는 속도입니다. 실제 깜빡임을 GIF로 넣으면 보는 분께도 위험할 수 있어서 두 장면만 넣었습니다.

![](/blog/selenium-vs-aside-agent-benchmark/sva-pulse-flash.png)

*같은 자리를 0.1초 간격으로 두 번 찍었습니다. 실제 화면에서는 이게 초당 5번 반복됩니다.*

![](/blog/selenium-vs-aside-agent-benchmark/sva-pulse-modal.png)

*초대 모달은 나타나는 애니메이션이 끝나지 않아 투명도 35%에서 멈춰 있습니다.*

결함 16개를 각각 찾았는지 정리하면 이렇습니다. 도구마다 두 번씩 돌렸습니다.

| 심어 둔 결함 | Selenium | aside |
| --- | --- | --- |
| 캐러셀 3번 슬라이드 이미지 깨짐 | 2/2 | 2/2 |
| 캐러셀 점이 한 칸씩 밀림 | 2/2 | 2/2 |
| 카운터가 12,479에서 멈춤 | 2/2 | 2/2 |
| LIVE 띠가 초당 5번 깜빡임 | 2/2 | 2/2 |
| 공지 티커를 멈출 수 없음 | 2/2 | 2/2 |
| 모션 줄이기 설정 무시 | 2/2 | 2/2 |
| 늦게 끼어드는 배너가 화면을 밂 | 2/2 | 1/2 |
| 저장 실패인데 "Saved ✓" 표시 | 2/2 | **0/2** |
| 매출 카드가 계속 로딩 중 | 2/2 | 2/2 |
| 내보내기 버튼 스피너가 안 멈춤 | 2/2 | 2/2 |
| 업로드 진행률이 87%에서 멈춤 | 2/2 | 2/2 |
| 초대 모달이 반투명하게 멈춤 | 2/2 | 2/2 |
| FAQ 답변이 중간에 잘림 | 2/2 | 2/2 |
| Resources 메뉴가 마우스가 닿기 전에 닫힘 | 2/2 | 2/2 |
| 활동 피드가 40개에서 멈춤 | 2/2 | 2/2 |
| 배경 애니메이션 때문에 버벅임 | 2/2 | 1/2 |

aside 쪽도 움직이는 것 자체는 잘 잡았습니다. 깜빡임은 투명도를 0.04초 간격으로 찍어서 속도를 쟀고, 모션 줄이기 설정은 흉내 낼 기능이 없으니 스타일시트를 직접 읽어서 판단했습니다.

문제는 맨 앞에서 말한 저장 버그였습니다.

![](/blog/selenium-vs-aside-agent-benchmark/sva-pulse-save.gif)

*"Save changes"를 누르면 바로 "Saved ✓"가 뜹니다. 실제로는 서버가 500 에러를 냈고, 오른쪽 아래 빨간 에러 토스트는 1.2초 만에 사라집니다.*

Selenium은 브라우저 로그에서 500 응답을 바로 봤습니다. aside에는 네트워크 응답을 받을 방법이 없습니다. `page.on('response')`를 걸어도 이벤트가 오지 않습니다. 토스트는 1.2초 만에 사라지니, 에이전트가 다음 명령을 보내는 사이에 이미 없어졌을 겁니다. 그래서 두 번 모두 "빈 이름도 오류 없이 저장된다"는, 사실과 반대인 보고를 냈습니다.

## 자동화 작업 12개: Selenium이 두 배 넘게 빨랐습니다

세 번째 사이트에는 자동화할 때 자주 막히는 상황을 모아 작업 12개를 만들었습니다.

| 작업 | Selenium | aside |
| --- | --- | --- |
| closed Shadow DOM 안의 프로필 폼 저장 | 2/2 | 2/2 |
| 다른 출처 iframe 안의 결제 폼 입력 | 2/2 | 2/2 |
| 칸반 카드 드래그앤드롭 | 2/2 | 2/2 |
| 무한스크롤 목록에서 237번 티켓 찾아 배정 | 2/2 | 2/2 |
| 직접 만든 콤보박스·달력으로 회의실 예약 | 2/2 | 2/2 |
| 확인 창 두 번을 거쳐 사용자 삭제 | 2/2 | **0/2** |
| 팝업 창에서 OAuth 연결 | 2/2 | 2/2 |
| CSV를 내려받아 합계 제출 | 2/2 | 2/2 |
| 숨겨진 파일 입력으로 업로드 | 2/2 | 2/2 |
| 마우스를 올려야 열리는 메뉴로 API 키 교체 | 2/2 | 2/2 |
| 에디터에 굵은 글씨와 목록 작성 | 2/2 | 2/2 |
| 캔버스 서명 (실제 마우스 입력만 인정) | 2/2 | 2/2 |

aside가 못 한 건 사용자 삭제 하나였습니다. 삭제 버튼을 누르면 브라우저 기본 확인 창이 뜨고, 이어서 DELETE를 입력하는 창이 뜹니다. aside는 이 창을 알아서 닫아 버리고, 수락할 방법을 주지 않습니다.

![](/blog/selenium-vs-aside-agent-benchmark/sva-opsdesk-delete.png)

*같은 버튼을 눌렀을 때의 결과입니다. Selenium은 확인 창을 수락해 temp-user-3을 지웠고, aside는 창이 저절로 닫혀 "Deletion cancelled"로 끝났습니다.*

의외였던 건 closed Shadow DOM입니다. 접근성 트리를 쓰는 aside라면 안쪽 입력창도 보일 줄 알았는데 보이지 않았습니다. 결국 스크린샷을 보고 좌표로 눌러서 해냈습니다.

차이는 시간에서 크게 났습니다. Selenium은 12개를 약 10분에 끝냈고 aside는 약 27분이 걸렸습니다. 토큰도 두 배 넘게 썼습니다. `aside repl`은 호출할 때마다 새 세션을 열고, 끝나면 열었던 탭을 닫아 버립니다. 그래서 에이전트들이 파이프로 REPL 세션 하나를 계속 붙잡아 두는 우회책을 직접 만들어 쓰느라 시간이 걸렸습니다.

## 봇 차단: 여기서는 aside가 압승했습니다

마지막으로 봇 탐지를 시험해 보라고 공개된 페이지들에 한 번씩 들어가 봤습니다. 실제 서비스를 상대로 우회를 시도하거나 CAPTCHA를 푸는 건 하지 않았습니다.

![](/blog/selenium-vs-aside-agent-benchmark/sva-bot-cloudflare.png)

*Cloudflare 챌린지 연습 페이지입니다. Selenium은 "사람인지 확인" 단계에서 멈췄고, aside는 바로 통과했습니다.*

![](/blog/selenium-vs-aside-agent-benchmark/sva-bot-recaptcha.png)

*reCAPTCHA v2 데모입니다. 같은 체크박스를 눌렀는데 Selenium에는 이미지 챌린지가 떴고, aside는 바로 통과했습니다. 이미지 챌린지는 풀지 않았습니다.*

| 테스트 | Selenium headless | Selenium 일반 창 | aside |
| --- | --- | --- | --- |
| [sannysoft](https://bot.sannysoft.com/) 지문 검사 31개 | 4개 실패 | 1개 실패 | 모두 통과 |
| [BrowserScan](https://www.browserscan.net/bot-detection) 판정 | Robot | Robot | Normal |
| [CreepJS](https://abrahamjuliot.github.io/creepjs/) headless 지수 | 100% | 33% | 0% |
| [Cloudflare 챌린지](https://www.scrapingcourse.com/cloudflare-challenge)·[안티봇 챌린지](https://www.scrapingcourse.com/antibot-challenge) 연습 페이지 | 차단 | 차단 | 통과 |
| [reCAPTCHA v2 데모](https://www.google.com/recaptcha/api2/demo) | 이미지 챌린지 | 이미지 챌린지 | 통과 |
| reCAPTCHA v3 점수 | 0.9 | 0.9 | 0.9 |

같은 컴퓨터, 같은 IP였는데도 결과가 갈렸습니다. 차이를 만든 건 브라우저 지문과 자동화 흔적, 그리고 aside가 그대로 쓰는 실제 사용자 프로필입니다. 다만 공개 테스트 페이지에서 나온 결과라, 실제 서비스의 엔터프라이즈 봇 차단이나 대량 요청까지 통과한다는 뜻은 아닙니다. 앞에서 말한 스크립트 클릭도 행동 기반 탐지에는 걸릴 수 있습니다.

## 정리하면

| 실험 | Selenium | aside |
| --- | --- | --- |
| 쇼핑몰 검수 (Opus) | 27/27 | 27/27 |
| 쇼핑몰 검수 (Haiku) | 14% | 7% |
| 움직이는 화면 검수 | 16/16 | 14/16 |
| 자동화 작업 12개 | 12/12, 약 10분 | 11/12, 약 27분 |
| 봇 탐지 테스트 | 대부분 걸림 | 모두 통과 |

aside가 나쁜 도구라는 뜻은 아닙니다. 애초에 로그인된 사이트에서 일을 끝내려고 만든 브라우저라서, 콘솔·네트워크 이벤트나 화면 크기 변경, 확인 창 처리처럼 검수에 필요한 기능이 빠져 있을 뿐입니다(2026년 10월, aside CLI 1.26.916 기준). 반대로 실제 사용자 프로필로 움직이는 특성 덕분에 봇 차단은 쉽게 통과합니다. 검수에서는 단점이던 부분이 봇 차단 앞에서는 장점이 됩니다.

그래서 저는 나눠 쓰려고 합니다. 검수와 CI 자동화는 Selenium(아니면 Playwright)으로 하고, 봇 차단이 걸린 사이트나 로그인 세션이 꼭 필요한 작업만 aside에 맡길 생각입니다.

직접 만든 작은 사이트에서 조건마다 두세 번씩만 돌린 결과라 일반화하기에는 한계가 있습니다. aside 자체 에이전트에게 통째로 맡기는 `aside exec`와 Playwright는 아직 재지 못했습니다. 같은 사이트로 이어서 재 보고 다시 정리하겠습니다.
