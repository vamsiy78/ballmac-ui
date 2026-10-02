// Ballmac UI: Model Picker. https://ui.ballmac.com/components/model-picker
"use client"

import * as React from "react"
import { Brain, ChevronsUpDown, Eye, Lock, Sparkles, Wrench, Zap } from "lucide-react"

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ballmac/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ballmac/popover"
import { cn } from "@/lib/utils"
import { useMessages, defineMessage, type Message } from "@/lib/ballmac/i18n"

type ModelCapability = "vision" | "reasoning" | "tools" | "fast"

type ModelOption = {
  /** Stable id returned by `onValueChange`. */
  id: string
  /** Name shown in the list and on the trigger. */
  name: string
  /** Provider or family. Options are grouped under it. */
  provider?: string
  /** One sentence on what the model is best at. */
  description?: string
  /** What the model can do. Shown as icons in the list and in words in the detail pane. */
  capabilities?: ModelCapability[]
  /** Context window in tokens, for example 200000. */
  contextWindow?: number
  /** Relative cost: 1 is cheapest, 3 is most expensive. */
  cost?: 1 | 2 | 3
  /** Marks a recent release. */
  isNew?: boolean
  /** The model cannot be picked, for example because it needs a higher plan. */
  locked?: boolean
  /** Text shown when locked, such as "Pro". */
  lockedLabel?: string
}

const CAPABILITY_META: Record<ModelCapability, { label: Message; help: Message; icon: React.ComponentType<{ className?: string }> }> = {
  vision: { label: defineMessage("model-picker.CAPABILITY_META.vision", "Vision"), help: defineMessage("model-picker.CAPABILITY_META.vision.help", "Reads images and screenshots"), icon: Eye },
  reasoning: { label: defineMessage("model-picker.CAPABILITY_META.reasoning", "Reasoning"), help: defineMessage("model-picker.CAPABILITY_META.reasoning.help", "Thinks before answering"), icon: Brain },
  tools: { label: defineMessage("model-picker.CAPABILITY_META.tools", "Tools"), help: defineMessage("model-picker.CAPABILITY_META.tools.help", "Calls functions and apps"), icon: Wrench },
  fast: { label: defineMessage("model-picker.CAPABILITY_META.fast", "Fast"), help: defineMessage("model-picker.CAPABILITY_META.fast.help", "Low latency replies"), icon: Zap },
}

const TONES = ["bg-chart-1", "bg-chart-2", "bg-chart-3", "bg-chart-4", "bg-chart-5"]

function hash(text: string) {
  let h = 0
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) >>> 0
  return h
}

/** 200000 → "200k", 1000000 → "1M". */
function formatContext(tokens: number) {
  if (tokens >= 1_000_000) return `${+(tokens / 1_000_000).toFixed(1)}M`
  if (tokens >= 1000) return `${Math.round(tokens / 1000)}k`
  return String(tokens)
}

function ProviderMark({ model, className }: { model: ModelOption; className?: string }) {
  const name = model.provider ?? model.name
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex size-6 shrink-0 items-center justify-center rounded-md text-[11px] font-semibold text-background uppercase",
        TONES[hash(name) % TONES.length],
        className
      )}
    >
      {name.charAt(0)}
    </span>
  )
}

type ModelPickerProps = Omit<React.ComponentProps<"button">, "value" | "defaultValue" | "onChange"> & {
  /** The models to offer. Models that share a `provider` are grouped. */
  models: ModelOption[]
  /** Selected model id (controlled). */
  value?: string
  /** Initial model id when uncontrolled. */
  defaultValue?: string
  /** Called with the chosen id. */
  onValueChange?: (id: string) => void
  /** Shown on the trigger when nothing is selected. */
  placeholder?: string
  /** Placeholder of the search box. */
  searchPlaceholder?: string
  /** Show the search box. Defaults to on when there are more than six models. */
  searchable?: boolean
  /** Show the detail pane that follows the highlighted model on wider screens. */
  showDetails?: boolean
  /** Called when a locked model is chosen, for example to open an upgrade dialog. */
  onLockedSelect?: (model: ModelOption) => void
  /** Which side of the trigger the list aligns to. */
  align?: "start" | "center" | "end"
  /** Trigger style. "compact" hides the provider mark and is sized for a composer toolbar. */
  variant?: "default" | "compact"
}

function ModelPicker({
  models,
  value: valueProp,
  defaultValue,
  onValueChange,
  placeholder,
  searchPlaceholder,
  searchable,
  showDetails = true,
  onLockedSelect,
  align = "start",
  variant = "default",
  className,
  disabled,
  ...props
}: ModelPickerProps) {
  const msg = useMessages()
  placeholder ??= msg("model-picker.placeholder", "Select a model")
  searchPlaceholder ??= msg("model-picker.searchPlaceholder", "Search models…")
  const [internal, setInternal] = React.useState(defaultValue)
  const value = valueProp ?? internal
  const [open, setOpen] = React.useState(false)
  const selected = models.find((m) => m.id === value)
  const [highlight, setHighlight] = React.useState<string>("")
  const hasSearch = searchable ?? models.length > 6
  const listLabel = "Models"

  const groups = React.useMemo(() => {
    const map = new Map<string, ModelOption[]>()
    for (const m of models) {
      const key = m.provider ?? ""
      map.set(key, [...(map.get(key) ?? []), m])
    }
    return [...map.entries()]
  }, [models])

  const detail = models.find((m) => m.id === highlight) ?? selected ?? models[0]

  function pick(model: ModelOption) {
    if (model.locked) {
      onLockedSelect?.(model)
      return
    }
    if (valueProp === undefined) setInternal(model.id)
    onValueChange?.(model.id)
    setOpen(false)
  }

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (next) setHighlight(selected && !selected.locked ? selected.id : (models.find((m) => !m.locked)?.id ?? ""))
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        data-slot="model-picker"
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={selected ? `Model: ${selected.name}` : placeholder}
        disabled={disabled}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" && !open) {
            e.preventDefault()
            handleOpenChange(true)
          }
        }}
        className={cn(
          "inline-flex items-center gap-2 rounded-lg border bg-background text-sm font-medium text-foreground shadow-xs outline-none transition-[color,background-color,border-color,box-shadow] duration-150 hover:bg-accent focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 data-[state=open]:bg-accent motion-reduce:transition-none",
          variant === "compact" ? "h-8 px-2.5 text-[13px]" : "h-10 min-w-56 px-2.5",
          className
        )}
        {...props}
      >
        {variant === "default" && selected && <ProviderMark model={selected} />}
        <span className={cn("truncate", !selected && "text-muted-foreground")}>{selected?.name ?? placeholder}</span>
        <ChevronsUpDown aria-hidden="true" className="ms-auto size-4 shrink-0 text-muted-foreground" />
      </PopoverTrigger>
      <PopoverContent
        label="Choose a model"
        align={align}
        sideOffset={6}
        className={cn(
          "w-[min(23rem,calc(100vw-1.5rem))] gap-0 overflow-hidden p-0",
          showDetails && "sm:w-[min(40rem,calc(100vw-1.5rem))]"
        )}
      >
        <div className="flex">
          <Command
            label={listLabel}
            value={highlight}
            onValueChange={setHighlight}
            className="min-w-0 flex-1 rounded-none bg-transparent"
          >
            {hasSearch ? (
              <CommandInput placeholder={searchPlaceholder} />
            ) : (
              // Keeps focus inside the list so arrow keys and type-ahead still work without a visible search box.
              <div className="sr-only">
                <CommandInput placeholder={searchPlaceholder} />
              </div>
            )}
            <CommandList className="max-h-80">
              <CommandEmpty>No model matches.</CommandEmpty>
              {groups.map(([provider, items]) => (
                <CommandGroup key={provider || "all"} heading={provider || undefined}>
                  {items.map((m) => (
                    <CommandItem
                      key={m.id}
                      value={m.id}
                      keywords={[m.name, m.provider ?? "", ...(m.capabilities ?? [])]}
                      selected={m.id === value}
                      onSelect={() => pick(m)}
                      className="min-h-11 py-2"
                      icon={<ProviderMark model={m} />}
                      description={m.description}
                    >
                      <span className="flex items-center gap-1.5">
                        <span className="truncate">{m.name}</span>
                        {m.isNew && (
                          <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-muted px-1.5 py-px text-[10px] font-medium text-foreground">
                            <Sparkles aria-hidden="true" className="size-2.5" />
                            {msg("model-picker.new", "New")}
                          </span>
                        )}
                        {m.locked && (
                          <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full border px-1.5 py-px text-[10px] font-medium text-foreground">
                            <Lock aria-hidden="true" className="size-2.5" />
                            {m.lockedLabel ?? msg("model-picker.locked", "Locked")}
                          </span>
                        )}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
            </CommandList>
            <p className="flex items-center gap-3 border-t px-3 py-2 text-xs text-muted-foreground" aria-hidden="true">
              <span><kbd className="font-mono">↑↓</kbd> move</span>
              <span><kbd className="font-mono">↵</kbd> select</span>
              <span><kbd className="font-mono">esc</kbd> close</span>
            </p>
          </Command>
          {showDetails && detail && (
            <aside
              aria-live="polite"
              aria-label={msg("model-picker.modelDetails", "Model details")}
              className="hidden w-60 shrink-0 flex-col gap-4 border-s bg-muted/30 p-4 sm:flex"
            >
              <div className="flex items-center gap-2.5">
                <ProviderMark model={detail} className="size-8 text-xs" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{detail.name}</p>
                  {detail.provider && <p className="truncate text-xs text-muted-foreground">{detail.provider}</p>}
                </div>
              </div>
              {detail.description && <p className="text-[13px] leading-5 text-muted-foreground">{detail.description}</p>}
              <dl className="grid gap-2 text-[13px]">
                {detail.contextWindow !== undefined && (
                  <div className="flex items-center justify-between gap-2">
                    <dt className="text-muted-foreground">Context</dt>
                    <dd className="font-medium text-foreground tabular-nums">{msg("model-picker.contextTokens", "{size} tokens", { size: formatContext(detail.contextWindow) })}</dd>
                  </div>
                )}
                {detail.cost !== undefined && (
                  <div className="flex items-center justify-between gap-2">
                    <dt className="text-muted-foreground">Cost</dt>
                    <dd className="font-medium text-foreground">
                      <span aria-hidden="true" className="tracking-widest">
                        {"$".repeat(detail.cost)}
                        <span className="text-border">{"$".repeat(3 - detail.cost)}</span>
                      </span>
                      <span className="sr-only">{msg("model-picker.costLevel", "{level} cost", { level: [msg("model-picker.costLow", "Low"), msg("model-picker.costMedium", "Medium"), msg("model-picker.costHigh", "High")][detail.cost - 1] ?? "" })}</span>
                    </dd>
                  </div>
                )}
              </dl>
              {detail.capabilities && detail.capabilities.length > 0 && (
                <ul className="grid gap-2">
                  {detail.capabilities.map((c) => {
                    const meta = CAPABILITY_META[c]
                    const Icon = meta.icon
                    return (
                      <li key={c} className="flex items-start gap-2 text-[13px]">
                        <Icon aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                        <span>
                          <span className="font-medium text-foreground">{msg.of(meta.label)}</span>
                          <span className="text-muted-foreground"> · {msg.of(meta.help)}</span>
                        </span>
                      </li>
                    )
                  })}
                </ul>
              )}
              {detail.locked && (
                <p className="mt-auto flex items-center gap-1.5 rounded-lg border bg-background px-2.5 py-2 text-xs text-foreground">
                  <Lock aria-hidden="true" className="size-3.5 shrink-0" />
                  {msg("model-picker.availableWith", "Available with {plan}", { plan: detail.lockedLabel ?? msg("model-picker.higherPlan", "a higher plan") })}
                </p>
              )}
            </aside>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export { ModelPicker, formatContext, type ModelPickerProps, type ModelOption, type ModelCapability }
