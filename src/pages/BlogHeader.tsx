import { Link } from "react-router-dom";

export default function BlogHeader() {
  const dark = useStore((state) => state.dark);
  const toggleDark = useStore((state) => state.toggleDark);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-c-300 bg-c-50/80 backdrop-blur-lg">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo & Title */}
          <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <span className="i-fa-solid:home text-2xl text-c-700" />
            <span className="text-lg font-semibold text-c-900">Back to Portfolio</span>
          </Link>

          {/* Right side - Dark mode toggle */}
          <button
            onClick={toggleDark}
            className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-c-200 transition-colors"
            aria-label="Toggle dark mode"
          >
            {dark ? (
              <span className="i-fa-solid:sun text-xl text-yellow-500" />
            ) : (
              <span className="i-fa-solid:moon text-xl text-c-700" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
