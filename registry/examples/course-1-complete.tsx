"use client"

import { Course1, type Course1Module } from "@/components/ballmac/blocks/course-1/course-1"

const modules: Course1Module[] = [
  { id: "m1", title: "The basics", lessons: [{ id: "a", title: "What you will build", kind: "video", minutes: 5, done: true }, { id: "b", title: "Your first page", kind: "video", minutes: 14, done: true }, { id: "c", title: "Quick check", kind: "quiz", minutes: 4, done: true }] },
  { id: "m2", title: "Going further", lessons: [{ id: "d", title: "Make it yours", kind: "video", minutes: 20, done: true }, { id: "e", title: "Ship it", kind: "project", minutes: 40, done: true }] },
]

export default function Course1Complete() {
  return <Course1 title="Build your first website" subtitle="From a blank page to something you can share, in an afternoon." instructor={{ name: "Sam Okafor", role: "Teacher and designer" }} level="No experience needed" modules={modules} defaultOpenId="m2" />
}
