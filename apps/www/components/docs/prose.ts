/** Typography for docs article content, shared by MDX pages and hand-built docs pages. */
export const docsProse = [
  "space-y-5 leading-relaxed",
  "[&_h2]:mt-12 [&_h2]:scroll-mt-24 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-tight",
  "[&_h3]:mt-8 [&_h3]:scroll-mt-24 [&_h3]:font-semibold",
  "[&_h4]:mt-6 [&_h4]:scroll-mt-24 [&_h4]:text-sm [&_h4]:font-semibold",
  "[&_p]:text-muted-foreground [&_li]:text-muted-foreground",
  "[&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:ps-5 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:ps-5",
  "[&_strong]:text-foreground [&_strong]:font-medium",
  "[&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-4",
  "[&_:not(pre)>code]:bg-muted [&_:not(pre)>code]:rounded [&_:not(pre)>code]:px-1.5 [&_:not(pre)>code]:py-0.5 [&_:not(pre)>code]:font-mono [&_:not(pre)>code]:text-[0.85em] [&_:not(pre)>code]:text-foreground",
].join(" ")
