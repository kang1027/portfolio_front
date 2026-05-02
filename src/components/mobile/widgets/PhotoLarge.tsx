import { useEffect, useState } from "react";
import WidgetFrame from "./WidgetFrame";

const VERSION = "v2";
const PHOTOS = [
  `/img/photos/1.png?${VERSION}`,
  `/img/photos/2.png?${VERSION}`,
  `/img/photos/3.png?${VERSION}`
];

export default function PhotoLarge() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setI((p) => (p + 1) % PHOTOS.length);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <WidgetFrame size="large">
      <div className="relative w-full h-full">
        {PHOTOS.map((src, idx) => (
          <img
            key={src}
            src={src}
            alt=""
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
            style={{ opacity: idx === i ? 1 : 0 }}
          />
        ))}
      </div>
    </WidgetFrame>
  );
}
