import { archiveRoute } from "@/lib/pro-archive"

// Starter apps (for example beacon-saas.tar.gz), downloaded with the same licence key as the registry.
export const dynamic = "force-dynamic"
export const GET = archiveRoute("starters", "starter")
