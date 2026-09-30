import { UsageMeter } from "@/components/ballmac/usage-meter";
export default function UsageMeterDemo() {
  return (
    <UsageMeter
      className="max-w-md"
      label="Storage"
      unit="GB"
      limit={100}
      segments={[
        { label: "Images", value: 31.4 },
        { label: "Documents", value: 18.2 },
        { label: "Video", value: 12.6 },
        { label: "Other", value: 4.1 },
      ]}
      note="Resets Oct 1"
      action={<button type="button" className="h-8 rounded-md border px-3 text-[13px] font-medium shadow-xs outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50">Upgrade</button>}
    />
  );
}
