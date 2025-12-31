import { useState } from "react";

export default function CalendarWidget() {
  const [isHovering, setIsHovering] = useState(false);

  const handleClick = () => {
    // TODO: Contact 모달/창 열기
    console.log("Opening contact form...");
  };

  const handleSocialClick = (url: string, e: React.MouseEvent) => {
    e.stopPropagation(); // 부모의 onClick 방지
    window.open(url, "_blank");
  };

  return (
    <div
      className="fixed top-[620px] left-8 z-[5] cursor-pointer"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={handleClick}
    >
      <div
        className={`relative w-[580px] h-[220px] rounded-3xl overflow-hidden backdrop-blur-3xl bg-gradient-to-br from-white/10 to-white/5 shadow-2xl border border-white/20 transition-all duration-300 ${
          isHovering ? "border-white/40 shadow-xl" : ""
        }`}
      >
        {/* Header */}
        <div className="absolute top-4 left-6 z-10">
          <h3 className="text-white text-lg font-semibold">Get in Touch</h3>
          <p className="text-white/60 text-xs mt-0.5">메시지 보내기</p>
        </div>

        {/* Calendar Icon */}
        <div className="absolute top-4 right-6 z-10">
          <div
            className={`w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center transition-all duration-300 ${
              isHovering ? "bg-white/20 scale-110" : ""
            }`}
          >
            <svg
              className="w-6 h-6 text-white/80"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z" />
              <path d="M12 13h5v5h-5z" />
            </svg>
          </div>
        </div>

        {/* Content Area */}
        <div className="absolute inset-0 flex items-center justify-center pt-8">
          <div className="flex items-center gap-8">
            {/* Contact Methods */}
            <div className="flex gap-4">
              {/* Email */}
              <div
                onClick={(e) => handleSocialClick("mailto:your-email@example.com", e)}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 transition-all duration-300 cursor-pointer hover:scale-105 ${
                  isHovering ? "bg-white/10 border-white/20" : ""
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-blue-400"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                  </svg>
                </div>
                <span className="text-white/70 text-xs font-medium">Email</span>
              </div>

              {/* Instagram */}
              <div
                onClick={(e) =>
                  handleSocialClick("https://instagram.com/yourusername", e)
                }
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 transition-all duration-300 cursor-pointer hover:scale-105 ${
                  isHovering ? "bg-white/10 border-white/20" : ""
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-pink-400"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z" />
                  </svg>
                </div>
                <span className="text-white/70 text-xs font-medium">Instagram</span>
              </div>

              {/* GitHub */}
              <div
                onClick={(e) => handleSocialClick("https://github.com/yourusername", e)}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 transition-all duration-300 cursor-pointer hover:scale-105 ${
                  isHovering ? "bg-white/10 border-white/20" : ""
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-gray-500/20 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-gray-300"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z" />
                  </svg>
                </div>
                <span className="text-white/70 text-xs font-medium">GitHub</span>
              </div>

              {/* Twitter/X */}
              <div
                onClick={(e) => handleSocialClick("https://twitter.com/yourusername", e)}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 transition-all duration-300 cursor-pointer hover:scale-105 ${
                  isHovering ? "bg-white/10 border-white/20" : ""
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-sky-500/20 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-sky-400"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </div>
                <span className="text-white/70 text-xs font-medium">Twitter</span>
              </div>
            </div>
          </div>
        </div>

        {/* Click Indicator */}
        <div
          className={`absolute bottom-4 right-6 flex items-center gap-2 text-white/50 text-xs transition-opacity duration-300 ${
            isHovering ? "opacity-100" : "opacity-0"
          }`}
        >
          <span>Click to contact</span>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
          </svg>
        </div>
      </div>
    </div>
  );
}
