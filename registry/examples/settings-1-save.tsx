"use client"

import { Settings1 } from "@/components/ballmac/blocks/settings-1/settings-1"

/** Saving always fails here, to show the error state in the save bar. */
export default function Settings1Save() {
  return (
    <Settings1
      title="Your profile"
      description="Edit anything and press Save changes."
      defaultValues={{ name: "Amara Singh", username: "amara", bio: "", language: "English", timezone: "America/New_York (EST)", theme: "dark" }}
      email="amara@northwind.dev"
      onSave={() => Promise.reject(new Error("offline"))}
    />
  )
}
