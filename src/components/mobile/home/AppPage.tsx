import { apps, launchpadApps } from "~/configs";
import { DOCK_IDS, MOBILE_HIDDEN_FROM_GRID_IDS } from "~/configs/mobile";
import AppIcon from "../apps/AppIcon";

export default function AppPage() {
  const gridApps = apps.filter(
    (a) =>
      a.desktop !== false &&
      !DOCK_IDS.includes(a.id as (typeof DOCK_IDS)[number]) &&
      !MOBILE_HIDDEN_FROM_GRID_IDS.includes(
        a.id as (typeof MOBILE_HIDDEN_FROM_GRID_IDS)[number]
      )
  );

  // launchpad-only 앱(OmniNews, ClassicMap, WISEFEE, TokeNest)을 그리드 뒤에 합침
  const items = [
    ...gridApps.map((a) => ({
      id: a.id,
      title: a.title,
      img: a.img,
      link: a.link
    })),
    ...launchpadApps.map((a) => ({
      id: a.id,
      title: a.title,
      img: a.img,
      link: a.link
    }))
  ];

  return (
    <div className="px-6 pt-20 grid grid-cols-4 gap-y-6 gap-x-3">
      {items.map((app) => (
        <AppIcon
          key={app.id}
          id={app.id}
          title={app.title}
          img={app.img}
          link={app.link}
        />
      ))}
    </div>
  );
}
