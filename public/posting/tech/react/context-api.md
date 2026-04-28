---
title: "React Context API 활용하기"
description: "React Context API를 사용한 전역 상태 관리 패턴과 최적화 방법."
date: "2024-01-25"
category: "tech"
tags: ["react", "context", "state-management"]
author: "Kang"
---

# React Context API 활용하기

React Context API는 props drilling 없이 컴포넌트 트리 전체에 데이터를 공유할 수 있는 강력한 기능입니다.

## Context 생성하기

기본적인 Context 생성 방법입니다.

```javascript
import { createContext, useContext, useState } from 'react';

// Create context
const ThemeContext = createContext();

// Provider component
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook for consuming context
function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
```

## 성능 최적화

Context 사용 시 불필요한 리렌더링을 방지하는 방법입니다.

```javascript
// 값을 분리하여 최적화
const ThemeStateContext = createContext();
const ThemeDispatchContext = createContext();

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');

  return (
    <ThemeStateContext.Provider value={theme}>
      <ThemeDispatchContext.Provider value={setTheme}>
        {children}
      </ThemeDispatchContext.Provider>
    </ThemeStateContext.Provider>
  );
}

// 필요한 것만 구독
function useThemeState() {
  return useContext(ThemeStateContext);
}

function useThemeDispatch() {
  return useContext(ThemeDispatchContext);
}
```

## 실전 예제

사용자 인증 Context를 구현한 예제입니다.

```javascript
const AuthContext = createContext();

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication status
    checkAuth().then(user => {
      setUser(user);
      setLoading(false);
    });
  }, []);

  const login = async (credentials) => {
    const user = await api.login(credentials);
    setUser(user);
  };

  const logout = () => {
    api.logout();
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
```

## 주의사항

- Context는 자주 변경되는 값에는 적합하지 않습니다
- 성능이 중요한 경우 상태 관리 라이브러리 고려
- Provider 내부의 값이 변경되면 모든 Consumer가 리렌더링됩니다

## 마치며

Context API는 간단한 전역 상태 관리에 매우 유용합니다. 프로젝트 규모와 요구사항에 맞게 적절히 활용하세요.
