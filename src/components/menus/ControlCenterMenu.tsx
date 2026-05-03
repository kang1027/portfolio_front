import React, { useEffect, useState } from "react";
import Slider from "react-rangeslider";
import "react-rangeslider/lib/index.css";
import { music } from "~/configs";
import { nowPlayingService, type NowPlayingResponse } from "~/services/nowPlayingService";
import { audioPreviewService } from "~/services/audioPreviewService";

interface SliderProps {
  icon: string;
  value: number;
  setValue: (value: number) => void;
}

const SliderComponent = ({ icon, value, setValue }: SliderProps) => (
  <div className="slider flex">
    <div className="size-7 flex-center bg-c-100" border="t l b c-300 rounded-l-full">
      <span className={icon} text="xs c-500" />
    </div>
    <Slider
      min={1}
      max={100}
      value={value}
      tooltip={false}
      orientation="horizontal"
      onChange={(v: number) => setValue(v)}
    />
  </div>
);

interface CCMProps {
  toggleControlCenter: () => void;
  toggleAudio: (target: boolean) => void;
  setBrightness: (value: number) => void;
  setVolume: (value: number) => void;
  playing: boolean;
  btnRef: React.RefObject<HTMLDivElement>;
}

export default function ControlCenterMenu({
  toggleControlCenter,
  toggleAudio,
  setBrightness,
  setVolume,
  playing,
  btnRef
}: CCMProps) {
  const controlCenterRef = useRef<HTMLDivElement>(null);
  const [nowPlaying, setNowPlaying] = useState<NowPlayingResponse | null>(null);
  const [useLiveData, setUseLiveData] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [lastTrackId, setLastTrackId] = useState<string>("");

  const { dark, wifi, brightness, bluetooth, airdrop, fullscreen, volume } = useStore(
    (state) => ({
      dark: state.dark,
      wifi: state.wifi,
      brightness: state.brightness,
      bluetooth: state.bluetooth,
      airdrop: state.airdrop,
      fullscreen: state.fullscreen,
      volume: state.volume
    })
  );
  const { toggleWIFI, toggleBluetooth, toggleAirdrop, toggleDark, toggleFullScreen } =
    useStore((state) => ({
      toggleWIFI: state.toggleWIFI,
      toggleBluetooth: state.toggleBluetooth,
      toggleAirdrop: state.toggleAirdrop,
      toggleDark: state.toggleDark,
      toggleFullScreen: state.toggleFullScreen
    }));

  // 오디오 프리뷰 상태 구독
  useEffect(() => {
    const unsubscribe = audioPreviewService.subscribe((audioState) => {
      setIsPlaying(audioState.isPlaying);
    });

    return unsubscribe;
  }, []);

  // 실시간 재생 정보 구독
  useEffect(() => {
    const unsubscribe = nowPlayingService.subscribe((data) => {
      if (data && data.isPlaying && data.track) {
        const trackId = `${data.track.title}-${data.track.artist}`;

        // 곡이 바뀌었는지 확인
        if (trackId !== lastTrackId) {
          setLastTrackId(trackId);

          // previewUrl 설정
          const previewUrl = data.track.previewUrl || music.audio;
          if (previewUrl) {
            audioPreviewService.setSource(previewUrl);
          }
        }

        setNowPlaying(data);
        setUseLiveData(true);
      } else {
        setUseLiveData(false);
      }
    });

    return unsubscribe;
  }, [lastTrackId]);

  useClickOutside(controlCenterRef, toggleControlCenter, [btnRef]);

  // 표시할 곡 정보 결정
  const displayTitle =
    useLiveData && nowPlaying?.track ? nowPlaying.track.title : music.title;
  const displayArtist =
    useLiveData && nowPlaying?.track ? nowPlaying.track.artist : music.artist;
  const displayArtwork =
    useLiveData && nowPlaying?.track ? nowPlaying.track.artwork : music.cover;

  // 재생/일시정지 토글
  const togglePlay = () => {
    audioPreviewService.togglePlay();
  };

  return (
    <div
      className="w-80 h-96 max-w-full shadow-menu p-2.5 text-c-black bg-c-100/70"
      pos="fixed top-9.5 right-0 sm:right-1.5"
      border="~ menu rounded-2xl"
      grid="~ cols-4 rows-5 gap-2"
      ref={controlCenterRef}
    >
      <div className="cc-grid row-span-2 col-span-2 p-2 flex flex-col justify-around">
        <div className="hstack space-x-2">
          <div className={`${wifi ? "cc-btn" : "cc-btn-active"}`} onClick={toggleWIFI}>
            <span className="i-material-symbols:wifi text-base" />
          </div>
          <div p="t-0.5">
            <div className="font-medium leading-4">Wi-Fi</div>
            <div className="cc-text">{wifi ? "Home" : "Off"}</div>
          </div>
        </div>
        <div className="hstack space-x-2">
          <div
            className={`${bluetooth ? "cc-btn" : "cc-btn-active"}`}
            onClick={toggleBluetooth}
          >
            <span className="i-charm:bluetooth text-base" />
          </div>
          <div p="t-0.5">
            <div className="font-medium leading-4">Bluetooth</div>
            <div className="cc-text">{bluetooth ? "On" : "Off"}</div>
          </div>
        </div>
        <div className="hstack space-x-2">
          <div
            className={`${airdrop ? "cc-btn" : "cc-btn-active"}`}
            onClick={toggleAirdrop}
          >
            <span className="i-material-symbols:rss-feed-rounded text-base" />
          </div>
          <div p="t-0.5">
            <div className="font-medium leading-4">AirDrop</div>
            <div className="cc-text">{airdrop ? "Contacts Only" : "Off"}</div>
          </div>
        </div>
      </div>
      <div className="cc-grid col-span-2 p-2 hstack space-x-3">
        <div className={`${dark ? "cc-btn" : "cc-btn-active"}`} onClick={toggleDark}>
          {dark ? (
            <span className="i-ion:moon text-base" />
          ) : (
            <span className="i-ion:sunny text-base" />
          )}
        </div>
        <div font-medium>{dark ? "Dark Mode" : "Light Mode"}</div>
      </div>
      <div className="cc-grid flex-center flex-col">
        <span className="i-bi:brightness-alt-high text-xl" />
        <span text="xs center" font="leading-3.5">
          Keyboard Brightness
        </span>
      </div>
      <div
        className="cc-grid flex-center flex-col cursor-default"
        onClick={() => toggleFullScreen(!fullscreen)}
      >
        {fullscreen ? (
          <span className="i-bi:fullscreen-exit text-base" />
        ) : (
          <span className="i-bi:fullscreen text-base" />
        )}
        <span text="xs center" font="leading-3.5" m="t-1.5">
          {fullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
        </span>
      </div>
      <div className="cc-grid col-span-4 px-2.5 py-2 space-y-1 flex flex-col justify-around">
        <span className="font-medium ml-0.5">Display</span>
        <SliderComponent icon="i-ion:sunny" value={brightness} setValue={setBrightness} />
      </div>
      <div className="cc-grid col-span-4 px-2.5 py-2 space-y-1 flex flex-col justify-around">
        <span className="font-medium ml-0.5">Sound</span>
        <SliderComponent icon="i-ion:volume-high" value={volume} setValue={setVolume} />
      </div>
      <div className="cc-grid col-span-4 hstack space-x-2.5" p="y-2 l-2 r-4">
        <img className="w-12 rounded-lg" src={displayArtwork} alt="cover art" />
        <div className="flex-1 min-w-0 overflow-hidden">
          <div className="font-medium truncate">{displayTitle}</div>
          <div className="cc-text truncate">{displayArtist}</div>
        </div>
        {isPlaying ? (
          <span
            className="i-bi:pause-fill text-2xl cursor-pointer"
            onClick={togglePlay}
          />
        ) : (
          <span className="i-bi:play-fill text-2xl cursor-pointer" onClick={togglePlay} />
        )}
      </div>
    </div>
  );
}
