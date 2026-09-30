"use client";
import { NotificationCenter } from "@/components/ballmac/notification-center";
export default function NotificationCenterStates() {
  return (
    <div className="flex h-72 w-full max-w-sm justify-end">
      <NotificationCenter defaultOpen notifications={[]} label="Inbox" emptyText="Nothing new. Enjoy the quiet." />
    </div>
  );
}
