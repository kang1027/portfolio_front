# SEO 및 링크 미리보기 가이드

## 설정 완료된 내용

### 1. Open Graph 메타태그 (카카오톡, 페이스북 링크 미리보기)

- `index.html`에 Open Graph 메타태그 추가
- 미리보기 이미지: `/public/screenshots/light.png` 사용
- 권장 이미지 크기: 1200x630px
- 포함된 정보:
  - og:title - 페이지 제목
  - og:description - 설명
  - og:image - 미리보기 이미지
  - og:url - 페이지 URL
  - og:type - 웹사이트 타입
  - og:locale - 언어 (ko_KR)

### 2. Twitter Card 메타태그

- Twitter에서 링크 공유 시 미리보기
- summary_large_image 타입으로 큰 이미지 미리보기 활성화

### 3. SEO 기본 메타태그

- title, description, keywords, author 설정
- canonical URL 설정

### 4. 동적 메타태그 관리

- `react-helmet-async` 패키지 설치
- `src/components/SEO.tsx` 컴포넌트 생성
- 페이지별로 다른 메타태그 설정 가능

## 사용 방법

### 기본 사용 (index.html의 기본값 사용)

```tsx
import SEO, { SEOProvider } from "~/components/SEO";

function App() {
  return (
    <SEOProvider>
      <SEO />
      {/* 나머지 컴포넌트 */}
    </SEOProvider>
  );
}
```

### 페이지별 커스텀 메타태그

```tsx
import SEO from "~/components/SEO";

function AboutPage() {
  return (
    <>
      <SEO
        title="About - kang1027's Portfolio"
        description="프론트엔드 개발자 kang1027의 소개 페이지입니다."
        image="https://www.kang1027.com/screenshots/about.png"
        url="https://yourdomain.com/about"
      />
      {/* 페이지 내용 */}
    </>
  );
}
```

## 배포 전 체크리스트

### 1. URL 업데이트 필수

현재 모든 URL이 `https://yourdomain.com/`으로 설정되어 있습니다.
다음 파일들을 업데이트하세요:

**index.html:**

```html
<meta property="og:url" content="https://실제도메인.com/" />
<meta property="og:image" content="https://실제도메인.com/screenshots/light.png" />
<meta property="twitter:url" content="https://실제도메인.com/" />
<meta property="twitter:image" content="https://실제도메인.com/screenshots/light.png" />
<link rel="canonical" href="https://실제도메인.com/" />
```

**src/components/SEO.tsx:**

```tsx
image = "https://실제도메인.com/screenshots/light.png",
url = "https://실제도메인.com/",
```

### 2. 미리보기 이미지 최적화

현재 이미지: `/public/screenshots/light.png`

**권장 사항:**

- 크기: 1200x630px (OG 이미지 권장 비율)
- 포맷: PNG 또는 JPG
- 파일 크기: 1MB 이하
- 텍스트가 있다면 가독성 확인

**이미지 변경 시:**

1. `/public/screenshots/` 폴더에 새 이미지 추가
2. `index.html`과 `SEO.tsx`에서 이미지 경로 업데이트

### 3. 메타태그 테스트

배포 후 다음 도구로 테스트하세요:

**카카오톡 링크 미리보기:**

- <https://developers.kakao.com/tool/debugger/sharing>

**페이스북 디버거:**

- <https://developers.facebook.com/tools/debug/>

**Twitter Card Validator:**

- <https://cards-dev.twitter.com/validator>

**Open Graph 테스트:**

- <https://www.opengraph.xyz/>

### 4. robots.txt 추가 (선택사항)

```txt
# /public/robots.txt
User-agent: *
Allow: /

Sitemap: https://실제도메인.com/sitemap.xml
```

### 5. sitemap.xml 추가 (선택사항)

검색엔진 최적화를 위해 sitemap.xml 추가를 권장합니다.

## 문제 해결

### 링크 미리보기가 안 보이는 경우

1. 배포된 URL이 HTTPS인지 확인
2. 이미지 URL이 절대경로(https://)인지 확인
3. 이미지가 실제로 접근 가능한지 확인 (브라우저에서 직접 URL 열어보기)
4. 캐시 문제일 수 있으니 위의 테스트 도구에서 재크롤링 요청

### 이미지가 너무 큰 경우

```bash
# ImageMagick을 사용한 이미지 리사이즈
convert input.png -resize 1200x630 output.png

# 또는 온라인 도구 사용
# https://www.iloveimg.com/resize-image
```

## 추가 개선 사항

### Google Analytics (이미 설정됨)

- Google Analytics가 이미 설정되어 있습니다 (G-DSL4Z03NFE)

### 구조화된 데이터 (Schema.org)

검색 결과에 더 풍부한 정보를 표시하려면 JSON-LD 추가를 고려하세요:

```html
<script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "kang1027",
    "url": "https://실제도메인.com/",
    "jobTitle": "Developer",
    "description": "Frontend Developer Portfolio"
  }
</script>
```

### 성능 최적화

- 이미지 lazy loading
- 코드 스플리팅
- 번들 크기 최적화
