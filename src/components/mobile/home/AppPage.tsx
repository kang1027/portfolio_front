import { apps } from "~/configs";
import { DOCK_IDS, HIDDEN_FROM_GRID_IDS } from "~/configs/mobile";
import AppIcon from "../apps/AppIcon";

const SETTINGS_ITEM = {
  id: "settings",
  title: "Settings",
  img: "icon:i-fa-solid:gear",
  link: undefined as string | undefined
};

export default function AppPage() {
  const gridApps = apps.filter(
    (a) =>
      a.desktop !== false &&
      !DOCK_IDS.includes(a.id as (typeof DOCK_IDS)[number]) &&
      !HIDDEN_FROM_GRID_IDS.includes(a.id as (typeof HIDDEN_FROM_GRID_IDS)[number])
  );
  const items = [...gridApps, SETTINGS_ITEM];

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
