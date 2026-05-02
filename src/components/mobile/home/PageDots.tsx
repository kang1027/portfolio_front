interface Props {
  count: number;
  current: number;
}

export default function PageDots({ count, current }: Props) {
  return (
    <div className="absolute bottom-28 left-1/2 -translate-x-1/2 flex gap-1.5 z-20 pointer-events-none">
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className={`w-1.5 h-1.5 rounded-full ${i === current ? "bg-white" : "bg-white/40"}`}
        />
      ))}
    </div>
  );
}
