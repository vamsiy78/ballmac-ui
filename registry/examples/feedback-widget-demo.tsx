"use client";
import { FeedbackWidget } from "@/components/ballmac/feedback-widget";
export default function FeedbackWidgetDemo() {
  return (
    <div className="flex h-[26rem] w-full max-w-sm items-end justify-end">
      <FeedbackWidget defaultOpen side="top" topics={["Bug", "Idea", "Question"]} onSubmit={() => new Promise((r) => setTimeout(r, 800))} />
    </div>
  );
}
