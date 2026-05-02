import { useStore } from "~/stores";

interface Props {
  id: string;
  title: string;
  img: string;
  link?: string;
}

export default function AppIcon({ id, title, img, link }: Props) {
  const mobileOpenApp = useStore((s) => s.mobileOpenApp);

  const handleClick = () => {
    if (link) {
      window.open(link, "_blank", "noopener,noreferrer");
      return;
    }
    mobileOpenApp(id);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex flex-col items-center gap-1.5 active:scale-90 transition-transform"
    >
      <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-lg shadow-black/30 bg-white/10 flex-center">
        {img.startsWith("icon:") ? (
          <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-500 flex-center">
            <span className={`${img.slice(5)} text-3xl text-white`} />
          </div>
        ) : (
          <img src={img} alt={title} className="w-full h-full object-cover" />
        )}
      </div>
      {title && <span className="text-xs text-white drop-shadow-md">{title}</span>}
    </button>
  );
}
