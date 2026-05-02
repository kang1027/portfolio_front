import CalendarSmall from "../widgets/CalendarSmall";
import ContactMedium from "../widgets/ContactMedium";
import MusicMedium from "../widgets/MusicMedium";
import PhotoLarge from "../widgets/PhotoLarge";
import WeatherSmall from "../widgets/WeatherSmall";

export default function WidgetPage() {
  return (
    <div className="px-4 pt-16 grid grid-cols-4 gap-3 pb-8">
      <PhotoLarge />
      <WeatherSmall />
      <CalendarSmall />
      <MusicMedium />
      <ContactMedium />
    </div>
  );
}
