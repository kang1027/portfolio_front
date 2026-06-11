import { nowPlayingService, type NowPlayingResponse } from "~/services/nowPlayingService";

export default function BlogVinyl() {
  const [nowPlaying, setNowPlaying] = useState<NowPlayingResponse | null>(null);

  useEffect(() => {
    return nowPlayingService.subscribe(setNowPlaying);
  }, []);

  const track = nowPlaying?.isPlaying ? nowPlaying.track : null;

  return (
    <div className="blog-vinyl" data-spinning={track ? "true" : "false"}>
      <span className="blog-vinyl-disc" aria-hidden="true">
        {track?.artwork && <img src={track.artwork} alt="" loading="lazy" />}
      </span>
      <div className="blog-vinyl-info" aria-live="polite">
        {track ? (
          <>
            <p className="blog-vinyl-label">지금 흐르는 곡</p>
            {track.url ? (
              <a
                href={track.url}
                target="_blank"
                rel="noopener noreferrer"
                className="blog-vinyl-title"
              >
                {track.title}
              </a>
            ) : (
              <p className="blog-vinyl-title">{track.title}</p>
            )}
            <p className="blog-vinyl-artist">{track.artist}</p>
          </>
        ) : (
          <>
            <p className="blog-vinyl-label">턴테이블</p>
            <p className="blog-vinyl-idle">지금은 조용한 중…</p>
          </>
        )}
      </div>
    </div>
  );
}
