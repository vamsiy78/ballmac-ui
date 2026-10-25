import { archiveFiles, DATA_VERSION, itemNames, registryFiles } from "./generated/pro"
import { createProStore } from "./pro-store-core"

// The private Pro build, read from R2 (see pro-store-core.ts), bound to the tables this Worker was built with.
export const { readProRegistry, readProItem, readProArchive } = createProStore({ version: DATA_VERSION, registryFiles, itemNames, archiveFiles })
