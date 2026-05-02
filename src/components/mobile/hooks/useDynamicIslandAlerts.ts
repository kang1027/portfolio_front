import { useEffect, useState } from "react";
import { nowPlayingService, type NowPlayingResponse } from "~/services/nowPlayingService";

export interface IslandAlert {
  kind: "music";
  title: string;
  subtitle: string;
  art?: string;
}

export function useDynamicIslandAlerts(): IslandAlert | null {
  const [alert, setAlert] = useState<IslandAlert | null>(null);

  useEffect(() => {
    return nowPlayingService.subscribe((np: NowPlayingResponse | null) => {
      if (np?.isPlaying && np.track) {
        setAlert({
          kind: "music",
          title: np.track.title ?? "",
          subtitle: np.track.artist ?? "",
          art: "artwork" in np.track ? np.track.artwork : undefined
        });
      } else {
        setAlert(null);
      }
    });
  }, []);

  return alert;
}
