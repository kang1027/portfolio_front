---
title: "클린 코드 독후감"
description: "로버트 C. 마틴의 클린 코드를 읽고 느낀 점."
date: "2024-01-05"
category: "review"
tags: ["book", "clean-code", "programming"]
author: "Kang"
---

# 클린 코드 독후감

로버트 C. 마틴(Uncle Bob)의 "클린 코드"를 읽고 느낀 점을 공유합니다.

## 책 소개

클린 코드는 읽기 쉽고 유지보수하기 좋은 코드를 작성하는 방법을 다룹니다.

## 인상 깊었던 부분

### 1. 의미 있는 이름

> "코드는 명확해야 한다. 변수, 함수, 클래스 이름은 그 존재 이유와 수행 기능을 드러내야 한다."

좋은 예:
```javascript
// Bad
const d = new Date();

// Good
const currentDate = new Date();
const createdAt = new Date();
```

### 2. 함수는 작게

한 가지 일만 하는 작은 함수를 작성하라는 원칙이 인상적이었습니다.

```javascript
// Bad
function processUser(user) {
  // 사용자 검증
  // 데이터베이스 저장
  // 이메일 발송
  // 로그 기록
}

// Good
function processUser(user) {
  validateUser(user);
  saveToDatabase(user);
  sendEmail(user);
  logActivity(user);
}
```

### 3. 주석보다 코드로 표현

주석을 쓰기 전에, 코드 자체로 의도를 표현할 수 있는지 고민해보라는 조언이 좋았습니다.

## 실무 적용

이 책을 읽은 후 실무에서 적용한 것들:
1. PR 리뷰 시 클린 코드 원칙 체크
2. 팀 코딩 컨벤션 개선
3. 레거시 코드 리팩토링

## 추천 대상

- 주니어 개발자: 좋은 코딩 습관 형성
- 시니어 개발자: 코드 리뷰 기준 정립
- 팀 리더: 팀 코딩 컨벤션 수립

## 마치며

클린 코드는 한 번 읽고 끝나는 책이 아닙니다. 계속해서 돌아와 읽으며 실천해야 하는 책입니다.

⭐️ **평점: 5/5**
