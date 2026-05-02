import { apps } from "~/configs";
import { DOCK_IDS } from "~/configs/mobile";
import AppIcon from "../apps/AppIcon";

export default function MobileDock() {
  const dockApps = DOCK_IDS.map((id) => apps.find((a) => a.id === id)).filter(
    (a): a is NonNullable<typeof a> => Boolean(a)
  );

  return (
    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-[92%] max-w-[420px] z-20">
      <div className="rounded-3xl px-3 py-2.5 bg-white/15 backdrop-blur-2xl flex justify-around">
        {dockApps.map((app) => (
          <AppIcon key={app.id} id={app.id} title="" img={app.img} link={app.link} />
        ))}
      </div>
    </div>
  );
}
