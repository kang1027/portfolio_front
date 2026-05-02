import { apps } from "~/configs";
import AppIcon from "../apps/AppIcon";

const DOCK_IDS = ["bear", "safari", "contact", "github"];
const HIDDEN_IDS = ["launchpad"];

const SETTINGS_ITEM = {
  id: "settings",
  title: "Settings",
  img: "icon:i-fa-solid:gear",
  link: undefined as string | undefined
};

export default function AppPage() {
  const gridApps = apps.filter(
    (a) => !DOCK_IDS.includes(a.id) && !HIDDEN_IDS.includes(a.id)
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
