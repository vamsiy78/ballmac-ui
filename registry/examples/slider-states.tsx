import { Slider } from "@/components/ballmac/slider";
export default function SliderStates() {
  return (
    <div className="flex w-full max-w-sm items-end gap-8">
      <div className="grid flex-1 gap-6">
        <Slider aria-label="Disabled" defaultValue={[40]} disabled />
        <Slider aria-label="Step by 25" defaultValue={[50]} step={25} showValue />
      </div>
      <div className="flex gap-6 pt-2">
        <Slider aria-label="Bass" orientation="vertical" defaultValue={[70]} />
        <Slider aria-label="Treble" orientation="vertical" defaultValue={[30]} />
      </div>
    </div>
  );
}
