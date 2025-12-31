import { wallpapers } from "~/configs";

interface AdminSetupProps {
  onComplete: () => void;
  onSkip: () => void;
}

declare global {
  interface Window {
    MusicKit: any;
  }
}

export default function AdminSetup({ onComplete, onSkip }: AdminSetupProps) {
  const [status, setStatus] = useState<
    "idle" | "loading" | "authorizing" | "saving" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");
  const dark = useStore((state) => state.dark);

  // MusicKit SDK 로드
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://js-cdn.music.apple.com/musickit/v3/musickit.js";
    script.async = true;
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  const handleAuthorize = async () => {
    setStatus("loading");
    setMessage("MusicKit 로딩 중...");

    try {
      // MusicKit이 로드될 때까지 대기
      if (!window.MusicKit) {
        await new Promise((resolve) => {
          const checkInterval = setInterval(() => {
            if (window.MusicKit) {
              clearInterval(checkInterval);
              resolve(true);
            }
          }, 100);
        });
      }

      setStatus("authorizing");
      setMessage("Apple Music 로그인 중...");

      // MusicKit 초기화 (Developer Token 없이 간단하게)
      // 참고: 실제로는 백엔드에서 발급한 Developer Token이 필요하지만,
      // User Token 발급을 위해서는 MusicKit JS를 사용해야 함

      // 임시로 백엔드에 Developer Token 요청
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const tokenResponse = await fetch(`${apiUrl}/api/admin/get-developer-token`);

      if (!tokenResponse.ok) {
        throw new Error("백엔드에서 Developer Token을 가져올 수 없습니다.");
      }

      const data = await tokenResponse.json();

      await window.MusicKit.configure({
        developerToken: data,
        app: {
          name: "Playground macOS",
          build: "1.0.0"
        }
      });

      const music = window.MusicKit.getInstance();
      await music.authorize();

      // User Token 가져오기
      const userToken = music.musicUserToken;

      if (userToken) {
        setMessage("✅ 인증 성공! 백엔드에 저장 중...");
        setStatus("saving");

        // 백엔드로 User Token 전송
        const response = await fetch(`${apiUrl}/api/admin/save-token`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            userToken: userToken
          })
        });

        if (response.ok) {
          setStatus("success");
          setMessage("🎉 User Token이 백엔드에 저장되었습니다!");
        } else {
          const error = await response.text();
          setStatus("error");
          setMessage(`❌ 백엔드 저장 실패: ${error}`);
        }
      } else {
        setStatus("error");
        setMessage("❌ User Token을 가져올 수 없습니다.");
      }
    } catch (error: any) {
      setStatus("error");
      setMessage(`❌ 오류 발생: ${error.message || error}`);
    }
  };

  return (
    <div
      className="size-full flex items-center justify-center"
      style={{
        background: `url(${dark ? wallpapers.night : wallpapers.day}) center/cover no-repeat`
      }}
    >
      <div className="w-[600px] p-8 rounded-3xl backdrop-blur-2xl bg-gray-800/80 shadow-2xl">
        <h1 className="text-3xl font-bold text-white mb-2 text-center">
          🎵 Apple Music 관리자 설정
        </h1>
        <p className="text-gray-300 text-center mb-6">
          방문자에게 실시간 재생 곡을 보여주기 위해 Apple Music을 연동하세요.
        </p>

        <div className="space-y-4">
          {/* Authorization Button */}
          <div className="p-4 bg-white/10 rounded-xl">
            <h3 className="text-white font-semibold mb-2">Apple Music 연동</h3>
            <p className="text-gray-300 text-sm mb-3">
              Apple 계정으로 로그인하면 자동으로 백엔드에 저장됩니다.
            </p>
            <button
              onClick={handleAuthorize}
              disabled={
                status === "authorizing" || status === "saving" || status === "success"
              }
              className={`w-full py-3 rounded-lg font-semibold transition-all ${
                status === "success"
                  ? "bg-green-500 text-white cursor-not-allowed"
                  : status === "authorizing" || status === "saving"
                    ? "bg-gray-500 text-white cursor-wait"
                    : "bg-white text-black hover:bg-gray-200"
              }`}
            >
              {status === "idle" && "Apple Music 로그인"}
              {status === "authorizing" && "로그인 중..."}
              {status === "saving" && "백엔드에 저장 중..."}
              {status === "success" && "✅ 연동 완료"}
              {status === "error" && "다시 시도"}
            </button>
          </div>

          {/* Status Message */}
          {message && (
            <div
              className={`p-4 rounded-xl ${
                status === "success"
                  ? "bg-green-500/20 border border-green-500/50"
                  : status === "error"
                    ? "bg-red-500/20 border border-red-500/50"
                    : "bg-blue-500/20 border border-blue-500/50"
              }`}
            >
              <p className="text-white text-sm">{message}</p>
            </div>
          )}

          {/* Info */}
          <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/30">
            <h4 className="text-white font-semibold text-sm mb-2">ℹ️ 작동 방식</h4>
            <ul className="text-gray-300 text-xs space-y-1">
              <li>1. Apple Music에 로그인하여 User Token 발급</li>
              <li>2. 프론트엔드가 자동으로 백엔드에 토큰 전송</li>
              <li>3. 백엔드가 토큰으로 실시간 재생 정보 가져옴</li>
              <li>4. 방문자는 로그인 없이 당신의 재생 곡 확인 가능</li>
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onSkip}
            className="flex-1 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-all"
          >
            나중에 하기
          </button>
          <button
            onClick={onComplete}
            disabled={status !== "success"}
            className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
              status === "success"
                ? "bg-green-500 hover:bg-green-600 text-white"
                : "bg-gray-500 text-gray-300 cursor-not-allowed"
            }`}
          >
            완료
          </button>
        </div>

        <p className="text-gray-400 text-xs text-center mt-4">
          이 설정은 한 번만 하면 됩니다. User Token은 만료되지 않습니다.
        </p>
      </div>
    </div>
  );
}
