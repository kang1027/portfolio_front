import React from "react";
import { websites, wallpapers } from "~/configs";
import { checkURL } from "~/utils";
import type { SiteSectionData, SiteData } from "~/types";

interface SafariState {
  goURL: string;
  currentURL: string;
}

interface SafariProps {
  width?: number;
}

interface NavProps {
  width: number;
  setGoURL: (url: string) => void;
}

interface NavSectionProps extends NavProps {
  section: SiteSectionData;
}

interface BlockedEmbedPageProps {
  url: string;
  openExternalURL: (url: string) => void;
}

const blockedEmbedHosts = [
  "aave.com",
  "admob.google.com",
  "appstoreconnect.apple.com",
  "claude.ai",
  "clerk.com",
  "cloudflare.com",
  "discord.com",
  "firebase.google.com",
  "github.com",
  "gmx.io",
  "hyperliquid.xyz",
  "instagram.com",
  "notion.so",
  "play.google.com",
  "trello.com",
  "x.com"
];

const getURLHost = (url: string): string => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
};

const isEmbedBlockedURL = (url: string): boolean => {
  const host = getURLHost(url);

  return blockedEmbedHosts.some((blockedHost) => {
    return host === blockedHost || host.endsWith(`.${blockedHost}`);
  });
};

const BlockedEmbedPage = ({ url, openExternalURL }: BlockedEmbedPageProps) => {
  const host = getURLHost(url) || url;

  return (
    <div className="safari-content w-full flex-center bg-c-100 text-c-700">
      <div className="w-full max-w-md px-8 text-center">
        <div className="mx-auto size-14 rounded-2xl flex-center bg-c-200 text-c-700">
          <span className="i-ion:open-outline text-3xl" />
        </div>
        <div className="mt-5 text-2xl font-bold text-c-900">새 창에서 열어야 함</div>
        <div className="mt-3 text-sm leading-6 text-c-600">
          {host}가 내장 브라우저 표시를 막고 있음.
        </div>
        <button
          type="button"
          className="mt-6 h-9 px-5 rounded-md bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600"
          onClick={() => openExternalURL(url)}
        >
          새 창 열기
        </button>
      </div>
    </div>
  );
};

const NavSection = ({ width, section, setGoURL }: NavSectionProps) => {
  const grid = width < 640 ? "grid-cols-4" : "grid-cols-9";

  return (
    <div className="mx-auto w-full max-w-screen-md" p="t-8 x-4">
      <div className="font-medium ml-2" text="xl sm:2xl">
        {section.title}
      </div>
      <div className={`mt-3 grid grid-flow-row ${grid} gap-y-4`}>
        {section.sites.map((site: SiteData) => (
          <div key={`safari-nav-${site.id}`} className="flex flex-col items-center">
            <div className="size-16 rounded-md overflow-hidden flex-shrink-0 cursor-pointer">
              {site.img ? (
                <img
                  src={site.img}
                  alt={site.title}
                  title={site.title}
                  className="size-full object-cover"
                  onClick={
                    site.inner ? () => setGoURL(site.link) : () => window.open(site.link)
                  }
                />
              ) : (
                <div
                  className="size-full flex-center cursor-default text-black bg-white"
                  onClick={
                    site.inner ? () => setGoURL(site.link) : () => window.open(site.link)
                  }
                >
                  <span text-lg>{site.title}</span>
                </div>
              )}
            </div>
            <span className="mt-2 text-sm text-center leading-tight max-w-20">
              {site.title}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const numTracker = Math.floor(Math.random() * 99 + 1);

const NavPage = ({ width, setGoURL }: NavProps) => {
  const dark = useStore((state) => state.dark);

  const grid = width < 640 ? "grid-cols-4" : "grid-cols-8";
  const span = width < 640 ? "col-span-3" : "col-span-7";

  return (
    <div
      className="w-full safari-content overflow-y-scroll bg-center bg-cover text-c-black"
      style={{
        backgroundImage: `url(${dark ? wallpapers.night : wallpapers.day})`
      }}
    >
      <div className="w-full min-h-full pt-8 bg-c-100/80 backdrop-blur-2xl">
        {/* Favorites */}
        <NavSection section={websites.favorites} setGoURL={setGoURL} width={width} />

        {/* Projects */}
        <NavSection section={websites.projects} setGoURL={setGoURL} width={width} />

        {/* Frequently Visited */}
        <NavSection section={websites.freq} setGoURL={setGoURL} width={width} />

        {/* Privacy Report */}
        <div className="mx-auto w-full max-w-screen-md" p="t-8 x-4 b-16">
          <div font="medium" text="xl sm:2xl">
            Privacy Report
          </div>
          <div
            className={`h-16 w-full mt-4 grid ${grid} shadow-md rounded-xl text-sm`}
            bg="gray-50/70 dark:gray-600/50"
          >
            <div className="col-start-1 col-span-1 flex-center space-x-2">
              <span className="i-fa-solid:shield-alt text-2xl" />
              <span className="text-xl">{numTracker}</span>
            </div>
            <div className={`col-start-2 ${span} hstack px-2`}>
              In the last seven days, Safari has prevent {numTracker} tracker from
              profiling you.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const NoInternetPage = () => {
  const dark = useStore((state) => state.dark);

  return (
    <div
      className="w-full safari-content bg-blue-50 overflow-y-scroll bg-center bg-cover"
      style={{
        backgroundImage: `url(${dark ? wallpapers.night : wallpapers.day})`
      }}
    >
      <div className="w-full h-full pb-10 backdrop-blur-2xl flex-center text-c-600 bg-c-100/80">
        <div className="text-center">
          <div className="text-2xl font-bold">You Are Not Connected to the Internet</div>
          <div className="pt-4 text-sm">
            This page can't be displayed because your computer is currently offline.
          </div>
        </div>
      </div>
    </div>
  );
};

const Safari = ({ width }: SafariProps) => {
  const wifi = useStore((state) => state.wifi);
  const safariRequest = useStore((state) => state.safariRequest);

  const normalizeURL = useCallback((rawUrl: string): string => {
    let url = rawUrl;
    const isValid = checkURL(url);

    if (isValid) {
      if (url.substring(0, 7) !== "http://" && url.substring(0, 8) !== "https://")
        url = `https://${url}`;
    } else if (url !== "") {
      url = `https://www.bing.com/search?q=${url}`;
    }

    return url;
  }, []);

  const [state, setState] = useState<SafariState>(() => {
    const initialUrl = safariRequest ? normalizeURL(safariRequest.url) : "";
    return {
      goURL: initialUrl,
      currentURL: initialUrl
    };
  });

  const setGoURL = useCallback(
    (url: string) => {
      const nextUrl = normalizeURL(url);

      setState({
        goURL: nextUrl,
        currentURL: nextUrl
      });
    },
    [normalizeURL]
  );

  useEffect(() => {
    if (!safariRequest) return;

    setGoURL(safariRequest.url);
  }, [safariRequest, setGoURL]);

  const resetURL = (): void => {
    setState({
      goURL: "",
      currentURL: ""
    });
  };

  const pressURL = (e: React.KeyboardEvent) => {
    const keyCode = e.key;
    if (keyCode === "Enter") setGoURL((e.target as HTMLInputElement).value);
  };

  const openExternalURL = (url: string): void => {
    if (url === "") return;

    window.open(url, "_blank", "noopener,noreferrer");
  };

  const copyCurrentURL = (): void => {
    if (state.goURL === "") return;

    navigator.clipboard?.writeText(state.goURL).catch(() => {});
  };

  const buttonColor = state.goURL === "" ? "text-c-400" : "text-c-700";
  const grid = (width as number) < 640 ? "grid-cols-2" : "grid-cols-3";
  const hideLast = (width as number) < 640 ? "hidden" : "flex";
  const isEmbedBlocked = isEmbedBlockedURL(state.goURL);

  return (
    <div className="w-full h-full">
      {/* browser topbar */}
      <div className={`h-10 grid ${grid} items-center bg-c-white`}>
        <div className="flex px-2">
          <button className={`safari-btn w-7 ${buttonColor}`} onClick={resetURL}>
            <span className="i-jam:chevron-left text-xl" />
          </button>
          <button className="safari-btn w-7 text-c-400">
            <span className="i-jam:chevron-right text-xl" />
          </button>
          <button className="safari-btn w-9 ml-3 text-c-700">
            <span className="i-bi:layout-sidebar text-sm" />
          </button>
        </div>
        <div className="hstack space-x-2 px-2">
          <button className="safari-btn w-9 -ml-10 text-c-400">
            <span className="i-fa-solid:shield-alt text-sm" />
          </button>
          <input
            type="text"
            value={state.currentURL}
            onChange={(e) => setState({ ...state, currentURL: e.target.value })}
            onKeyPress={pressURL}
            className="h-6 w-full p-2 rounded font-normal no-outline text-sm text-center text-c-500 bg-c-200"
            border="2 transparent focus:blue-400 dark:focus:blue-500"
            placeholder="Search or enter website name"
          />
        </div>
        <div className={`${hideLast} justify-end space-x-2 px-2`}>
          <button
            className={`safari-btn w-9 ${buttonColor}`}
            onClick={() => openExternalURL(state.goURL)}
          >
            <span className="i-ion:share-outline" />
          </button>
          <button className={`safari-btn w-9 ${buttonColor}`} onClick={copyCurrentURL}>
            <span className="i-ion:copy-outline" />
          </button>
        </div>
      </div>

      {/* browser content */}
      {wifi ? (
        state.goURL === "" ? (
          <NavPage setGoURL={setGoURL} width={width as number} />
        ) : isEmbedBlocked ? (
          <BlockedEmbedPage url={state.goURL} openExternalURL={openExternalURL} />
        ) : (
          <iframe
            title={"Safari clone browser"}
            src={state.goURL}
            className="safari-content w-full bg-white"
          />
        )
      ) : (
        <NoInternetPage />
      )}
    </div>
  );
};

export default Safari;
