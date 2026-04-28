---
title: "Rust Ownership 시스템 이해하기"
description: "Rust의 핵심 개념인 Ownership, Borrowing, Lifetime을 깊이 있게 알아봅니다."
date: "2024-01-22"
category: "tech"
tags: ["rust", "ownership", "memory-safety"]
author: "Kang"
---

# Rust Ownership 시스템 이해하기

Rust의 Ownership 시스템은 메모리 안전성을 컴파일 타임에 보장하는 혁신적인 기능입니다.

## Ownership 규칙

Rust의 세 가지 핵심 규칙입니다.

1. 각 값은 하나의 소유자(owner)를 갖습니다
2. 한 번에 하나의 소유자만 존재할 수 있습니다
3. 소유자가 스코프를 벗어나면 값은 drop됩니다

```rust
fn main() {
    let s1 = String::from("hello");
    let s2 = s1; // s1의 소유권이 s2로 이동

    // println!("{}", s1); // Error: s1은 더 이상 유효하지 않음
    println!("{}", s2); // OK
}
```

## Borrowing (참조)

값의 소유권을 이전하지 않고 참조할 수 있습니다.

```rust
fn main() {
    let s1 = String::from("hello");

    let len = calculate_length(&s1);

    println!("'{}' has length {}", s1, len); // s1은 여전히 유효
}

fn calculate_length(s: &String) -> usize {
    s.len()
} // s는 소유권이 없으므로 drop되지 않음
```

## Mutable References

가변 참조를 사용하여 값을 수정할 수 있습니다.

```rust
fn main() {
    let mut s = String::from("hello");

    change(&mut s);

    println!("{}", s); // "hello, world"
}

fn change(s: &mut String) {
    s.push_str(", world");
}
```

## 참조 규칙

중요한 참조 규칙입니다:

```rust
fn main() {
    let mut s = String::from("hello");

    // 규칙 1: 가변 참조는 하나만 가능
    let r1 = &mut s;
    // let r2 = &mut s; // Error: 두 번째 가변 참조

    // 규칙 2: 가변 참조와 불변 참조를 동시에 가질 수 없음
    let r1 = &s; // OK
    let r2 = &s; // OK
    // let r3 = &mut s; // Error: 불변 참조가 존재할 때 가변 참조 불가
}
```

## Lifetime

참조가 유효한 범위를 명시합니다.

```rust
// 가장 긴 lifetime을 반환
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() {
        x
    } else {
        y
    }
}

fn main() {
    let string1 = String::from("long string");
    let string2 = String::from("short");

    let result = longest(string1.as_str(), string2.as_str());
    println!("Longest: {}", result);
}
```

## 실전 예제

Ownership을 활용한 안전한 벡터 처리입니다.

```rust
fn process_data(data: Vec<i32>) -> Vec<i32> {
    data.into_iter()
        .filter(|&x| x > 0)
        .map(|x| x * 2)
        .collect()
}

fn main() {
    let numbers = vec![1, -2, 3, -4, 5];
    let processed = process_data(numbers);

    // numbers는 더 이상 사용할 수 없음 (소유권 이동)
    println!("{:?}", processed); // [2, 6, 10]
}
```

## 스마트 포인터

복잡한 소유권 패턴을 다룹니다.

```rust
use std::rc::Rc;
use std::cell::RefCell;

fn main() {
    // Reference counting
    let data = Rc::new(vec![1, 2, 3]);
    let data1 = Rc::clone(&data);
    let data2 = Rc::clone(&data);

    println!("Count: {}", Rc::strong_count(&data)); // 3

    // Interior mutability
    let value = RefCell::new(5);
    *value.borrow_mut() += 1;
    println!("{}", value.borrow()); // 6
}
```

## 마치며

Ownership 시스템은 처음에는 어렵지만, 메모리 안전성과 동시성 문제를 컴파일 타임에 해결해주는 강력한 도구입니다.
