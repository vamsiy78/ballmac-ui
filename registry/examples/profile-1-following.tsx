"use client"

import { Profile1, type Profile1Person } from "@/components/ballmac/blocks/profile-1/profile-1"

const person: Profile1Person = {
  name: "Theo Nakamura",
  handle: "theo",
  headline: "Indie developer making small, fast tools for photographers",
  bio: "I build desktop and web tools that stay out of the way. Every project is open source and every release has notes you can read in a minute.",
  location: "Osaka, Japan",
  joined: "June 2022",
  followers: 4210,
  following: 188,
  isFollowing: true,
  status: "away",
  skills: ["TypeScript", "Rust", "Tauri", "Image processing"],
  links: [{ label: "theo.dev", href: "#" }, { label: "github.com/theo", href: "#" }],
}

export default function Profile1Following() {
  return <Profile1 person={person} defaultTab="activity" onFollow={async () => {}} />
}
