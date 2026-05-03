import WidgetFrame from "./WidgetFrame";

const MONTHS = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC"
];

export default function CalendarSmall() {
  const d = new Date();
  return (
    <WidgetFrame size="small">
      <div className="p-3 h-full flex flex-col">
        <div className="text-red-500 text-xs font-semibold">{MONTHS[d.getMonth()]}</div>
        <div className="text-white text-5xl font-light leading-none mt-1">
          {d.getDate()}
        </div>
        <div className="text-white/70 text-xs mt-auto">No events today</div>
      </div>
    </WidgetFrame>
  );
}
