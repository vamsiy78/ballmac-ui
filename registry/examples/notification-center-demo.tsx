"use client";
import * as React from "react";
import { AtSign, CircleCheck, CreditCard, MessageSquare, UserPlus } from "lucide-react";
import { NotificationCenter, type NotificationItem } from "@/components/ballmac/notification-center";
const initial: NotificationItem[] = [
  { id: "1", group: "Today", title: "Ana commented on Launch plan", description: "“Can we move the review to Thursday?”", time: "5m", icon: <MessageSquare /> },
  { id: "2", group: "Today", title: "Kofi mentioned you in Pricing model", time: "1h", icon: <AtSign /> },
  { id: "3", group: "Today", title: "Build #482 passed", time: "3h", read: true, icon: <CircleCheck /> },
  { id: "4", group: "Earlier", title: "Mei joined the Design team", time: "Yesterday", read: true, icon: <UserPlus /> },
  { id: "5", group: "Earlier", title: "Invoice INV-2041 was paid", time: "Mon", read: true, icon: <CreditCard /> },
];
export default function NotificationCenterDemo() {
  const [items, setItems] = React.useState(initial);
  return (
    <div className="flex h-[30rem] w-full max-w-md justify-end">
      <NotificationCenter
        defaultOpen
        notifications={items}
        onMarkRead={(id) => setItems((l) => l.map((n) => (n.id === id ? { ...n, read: true } : n)))}
        onMarkAllRead={() => setItems((l) => l.map((n) => ({ ...n, read: true })))}
        onDismiss={(id) => setItems((l) => l.filter((n) => n.id !== id))}
      />
    </div>
  );
}
