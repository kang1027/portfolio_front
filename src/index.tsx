import React from "react";
import { createRoot } from "react-dom/client";

import Desktop from "~/pages/Desktop";
import Login from "~/pages/Login";
import Boot from "~/pages/Boot";
import AdminSetup from "~/pages/AdminSetup";
import SEO, { SEOProvider } from "~/components/SEO";

import "@unocss/reset/tailwind.css";
import "uno.css";
import "katex/dist/katex.min.css";
import "~/styles/index.css";

export default function App() {
  const [login, setLogin] = useState<boolean>(false);
  const [booting, setBooting] = useState<boolean>(false);
  const [restart, setRestart] = useState<boolean>(false);
  const [sleep, setSleep] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [showAdminSetup, setShowAdminSetup] = useState<boolean>(false);

  const dark = useStore((state) => state.dark);

  // Apply dark mode class on initial load
  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [dark]);

  const shutMac = (e: React.MouseEvent): void => {
    e.stopPropagation();
    setRestart(false);
    setSleep(false);
    setLogin(false);
    setBooting(true);
  };

  const restartMac = (e: React.MouseEvent): void => {
    e.stopPropagation();
    setRestart(true);
    setSleep(false);
    setLogin(false);
    setBooting(true);
  };

  const sleepMac = (e: React.MouseEvent): void => {
    e.stopPropagation();
    setRestart(false);
    setSleep(true);
    setLogin(false);
    setBooting(true);
  };

  // 관리자 모드 설정 핸들러
  const handleAdminMode = (admin: boolean) => {
    setIsAdmin(admin);
    if (admin) {
      setShowAdminSetup(true);
    }
  };

  // Admin Setup 완료/스킵 핸들러
  const handleSetupComplete = () => {
    setShowAdminSetup(false);
  };

  const handleSetupSkip = () => {
    setShowAdminSetup(false);
  };

  return (
    <SEOProvider>
      <SEO />
      {booting ? (
        <Boot restart={restart} sleep={sleep} setBooting={setBooting} />
      ) : showAdminSetup ? (
        <AdminSetup onComplete={handleSetupComplete} onSkip={handleSetupSkip} />
      ) : login ? (
        <Desktop
          setLogin={setLogin}
          shutMac={shutMac}
          sleepMac={sleepMac}
          restartMac={restartMac}
        />
      ) : (
        <Login
          setLogin={setLogin}
          setAdminMode={handleAdminMode}
          shutMac={shutMac}
          sleepMac={sleepMac}
          restartMac={restartMac}
        />
      )}
    </SEOProvider>
  );
}

const rootElement = document.getElementById("root") as HTMLElement;
const root = createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
