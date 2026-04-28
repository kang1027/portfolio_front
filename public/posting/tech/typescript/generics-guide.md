---
title: "TypeScript Generics 완벽 가이드"
description: "TypeScript의 제네릭을 활용한 타입 안전한 재사용 가능한 코드 작성법."
date: "2024-01-18"
category: "tech"
tags: ["typescript", "generics", "types"]
author: "Kang"
---

# TypeScript Generics 완벽 가이드

Generics는 TypeScript에서 재사용 가능한 컴포넌트를 만들 수 있게 해주는 강력한 기능입니다.

## 기본 개념

가장 간단한 제네릭 함수입니다.

```typescript
// Generic function
function identity<T>(arg: T): T {
  return arg;
}

// Usage
const num = identity<number>(42);
const str = identity<string>("hello");
const auto = identity(true); // Type inference
```

## 제네릭 인터페이스

재사용 가능한 인터페이스를 만들 수 있습니다.

```typescript
interface Box<T> {
  value: T;
}

const numberBox: Box<number> = { value: 42 };
const stringBox: Box<string> = { value: "hello" };

// Generic array wrapper
interface List<T> {
  items: T[];
  add(item: T): void;
  remove(item: T): void;
  get(index: number): T | undefined;
}
```

## 제약 조건

제네릭 타입에 제약을 걸 수 있습니다.

```typescript
// Constraint: T must have length property
interface Lengthwise {
  length: number;
}

function logLength<T extends Lengthwise>(arg: T): T {
  console.log(arg.length);
  return arg;
}

logLength("hello"); // OK
logLength([1, 2, 3]); // OK
logLength({ length: 10, value: 3 }); // OK
// logLength(42); // Error: number doesn't have length
```

## 실전 예제

API 응답을 처리하는 제네릭 함수입니다.

```typescript
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

async function fetchData<T>(url: string): Promise<ApiResponse<T>> {
  const response = await fetch(url);
  const data = await response.json();

  return {
    data: data as T,
    status: response.status,
    message: response.statusText
  };
}

// Usage
interface User {
  id: number;
  name: string;
  email: string;
}

const userResponse = await fetchData<User>("/api/user/1");
// userResponse.data is typed as User
```

## 제네릭 클래스

타입 안전한 데이터 구조를 만들 수 있습니다.

```typescript
class Stack<T> {
  private items: T[] = [];

  push(item: T): void {
    this.items.push(item);
  }

  pop(): T | undefined {
    return this.items.pop();
  }

  peek(): T | undefined {
    return this.items[this.items.length - 1];
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }
}

const numberStack = new Stack<number>();
numberStack.push(1);
numberStack.push(2);
console.log(numberStack.pop()); // 2
```

## 고급 패턴

여러 타입 파라미터를 사용한 복잡한 패턴입니다.

```typescript
// Key-value pair
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const person = {
  name: "John",
  age: 30
};

const name = getProperty(person, "name"); // string
const age = getProperty(person, "age"); // number
// getProperty(person, "email"); // Error: "email" doesn't exist
```

## 마치며

Generics를 잘 활용하면 타입 안전성을 유지하면서도 유연한 코드를 작성할 수 있습니다.
