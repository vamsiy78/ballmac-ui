"use client";
import * as React from "react";
import { RadioGroup, RadioGroupOption } from "@/components/ballmac/radio-group";
export default function RadioGroupDemo() {
  const [value, setValue] = React.useState("weekly");
  return (
    <div className="w-full max-w-sm">
      <p className="mb-1 text-sm font-semibold">Digest frequency</p>
      <p className="mb-4 text-sm text-muted-foreground">
        Choose when to get your project summary.
      </p>
      <RadioGroup
        aria-label="Digest frequency"
        value={value}
        onValueChange={setValue}
      >
        <RadioGroupOption
          value="daily"
          title="Daily"
          description="A brief update every morning"
        />
        <RadioGroupOption
          value="weekly"
          title="Weekly"
          description="A focused summary each Monday"
        />
        <RadioGroupOption
          value="off"
          title="Off"
          description="Only important account notices"
        />
      </RadioGroup>
    </div>
  );
}
