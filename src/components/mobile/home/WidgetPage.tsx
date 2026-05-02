export default function WidgetPage() {
  return (
    <div className="px-4 pt-16 flex flex-col gap-4">
      <div className="rounded-3xl bg-white/10 backdrop-blur-xl h-72 flex-center text-white/70">
        Photo widget (S3)
      </div>
      <div className="rounded-3xl bg-white/10 backdrop-blur-xl h-32 flex-center text-white/70">
        Music widget (S3)
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-3xl bg-white/10 backdrop-blur-xl h-32 flex-center text-white/70">
          Weather
        </div>
        <div className="rounded-3xl bg-white/10 backdrop-blur-xl h-32 flex-center text-white/70">
          Cal
        </div>
      </div>
      <div className="rounded-3xl bg-white/10 backdrop-blur-xl h-32 flex-center text-white/70">
        Contact widget (S3)
      </div>
    </div>
  );
}
