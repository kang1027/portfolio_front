---
title: "Rust Async/Await 비동기 프로그래밍"
description: "Rust의 async/await를 사용한 효율적인 비동기 프로그래밍 패턴."
date: "2024-01-28"
category: "tech"
tags: ["rust", "async", "concurrency"]
author: "Kang"
---

# Rust Async/Await 비동기 프로그래밍

Rust의 async/await는 효율적인 비동기 프로그래밍을 가능하게 하는 zero-cost abstraction입니다.

## 기본 개념

async 함수는 Future를 반환합니다.

```rust
use tokio; // async runtime

async fn hello_world() {
    println!("Hello, async world!");
}

#[tokio::main]
async fn main() {
    hello_world().await;
}
```

## Future 이해하기

Future는 아직 완료되지 않은 계산을 나타냅니다.

```rust
use std::future::Future;
use std::pin::Pin;
use std::task::{Context, Poll};

// Custom Future implementation
struct CounterFuture {
    count: u32,
}

impl Future for CounterFuture {
    type Output = u32;

    fn poll(mut self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<Self::Output> {
        self.count += 1;
        if self.count < 3 {
            cx.waker().wake_by_ref();
            Poll::Pending
        } else {
            Poll::Ready(self.count)
        }
    }
}
```

## 비동기 HTTP 요청

Tokio와 reqwest를 사용한 예제입니다.

```rust
use reqwest;
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize)]
struct User {
    id: u32,
    name: String,
    email: String,
}

async fn fetch_user(id: u32) -> Result<User, reqwest::Error> {
    let url = format!("https://api.example.com/users/{}", id);
    let user = reqwest::get(&url)
        .await?
        .json::<User>()
        .await?;

    Ok(user)
}

#[tokio::main]
async fn main() {
    match fetch_user(1).await {
        Ok(user) => println!("User: {:?}", user),
        Err(e) => eprintln!("Error: {}", e),
    }
}
```

## 동시 실행

여러 비동기 작업을 동시에 실행합니다.

```rust
use tokio;

async fn task1() -> u32 {
    tokio::time::sleep(tokio::time::Duration::from_secs(1)).await;
    1
}

async fn task2() -> u32 {
    tokio::time::sleep(tokio::time::Duration::from_secs(2)).await;
    2
}

#[tokio::main]
async fn main() {
    // 순차 실행 (3초)
    let a = task1().await;
    let b = task2().await;
    println!("Sequential: {} + {} = {}", a, b, a + b);

    // 동시 실행 (2초)
    let (a, b) = tokio::join!(task1(), task2());
    println!("Concurrent: {} + {} = {}", a, b, a + b);
}
```

## Select를 사용한 경쟁

먼저 완료되는 작업을 선택합니다.

```rust
use tokio::time::{sleep, Duration};

async fn process1() -> &'static str {
    sleep(Duration::from_secs(1)).await;
    "Process 1"
}

async fn process2() -> &'static str {
    sleep(Duration::from_secs(2)).await;
    "Process 2"
}

#[tokio::main]
async fn main() {
    tokio::select! {
        result = process1() => {
            println!("First: {}", result);
        }
        result = process2() => {
            println!("First: {}", result);
        }
    }
}
```

## 채널을 사용한 통신

비동기 작업 간 메시지 전달입니다.

```rust
use tokio::sync::mpsc;

#[tokio::main]
async fn main() {
    let (tx, mut rx) = mpsc::channel(32);

    tokio::spawn(async move {
        for i in 0..10 {
            if tx.send(i).await.is_err() {
                println!("Receiver dropped");
                return;
            }
        }
    });

    while let Some(value) = rx.recv().await {
        println!("Received: {}", value);
    }
}
```

## 에러 처리

비동기 코드에서의 에러 처리 패턴입니다.

```rust
use thiserror::Error;

#[derive(Error, Debug)]
enum AppError {
    #[error("Network error: {0}")]
    Network(#[from] reqwest::Error),

    #[error("Parse error: {0}")]
    Parse(String),
}

async fn fetch_and_parse(url: &str) -> Result<String, AppError> {
    let response = reqwest::get(url).await?;
    let text = response.text().await?;

    if text.is_empty() {
        return Err(AppError::Parse("Empty response".to_string()));
    }

    Ok(text)
}

#[tokio::main]
async fn main() {
    match fetch_and_parse("https://example.com").await {
        Ok(data) => println!("Success: {}", data),
        Err(e) => eprintln!("Error: {}", e),
    }
}
```

## 마치며

Rust의 async/await는 타입 안전성을 유지하면서도 효율적인 비동기 프로그래밍을 가능하게 합니다. Tokio 런타임과 함께 사용하면 강력한 비동기 애플리케이션을 만들 수 있습니다.
