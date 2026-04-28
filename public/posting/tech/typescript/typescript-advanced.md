---
title: "TypeScript 고급 기법"
description: "TypeScript의 고급 타입과 패턴을 활용한 타입 안전성 향상 방법."
date: "2024-01-20"
category: "tech"
tags: ["typescript", "types", "advanced"]
author: "Kang"
---

# TypeScript 고급 기법

TypeScript의 고급 기능을 활용하여 더 안전하고 유지보수하기 쉬운 코드를 작성할 수 있습니다.

## Utility Types

TypeScript는 다양한 유틸리티 타입을 제공합니다.

```typescript
// Partial - 모든 속성을 선택적으로 만듦
type User = {
  id: number;
  name: string;
  email: string;
};

type PartialUser = Partial<User>;

// Pick - 특정 속성만 선택
type UserPreview = Pick<User, "id" | "name">;

// Omit - 특정 속성 제외
type UserWithoutEmail = Omit<User, "email">;
```

## Conditional Types

조건에 따라 다른 타입을 반환할 수 있습니다.

```typescript
type IsString<T> = T extends string ? true : false;

type A = IsString<string>; // true
type B = IsString<number>; // false
```

## Mapped Types

기존 타입을 변환하여 새로운 타입을 만들 수 있습니다.

```typescript
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

type ReadonlyUser = Readonly<User>;
```

## 결론

TypeScript의 고급 기능을 활용하면 런타임 에러를 컴파일 타임에 잡아낼 수 있습니다.
