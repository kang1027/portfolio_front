import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Desktop from "~/pages/Desktop";
import Login from "~/pages/Login";
import Boot from "~/pages/Boot";
import AdminSetup from "~/pages/AdminSetup";
import SEO, { SEOProvider } from "~/components/SEO";
import BlogListPage from "~/pages/BlogListPage";
import BlogPostPage from "~/pages/BlogPostPage";

import "@unocss/reset/tailwind.css";
import "uno.css";
import "katex/dist/katex.min.css";
import "~/styles/index.css";

// Portfolio (macOS) Page Component
function PortfolioPage() {
  const [login, setLogin] = useState<boolean>(false);
  const [booting, setBooting] = useState<boolean>(false);
  const [restart, setRestart] = useState<boolean>(false);
  const [sleep, setSleep] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [showAdminSetup, setShowAdminSetup] = useState<boolean>(false);

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

  const handleAdminMode = (admin: boolean) => {
    setIsAdmin(admin);
    if (admin) {
      setShowAdminSetup(true);
    }
  };

  const handleSetupComplete = () => {
    setShowAdminSetup(false);
  };

  const handleSetupSkip = () => {
    setShowAdminSetup(false);
  };

  return (
    <>
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
    </>
  );
}

// Main App Component with Router
export default function App() {
  const dark = useStore((state) => state.dark);

  // Apply dark mode class
  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [dark]);

  return (
    <BrowserRouter>
      <SEOProvider>
        <SEO />
        <Routes>
          <Route path="/" element={<PortfolioPage />} />
          <Route path="/blog" element={<BlogListPage />} />
          <Route path="/blog/:category/:slug" element={<BlogPostPage />} />
        </Routes>
      </SEOProvider>
    </BrowserRouter>
  );
}

const rootElement = document.getElementById("root") as HTMLElement;
const root = createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
