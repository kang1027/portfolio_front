import { useEffect, useState } from "react";
import { nowPlayingService, type NowPlayingResponse } from "~/services/nowPlayingService";

export interface IslandAlert {
  kind: "music";
  title: string;
  subtitle: string;
  art?: string;
}

const sameAlert = (a: IslandAlert | null, b: IslandAlert | null): boolean => {
  if (a === b) return true;
  if (!a || !b) return false;
  return a.title === b.title && a.subtitle === b.subtitle && a.art === b.art;
};

export function useDynamicIslandAlerts(): IslandAlert | null {
  const [alert, setAlert] = useState<IslandAlert | null>(null);

  useEffect(() => {
    return nowPlayingService.subscribe((np: NowPlayingResponse | null) => {
      const next: IslandAlert | null =
        np?.isPlaying && np.track
          ? {
              kind: "music",
              title: np.track.title ?? "",
              subtitle: np.track.artist ?? "",
              art: np.track.artwork || undefined
            }
          : null;
      setAlert((prev) => (sameAlert(prev, next) ? prev : next));
    });
  }, []);

  return alert;
}
