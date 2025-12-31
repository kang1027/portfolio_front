import { useState, useRef } from "react";

export default function PhotoWidget() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 임시 사진 배열 (나중에 실제 파일로 교체)
  const photos = ["/img/photos/1.png", "/img/photos/2.png", "/img/photos/3.png"];

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
    setImageError(false);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
    setImageError(false);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const diff = e.clientX - startX;
    setTranslateX(diff);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);

    // 드래그 거리가 100px 이상이면 슬라이드
    if (translateX > 100) {
      handlePrevious();
    } else if (translateX < -100) {
      handleNext();
    }

    setTranslateX(0);
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      handleMouseUp();
    }
  };

  return (
    <div
      className="fixed top-[350px] left-8 z-[5]"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="relative w-[280px] h-[240px] rounded-3xl overflow-hidden backdrop-blur-3xl bg-gradient-to-br from-white/10 to-white/5 shadow-2xl border border-white/20">
        {/* Photo Counter */}
        <div
          className={`absolute top-3 right-3 px-3 py-1.5 bg-black/30 backdrop-blur-sm rounded-full z-10 transition-opacity duration-300 ${
            isHovering ? "opacity-100" : "opacity-0"
          }`}
        >
          <span className="text-white/70 text-xs">
            {currentIndex + 1} / {photos.length}
          </span>
        </div>

        {/* Photo Container */}
        <div
          ref={containerRef}
          className="absolute inset-0 flex items-center justify-center cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        >
          <div
            className="relative w-full h-full flex items-center justify-center transition-transform duration-300 ease-out"
            style={{
              transform: `translateX(${translateX}px)`
            }}
          >
            {/* Current Photo */}
            <div className="w-full h-full flex items-center justify-center">
              {!imageError ? (
                <img
                  src={photos[currentIndex]}
                  alt={`Photo ${currentIndex + 1}`}
                  className="w-full h-full object-cover select-none"
                  draggable={false}
                  onError={() => setImageError(true)}
                />
              ) : (
                /* Placeholder for missing images */
                <div className="flex items-center justify-center text-white/30">
                  <div className="text-center">
                    <svg
                      className="w-16 h-16 mx-auto mb-2"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                    </svg>
                    <p className="text-sm">No photo available</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div
          className={`absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-3 z-20 transition-opacity duration-300 ${
            isHovering ? "opacity-100" : "opacity-0"
          }`}
        >
          <button
            onClick={handlePrevious}
            className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm border border-white/20 text-white/90 hover:text-white hover:bg-black/40 transition-all flex items-center justify-center"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
            </svg>
          </button>

          {/* Dots Indicator */}
          <div className="flex gap-1.5">
            {photos.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? "bg-white w-6"
                    : "bg-white/40 hover:bg-white/60"
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm border border-white/20 text-white/90 hover:text-white hover:bg-black/40 transition-all flex items-center justify-center"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
