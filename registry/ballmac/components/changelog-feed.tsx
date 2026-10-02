// Ballmac UI: Changelog Feed. https://ui.ballmac.com/components/changelog-feed
"use client";

import * as React from "react";
import { Bug, ChevronDown, Sparkles, Trash2, Wand2 } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { spring } from "@/lib/ballmac/motion";
import { cn } from "@/lib/utils";
import { useLocale, useMessages, defineMessage, type Message } from "@/lib/ballmac/i18n";

type ChangeType = "new" | "improved" | "fixed" | "removed";

type ChangelogChange = {
  type: ChangeType;
  /** One sentence describing the change. */
  text: string;
};

type ChangelogEntry = {
  /** Unique id. */
  id: string;
  /** Release version, for example "2.4.0". */
  version?: string;
  /** ISO date (YYYY-MM-DD). */
  date: string;
  /** Headline of the release. */
  title: string;
  /** One or two sentences about the release. */
  summary?: string;
  /** The individual changes. */
  changes: ChangelogChange[];
  /** An image, video or illustration shown under the summary. */
  media?: React.ReactNode;
};

type ChangelogFeedProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** Releases, newest first. */
  entries: ChangelogEntry[];
  /** Show filter chips with counts. */
  filterable?: boolean;
  /** Changes shown before "Show more". */
  collapsedCount?: number;
  /** Locale for dates. Fixed by default so server and browser match. */
  locale?: string;
};

const TYPES: Record<ChangeType, { label: Message; icon: typeof Sparkles; chip: string; tone: string }> = {
  new: { label: defineMessage("changelog-feed.TYPES.new", "New"), icon: Sparkles, chip: "bg-chart-2/12 text-foreground", tone: "text-chart-2" },
  improved: { label: defineMessage("changelog-feed.TYPES.improved", "Improved"), icon: Wand2, chip: "bg-chart-1/12 text-foreground", tone: "text-chart-1" },
  fixed: { label: defineMessage("changelog-feed.TYPES.fixed", "Fixed"), icon: Bug, chip: "bg-chart-3/15 text-foreground", tone: "text-chart-3" },
  removed: { label: defineMessage("changelog-feed.TYPES.removed", "Removed"), icon: Trash2, chip: "bg-muted text-foreground", tone: "text-muted-foreground" },
};

function EntryCard({
  entry,
  filter,
  collapsedCount,
  locale,
  latest,
}: {
  entry: ChangelogEntry;
  filter: ChangeType | "all";
  collapsedCount: number;
  locale: string;
  latest: boolean;
}) {
  const msg = useMessages()
  const reduce = useReducedMotion();
  const [expanded, setExpanded] = React.useState(false);
  const listId = React.useId();
  const changes = filter === "all" ? entry.changes : entry.changes.filter((c) => c.type === filter);
  const visible = expanded ? changes : changes.slice(0, collapsedCount);
  const hidden = changes.length - visible.length;
  const date = new Intl.DateTimeFormat(locale, { dateStyle: "long", timeZone: "UTC" }).format(new Date(`${entry.date}T00:00:00Z`));
  const titleId = `${listId}-title`;

  return (
    <motion.article
      layout={!reduce}
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
      transition={spring.gentle}
      aria-labelledby={titleId}
      className="relative grid gap-4 md:grid-cols-[9.5rem_minmax(0,1fr)] md:gap-8"
    >
      <div className="md:sticky md:top-6 md:self-start">
        <time dateTime={entry.date} className="text-sm font-medium tabular-nums">
          {date}
        </time>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {entry.version && (
            <span className="rounded-md border bg-muted/60 px-1.5 py-0.5 font-mono text-xs font-medium">v{entry.version}</span>
          )}
          {latest && (
            <span className="rounded-md bg-primary px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-primary-foreground uppercase">
              {msg("changelog-feed.latest", "Latest")}
            </span>
          )}
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-5 text-card-foreground shadow-[0_1px_2px_rgb(0_0_0/0.04)] sm:p-6">
        <h3 id={titleId} className="text-lg font-semibold tracking-tight text-balance">
          {entry.title}
        </h3>
        {entry.summary && <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{entry.summary}</p>}
        {entry.media && <div className="mt-4 overflow-hidden rounded-xl border bg-muted/40">{entry.media}</div>}
        <ul id={listId} className="mt-4 grid gap-2.5">
          {visible.map((change, i) => {
            const t = TYPES[change.type];
            const Icon = t.icon;
            return (
              <li key={`${change.type}-${i}`} className="flex items-start gap-3 text-sm leading-relaxed">
                <span className={cn("mt-0.5 inline-flex h-5 shrink-0 items-center gap-1 rounded-md px-1.5 text-[11px] font-semibold", t.chip)}>
                  <Icon aria-hidden="true" className={cn("size-3", t.tone)} />
                  {msg.of(t.label)}
                </span>
                <span>{change.text}</span>
              </li>
            );
          })}
        </ul>
        {(hidden > 0 || expanded) && changes.length > collapsedCount && (
          <button
            type="button"
            aria-expanded={expanded}
            aria-controls={listId}
            onClick={() => setExpanded((v) => !v)}
            className="mt-4 inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-[13px] font-medium text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            {expanded ? "Show fewer changes" : `Show ${hidden} more change${hidden === 1 ? "" : "s"}`}
            <ChevronDown aria-hidden="true" className={cn("size-4 transition-transform duration-200 motion-reduce:transition-none", expanded && "rotate-180")} />
          </button>
        )}
      </div>
    </motion.article>
  );
}

/**
 * A release-notes feed: a sticky date and version column beside a card per release, with change-type labels that pair
 * an icon and a word, optional media, filter chips with counts, and "show more" for long releases.
 */
function ChangelogFeed({
  entries,
  filterable = true,
  collapsedCount = 4,
  locale,
  className,
  ...props
}: ChangelogFeedProps) {
  const defaultLocale = useLocale()
  locale ??= defaultLocale
  const msg = useMessages()
  const [filter, setFilter] = React.useState<ChangeType | "all">("all");
  const counts = entries.reduce(
    (acc, e) => {
      e.changes.forEach((c) => (acc[c.type] += 1));
      return acc;
    },
    { new: 0, improved: 0, fixed: 0, removed: 0 } as Record<ChangeType, number>,
  );
  const shown = entries.filter((e) => filter === "all" || e.changes.some((c) => c.type === filter));
  const types = (Object.keys(TYPES) as ChangeType[]).filter((t) => counts[t] > 0);

  return (
    <div data-slot="changelog-feed" className={cn("grid gap-8", className)} {...props}>
      {filterable && (
        <div role="group" aria-label={msg("changelog-feed.filterChanges", "Filter changes")} className="flex flex-wrap gap-2">
          {(["all", ...types] as const).map((t) => {
            const active = filter === t;
            return (
              <button
                key={t}
                type="button"
                aria-pressed={active}
                onClick={() => setFilter(t)}
                className="inline-flex h-8 items-center gap-2 rounded-full border px-3.5 text-[13px] font-medium outline-none transition-colors hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-primary-foreground"
              >
                {t === "all" ? msg("changelog-feed.all", "All") : msg.of(TYPES[t].label)}
                <span className="text-xs opacity-70 tabular-nums">{t === "all" ? entries.reduce((n, e) => n + e.changes.length, 0) : counts[t]}</span>
              </button>
            );
          })}
        </div>
      )}
      <div className="grid gap-10 md:gap-12" aria-live="polite">
        <AnimatePresence initial={false} mode="popLayout">
          {shown.map((entry) => (
            <EntryCard key={entry.id} entry={entry} filter={filter} collapsedCount={collapsedCount} locale={locale} latest={entry.id === entries[0]?.id} />
          ))}
        </AnimatePresence>
        {shown.length === 0 && <p className="text-sm text-muted-foreground">{msg("changelog-feed.noReleasesMatchThisFilter", "No releases match this filter.")}</p>}
      </div>
    </div>
  );
}

export { ChangelogFeed, type ChangelogFeedProps, type ChangelogEntry, type ChangelogChange, type ChangeType };
