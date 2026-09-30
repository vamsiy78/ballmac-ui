"use client";
import { Globe } from "lucide-react";
import { Combobox, type ComboboxOption } from "@/components/ballmac/combobox";
const zones: ComboboxOption[] = [
  { value: "utc", label: "UTC", group: "Universal", icon: <Globe aria-hidden="true" className="size-4" /> },
  { value: "nyc", label: "New York", description: "GMT−5", group: "Americas", keywords: ["eastern"] },
  { value: "sao", label: "São Paulo", description: "GMT−3", group: "Americas" },
  { value: "ldn", label: "London", description: "GMT+0", group: "Europe" },
  { value: "ber", label: "Berlin", description: "GMT+1", group: "Europe" },
  { value: "tok", label: "Tokyo", description: "GMT+9", group: "Asia" },
];
export default function ComboboxStates() {
  return (
    <div className="grid w-full max-w-sm gap-3">
      <Combobox aria-label="Time zone" options={zones} defaultValue="ldn" placeholder="Pick a time zone" />
      <Combobox aria-label="Required time zone" options={zones} invalid placeholder="Pick a time zone (required)" />
      <Combobox aria-label="Locked time zone" options={zones} defaultValue="utc" disabled />
    </div>
  );
}
