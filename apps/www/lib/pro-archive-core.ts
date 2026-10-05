/** File names the Pro archive routes serve: a lowercase name, an optional x.y.z version, then .tar.gz or .zip. */
export const archivePattern = /^[a-z0-9]+(-[a-z0-9]+)*(-\d+\.\d+\.\d+)?\.(tar\.gz|zip)$/
