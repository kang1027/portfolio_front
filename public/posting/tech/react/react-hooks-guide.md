---
title: "React Hooks 완벽 가이드"
description: "React Hooks의 동작 원리와 활용법을 상세히 알아봅니다."
date: "2024-01-15"
category: "tech"
tags: ["react", "hooks", "javascript"]
author: "Kang"
---

# React Hooks 완벽 가이드

React Hooks는 함수형 컴포넌트에서 상태 관리와 생명주기 기능을 사용할 수 있게 해주는 강력한 기능입니다.

## useState

가장 기본적인 Hook으로, 컴포넌트의 상태를 관리합니다.

```javascript
const [count, setCount] = useState(0);

function increment() {
  setCount(count + 1);
}
```

## useEffect

사이드 이펙트를 처리하기 위한 Hook입니다.

```javascript
useEffect(() => {
  document.title = `Count: ${count}`;
}, [count]);
```

## Custom Hooks

재사용 가능한 로직을 만들 수 있습니다.

```javascript
function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue);

  const increment = () => setCount(c => c + 1);
  const decrement = () => setCount(c => c - 1);

  return { count, increment, decrement };
}
```

## 마치며

React Hooks를 잘 활용하면 코드의 재사용성과 가독성을 크게 향상시킬 수 있습니다.
