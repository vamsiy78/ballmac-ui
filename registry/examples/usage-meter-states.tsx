import { UsageMeter } from "@/components/ballmac/usage-meter";
export default function UsageMeterStates() {
  return (
    <div className="grid w-full max-w-md gap-4">
      <UsageMeter label="API requests" unit="k" used={86} limit={100} note="Nearing the limit" />
      <UsageMeter label="Team seats" used={12} limit={10} note="Add seats to invite more" />
      <UsageMeter label="Automations" variant="ring" used={38} limit={100} unit="runs" note="Plenty left" />
    </div>
  );
}
