/** The free Pro sampler: three blocks given to anyone who leaves an email. Chosen for interaction quality, not for being the weakest. No framework imports. */
export const SAMPLER_BLOCKS = ["pricing-pro-3", "settings-pro-1", "onboarding-pro-3"] as const

export const isSamplerBlock = (name: string) => (SAMPLER_BLOCKS as readonly string[]).includes(name)
