"use client";
import { FeedbackWidget } from "@/components/ballmac/feedback-widget";
export default function FeedbackWidgetStates() {
  return (
    <FeedbackWidget triggerLabel="Rate this page" question="Was this page helpful?" requireMessage closeAfter={0} side="bottom" align="start" onSubmit={() => undefined} />
  );
}
