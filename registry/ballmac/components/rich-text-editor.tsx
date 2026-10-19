// Ballmac UI: Rich Text Editor. https://ui.ballmac.com/components/rich-text-editor
// Based on Tiptap (MIT, Copyright (c) 2025 Tiptap GmbH) and ProseMirror (MIT, Copyright (C) 2015-2017 by Marijn Haverbeke and others), with a keyboard toolbar, slash menu and link popover.
"use client"

import * as React from "react"
import { Extension, type Editor, type Range } from "@tiptap/core"
import { TaskItem, TaskList } from "@tiptap/extension-list"
import TextAlign from "@tiptap/extension-text-align"
import { CharacterCount, Placeholder } from "@tiptap/extensions"
import { EditorContent, useEditor, useEditorState } from "@tiptap/react"
import type { EditorView } from "@tiptap/pm/view"
import StarterKit from "@tiptap/starter-kit"
import Suggestion, { type SuggestionProps } from "@tiptap/suggestion"
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Code,
  Code2,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  Link2,
  List,
  ListChecks,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  Strikethrough,
  Underline as UnderlineIcon,
  Undo2,
  Unlink,
} from "lucide-react"

import { Button } from "@/components/ballmac/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ballmac/popover"
import { Skeleton } from "@/components/ballmac/skeleton"
import { StateView, type StateProps } from "@/components/ballmac/state-view"
import { useDirection } from "@/lib/ballmac/direction"
import { useMessages, type Msg } from "@/lib/ballmac/i18n"
import { cn } from "@/lib/utils"

type RichTextFeature =
  | "bold"
  | "italic"
  | "underline"
  | "strike"
  | "code"
  | "link"
  | "heading"
  | "bulletList"
  | "orderedList"
  | "taskList"
  | "blockquote"
  | "codeBlock"
  | "horizontalRule"
  | "align"
  | "undo"
  | "slash"

const DEFAULT_FEATURES: RichTextFeature[] = ["heading", "bold", "italic", "underline", "strike", "code", "link", "bulletList", "orderedList", "taskList", "blockquote", "codeBlock", "horizontalRule", "undo", "slash"]

type RichTextEditorProps = Omit<React.ComponentProps<"div">, "onChange" | "defaultValue"> &
  StateProps & {
    /** What the editor is for, read by screen readers: "Message". */
    label: string
    /** The content, as HTML, when you hold it in state. Pair with `onChange`. */
    value?: string
    /** The content to start with, when the editor holds it. */
    defaultValue?: string
    /** Called with the HTML when the content changes. Clean it before you store or show it to others. */
    onChange?: (html: string, editor: Editor) => void
    placeholder?: string
    /** Which tools to offer. Leave out `slash` to turn off the "/" menu. */
    features?: RichTextFeature[]
    disabled?: boolean
    /** Stop at this many characters, and show the count. */
    characterLimit?: number
    /** Show the word and character count under the editor. */
    showCount?: boolean
    invalid?: boolean
    /** Hint or error shown under the editor and linked to it. */
    description?: React.ReactNode
    minHeight?: number
    maxHeight?: number
    /** Focus the editor when it mounts. */
    autoFocus?: boolean
    /** Opens links in a new tab. Off by default. */
    linksInNewTab?: boolean
    /** Hands you the Tiptap editor, for anything this does not cover. */
    editorRef?: React.Ref<Editor | null>
  }

/** The look of the content: headings, lists, quotes, code and links, without needing the Tailwind typography plugin. */
const PROSE = [
  "[&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[inherit] [&_.ProseMirror]:text-sm [&_.ProseMirror]:leading-relaxed",
  "[&_.ProseMirror>*+*]:mt-3",
  "[&_.ProseMirror_h1]:text-2xl [&_.ProseMirror_h1]:font-semibold [&_.ProseMirror_h1]:tracking-tight [&_.ProseMirror_h1]:leading-tight",
  "[&_.ProseMirror_h2]:text-xl [&_.ProseMirror_h2]:font-semibold [&_.ProseMirror_h2]:tracking-tight [&_.ProseMirror_h2]:leading-snug",
  "[&_.ProseMirror_h3]:text-base [&_.ProseMirror_h3]:font-semibold [&_.ProseMirror_h3]:leading-snug",
  "[&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:ps-6 [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:ps-6 [&_.ProseMirror_li>p]:m-0 [&_.ProseMirror_li+li]:mt-1",
  "[&_.ProseMirror_ul[data-type=taskList]]:list-none [&_.ProseMirror_ul[data-type=taskList]]:ps-0",
  "[&_.ProseMirror_li[data-type=taskItem]]:flex [&_.ProseMirror_li[data-type=taskItem]]:items-start [&_.ProseMirror_li[data-type=taskItem]]:gap-2",
  "[&_.ProseMirror_li[data-type=taskItem]>label]:mt-[3px] [&_.ProseMirror_li[data-type=taskItem]>label_input]:size-4 [&_.ProseMirror_li[data-type=taskItem]>label_input]:accent-primary",
  "[&_.ProseMirror_li[data-type=taskItem]>div]:min-w-0 [&_.ProseMirror_li[data-type=taskItem][data-checked=true]>div]:text-muted-foreground [&_.ProseMirror_li[data-type=taskItem][data-checked=true]>div]:line-through",
  "[&_.ProseMirror_blockquote]:border-s-2 [&_.ProseMirror_blockquote]:border-border [&_.ProseMirror_blockquote]:ps-4 [&_.ProseMirror_blockquote]:text-muted-foreground",
  "[&_.ProseMirror_pre]:overflow-x-auto [&_.ProseMirror_pre]:rounded-lg [&_.ProseMirror_pre]:border [&_.ProseMirror_pre]:bg-muted [&_.ProseMirror_pre]:p-3 [&_.ProseMirror_pre]:font-mono [&_.ProseMirror_pre]:text-[13px] [&_.ProseMirror_pre]:[direction:ltr] [&_.ProseMirror_pre]:text-start",
  "[&_.ProseMirror_code]:rounded [&_.ProseMirror_code]:bg-muted [&_.ProseMirror_code]:px-1 [&_.ProseMirror_code]:py-0.5 [&_.ProseMirror_code]:font-mono [&_.ProseMirror_code]:text-[0.85em]",
  "[&_.ProseMirror_pre_code]:bg-transparent [&_.ProseMirror_pre_code]:p-0",
  "[&_.ProseMirror_hr]:my-4 [&_.ProseMirror_hr]:border-border",
  "[&_.ProseMirror_a]:text-primary [&_.ProseMirror_a]:underline [&_.ProseMirror_a]:underline-offset-4 [&_.ProseMirror_a]:decoration-primary/40 hover:[&_.ProseMirror_a]:decoration-primary",
  "[&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-start [&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0 [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-muted-foreground [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]",
  "[&_.ProseMirror_.selectedNode]:ring-2 [&_.ProseMirror_.selectedNode]:ring-ring/50",
].join(" ")

// ------------------------------------------------------------------------------------------------- slash commands

type SlashItem = { id: string; label: string; description: string; icon: React.ReactNode; keywords: string; run: (chain: ReturnType<Editor["chain"]>) => void }

function slashItems(msg: Msg): SlashItem[] {
  const icon = (I: React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" }>) => <I className="size-4" aria-hidden="true" />
  return [
    { id: "h1", label: msg("rich-text-editor.slash.h1", "Heading 1"), description: msg("rich-text-editor.slash.h1Hint", "A large section heading"), icon: icon(Heading1), keywords: "title heading h1", run: (c) => c.setNode("heading", { level: 1 }).run() },
    { id: "h2", label: msg("rich-text-editor.slash.h2", "Heading 2"), description: msg("rich-text-editor.slash.h2Hint", "A medium heading"), icon: icon(Heading2), keywords: "subtitle heading h2", run: (c) => c.setNode("heading", { level: 2 }).run() },
    { id: "h3", label: msg("rich-text-editor.slash.h3", "Heading 3"), description: msg("rich-text-editor.slash.h3Hint", "A small heading"), icon: icon(Heading3), keywords: "heading h3", run: (c) => c.setNode("heading", { level: 3 }).run() },
    { id: "bullets", label: msg("rich-text-editor.slash.bullets", "Bulleted list"), description: msg("rich-text-editor.slash.bulletsHint", "A simple list of points"), icon: icon(List), keywords: "list bullets unordered ul", run: (c) => c.toggleBulletList().run() },
    { id: "numbers", label: msg("rich-text-editor.slash.numbers", "Numbered list"), description: msg("rich-text-editor.slash.numbersHint", "Steps in order"), icon: icon(ListOrdered), keywords: "list numbers ordered ol steps", run: (c) => c.toggleOrderedList().run() },
    { id: "tasks", label: msg("rich-text-editor.slash.tasks", "Checklist"), description: msg("rich-text-editor.slash.tasksHint", "Things to tick off"), icon: icon(ListChecks), keywords: "todo task checklist checkbox", run: (c) => c.toggleTaskList().run() },
    { id: "quote", label: msg("rich-text-editor.slash.quote", "Quote"), description: msg("rich-text-editor.slash.quoteHint", "Set a passage apart"), icon: icon(Quote), keywords: "quote blockquote citation", run: (c) => c.toggleBlockquote().run() },
    { id: "code", label: msg("rich-text-editor.slash.code", "Code block"), description: msg("rich-text-editor.slash.codeHint", "Monospaced code"), icon: icon(Code2), keywords: "code snippet pre", run: (c) => c.toggleCodeBlock().run() },
    { id: "divider", label: msg("rich-text-editor.slash.divider", "Divider"), description: msg("rich-text-editor.slash.dividerHint", "A line between sections"), icon: icon(Minus), keywords: "divider rule hr line separator", run: (c) => c.setHorizontalRule().run() },
  ]
}

type SlashState = { items: SlashItem[]; command: (item: SlashItem) => void; rect: DOMRect | null; index: number }

/** The "/" menu. It is plain Tiptap suggestion; the list is drawn by the component, which owns its state and its keys. */
function slashExtension(bridge: React.MutableRefObject<{ show: (s: SlashState | null) => void; key: (e: KeyboardEvent) => boolean; items: () => SlashItem[] }>) {
  return Extension.create({
    name: "slashCommand",
    addProseMirrorPlugins() {
      return [
        Suggestion<SlashItem, SlashItem>({
          editor: this.editor,
          char: "/",
          allowSpaces: false,
          startOfLine: false,
          items: ({ query }) => {
            const q = query.trim().toLowerCase()
            return bridge.current.items().filter((i) => !q || `${i.label} ${i.keywords}`.toLowerCase().includes(q))
          },
          command: ({ editor, range, props }: { editor: Editor; range: Range; props: SlashItem }) => props.run(editor.chain().focus().deleteRange(range)),
          render: () => {
            const push = (p: SuggestionProps<SlashItem, SlashItem>, index = 0) => bridge.current.show({ items: p.items, command: (item) => p.command(item), rect: p.clientRect?.() ?? null, index })
            return {
              onStart: (p) => push(p),
              onUpdate: (p) => push(p),
              onKeyDown: ({ event }) => bridge.current.key(event),
              onExit: () => bridge.current.show(null),
            }
          },
        }),
      ]
    },
  })
}

// ------------------------------------------------------------------------------------------------- toolbar

type ToolbarState = {
  bold: boolean
  italic: boolean
  underline: boolean
  strike: boolean
  code: boolean
  link: boolean
  bulletList: boolean
  orderedList: boolean
  taskList: boolean
  blockquote: boolean
  codeBlock: boolean
  heading: 0 | 1 | 2 | 3
  align: "left" | "center" | "right" | "justify" | null
  canUndo: boolean
  canRedo: boolean
  href: string
}

const toolbarState = (editor: Editor): ToolbarState => ({
  bold: editor.isActive("bold"),
  italic: editor.isActive("italic"),
  underline: editor.isActive("underline"),
  strike: editor.isActive("strike"),
  code: editor.isActive("code"),
  link: editor.isActive("link"),
  bulletList: editor.isActive("bulletList"),
  orderedList: editor.isActive("orderedList"),
  taskList: editor.isActive("taskList"),
  blockquote: editor.isActive("blockquote"),
  codeBlock: editor.isActive("codeBlock"),
  heading: editor.isActive("heading", { level: 1 }) ? 1 : editor.isActive("heading", { level: 2 }) ? 2 : editor.isActive("heading", { level: 3 }) ? 3 : 0,
  align: (["left", "center", "right", "justify"] as const).find((a) => editor.isActive({ textAlign: a })) ?? null,
  canUndo: editor.can().undo(),
  canRedo: editor.can().redo(),
  href: (editor.getAttributes("link").href as string | undefined) ?? "",
})

const toolButton =
  "inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-40 aria-pressed:bg-accent aria-pressed:text-foreground motion-reduce:transition-none"

const isMac = () => typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform)

/** A web address people may link to. Adds https:// to a bare domain and refuses javascript: and other schemes. */
function cleanUrl(input: string): string | null {
  const raw = input.trim()
  if (!raw) return null
  if (/^(https?:|mailto:|tel:)/i.test(raw) || raw.startsWith("/") || raw.startsWith("#")) return raw
  if (/^[a-z][a-z0-9+.-]*:/i.test(raw)) return null
  return /^[^\s/]+\.[^\s/]+/.test(raw) || raw.startsWith("localhost") ? `https://${raw}` : null
}

// ------------------------------------------------------------------------------------------------- the editor

/**
 * A rich text editor on Tiptap: headings, bold, italic, lists, checklists, quotes, code, links and dividers. It has a toolbar you can drive with the
 * arrow keys, markdown-style shortcuts, a "/" menu for blocks, a link popover (Ctrl+K), a character limit and a count. It hands you HTML.
 */
function RichTextEditorCore({
  label,
  value,
  defaultValue = "",
  onChange,
  placeholder,
  features = DEFAULT_FEATURES,
  disabled = false,
  characterLimit,
  showCount = false,
  invalid = false,
  description,
  minHeight = 160,
  maxHeight,
  autoFocus = false,
  linksInNewTab = false,
  editorRef,
  state,
  onRetry,
  emptyState,
  errorState,
  className,
  ...props
}: RichTextEditorProps) {
  const msg = useMessages()
  const dir = useDirection()
  const rtl = dir === "rtl"
  const id = React.useId()
  const has = (f: RichTextFeature) => features.includes(f)
  const lastHtml = React.useRef(value ?? defaultValue)
  const onChangeRef = React.useRef(onChange)
  onChangeRef.current = onChange

  // ----- the slash menu: Tiptap finds the "/", this component draws the list
  const [slash, setSlash] = React.useState<SlashState | null>(null)
  const slashRef = React.useRef<SlashState | null>(null)
  slashRef.current = slash
  const itemsRef = React.useRef<SlashItem[]>([])
  itemsRef.current = slashItems(msg)
  const bridge = React.useRef({
    show: (s: SlashState | null) => setSlash(s),
    items: () => itemsRef.current,
    key: (e: KeyboardEvent) => {
      const s = slashRef.current
      if (!s || !s.items.length) return false
      if (e.key === "ArrowDown") return setSlash({ ...s, index: (s.index + 1) % s.items.length }), true
      if (e.key === "ArrowUp") return setSlash({ ...s, index: (s.index - 1 + s.items.length) % s.items.length }), true
      if (e.key === "Enter" || e.key === "Tab") return s.command(s.items[s.index]!), true
      if (e.key === "Escape") return setSlash(null), true
      return false
    },
  })

  const extensions = React.useMemo(
    () => [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        link: { openOnClick: false, autolink: true, defaultProtocol: "https", HTMLAttributes: linksInNewTab ? { target: "_blank", rel: "noopener noreferrer nofollow" } : { rel: "noopener noreferrer nofollow" } },
      }),
      Placeholder.configure({ placeholder: placeholder ?? msg("rich-text-editor.placeholder", "Write something, or type / for blocks") }),
      CharacterCount.configure({ limit: characterLimit }),
      TaskList,
      TaskItem.configure({ nested: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      ...(has("slash") ? [slashExtension(bridge)] : []),
    ],
    // the editor is built once; changing the tools later rebuilds it through the key below
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [characterLimit, linksInNewTab, placeholder, features.join(",")]
  )

  const editor = useEditor(
    {
      extensions,
      content: value ?? defaultValue,
      editable: !disabled,
      autofocus: autoFocus ? "end" : false,
      // a server render has no editor to show; it is made after the page loads, so server and browser agree
      immediatelyRender: false,
      editorProps: {
        attributes: {
          role: "textbox",
          "aria-multiline": "true",
          "aria-label": label,
          "aria-describedby": `${id}-description`,
          "aria-invalid": invalid ? "true" : "false",
          "aria-disabled": disabled ? "true" : "false",
          dir,
          spellcheck: "true",
        },
        handleKeyDown: (_view: EditorView, event: KeyboardEvent) => {
          // Ctrl or Cmd + K opens the link popover
          if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k" && has("link")) {
            event.preventDefault()
            setLinkOpen(true)
            return true
          }
          return false
        },
      },
      onUpdate: ({ editor }) => {
        const html = editor.isEmpty ? "" : editor.getHTML()
        lastHtml.current = html
        onChangeRef.current?.(html, editor)
      },
    },
    [extensions]
  )

  React.useImperativeHandle<Editor | null, Editor | null>(editorRef as React.Ref<Editor | null>, () => editor, [editor])

  // a value the caller changed from outside replaces the content, without moving the cursor when it is what we just sent
  React.useEffect(() => {
    if (!editor || value === undefined) return
    if (value === lastHtml.current) return
    lastHtml.current = value
    editor.commands.setContent(value, { emitUpdate: false })
  }, [editor, value])
  React.useEffect(() => {
    editor?.setEditable(!disabled)
  }, [editor, disabled])
  React.useEffect(() => {
    editor?.setOptions({ editorProps: { attributes: { ...(editor.options.editorProps.attributes as Record<string, string>), "aria-invalid": invalid ? "true" : "false", "aria-label": label, "aria-disabled": disabled ? "true" : "false", dir } } })
  }, [editor, invalid, label, disabled, dir])

  const s = useEditorState({ editor, selector: ({ editor }) => (editor ? toolbarState(editor) : null) })
  const counts =
    useEditorState({
      editor,
      selector: ({ editor }) => (editor ? { chars: editor.storage.characterCount.characters() as number, words: editor.storage.characterCount.words() as number } : { chars: 0, words: 0 }),
    }) ?? { chars: 0, words: 0 }

  // ----- links
  const [linkOpen, setLinkOpen] = React.useState(false)
  const [href, setHref] = React.useState("")
  const [linkError, setLinkError] = React.useState("")
  React.useEffect(() => {
    if (linkOpen) {
      setHref(s?.href ?? "")
      setLinkError("")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [linkOpen])
  const applyLink = () => {
    if (!editor) return
    const url = cleanUrl(href)
    if (!url) return setLinkError(msg("rich-text-editor.linkInvalid", "Enter a web address like example.com."))
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
    setLinkOpen(false)
  }
  const removeLink = () => {
    editor?.chain().focus().extendMarkRange("link").unsetLink().run()
    setLinkOpen(false)
  }

  // ----- the toolbar as one tab stop, moved with the arrow keys
  const toolbar = React.useRef<HTMLDivElement>(null)
  const [stop, setStop] = React.useState(0)
  const onToolbarKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const items = Array.from(toolbar.current?.querySelectorAll<HTMLElement>("[data-toolbar-item]:not([disabled])") ?? [])
    const at = items.indexOf(document.activeElement as HTMLElement)
    if (at < 0) return
    const next = e.key === (rtl ? "ArrowLeft" : "ArrowRight") ? at + 1 : e.key === (rtl ? "ArrowRight" : "ArrowLeft") ? at - 1 : e.key === "Home" ? 0 : e.key === "End" ? items.length - 1 : null
    if (next === null) return
    e.preventDefault()
    const target = items[(next + items.length) % items.length]!
    target.focus()
    setStop(Number(target.dataset.toolbarItem))
  }

  const mod = isMac() ? "⌘" : "Ctrl+"
  const T = (key: string, fallback: string) => msg(`rich-text-editor.${key}`, fallback)
  let n = 0
  const item = (extra: { id: string; label: string; shortcut?: string; icon: React.ReactNode; pressed?: boolean; disabled?: boolean; run: () => void }) => {
    const index = n++
    return (
      <button
        key={extra.id}
        type="button"
        data-toolbar-item={index}
        tabIndex={stop === index ? 0 : -1}
        aria-label={extra.label}
        aria-pressed={extra.pressed === undefined ? undefined : extra.pressed}
        title={extra.shortcut ? `${extra.label} (${extra.shortcut})` : extra.label}
        disabled={disabled || extra.disabled || !editor}
        onClick={extra.run}
        onFocus={() => setStop(index)}
        // keep the selection in the editor while a tool is pressed with the pointer
        onMouseDown={(e) => e.preventDefault()}
        className={toolButton}
      >
        {extra.icon}
      </button>
    )
  }
  const icon = (I: React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" }>) => <I className="size-4" aria-hidden="true" />
  const chain = () => editor!.chain().focus()
  const divider = (k: string) => <span key={k} role="separator" aria-orientation="vertical" className="mx-1 h-5 w-px shrink-0 bg-border" />

  const groups: React.ReactNode[][] = []
  if (has("heading")) {
    groups.push([
      item({ id: "h1", label: T("heading1", "Heading 1"), icon: icon(Heading1), pressed: s?.heading === 1, run: () => chain().toggleHeading({ level: 1 }).run() }),
      item({ id: "h2", label: T("heading2", "Heading 2"), icon: icon(Heading2), pressed: s?.heading === 2, run: () => chain().toggleHeading({ level: 2 }).run() }),
      item({ id: "h3", label: T("heading3", "Heading 3"), icon: icon(Heading3), pressed: s?.heading === 3, run: () => chain().toggleHeading({ level: 3 }).run() }),
    ])
  }
  const marks: React.ReactNode[] = []
  if (has("bold")) marks.push(item({ id: "bold", label: T("bold", "Bold"), shortcut: `${mod}B`, icon: icon(Bold), pressed: s?.bold, run: () => chain().toggleBold().run() }))
  if (has("italic")) marks.push(item({ id: "italic", label: T("italic", "Italic"), shortcut: `${mod}I`, icon: icon(Italic), pressed: s?.italic, run: () => chain().toggleItalic().run() }))
  if (has("underline")) marks.push(item({ id: "underline", label: T("underline", "Underline"), shortcut: `${mod}U`, icon: icon(UnderlineIcon), pressed: s?.underline, run: () => chain().toggleUnderline().run() }))
  if (has("strike")) marks.push(item({ id: "strike", label: T("strike", "Strikethrough"), shortcut: `${mod}Shift+S`, icon: icon(Strikethrough), pressed: s?.strike, run: () => chain().toggleStrike().run() }))
  if (has("code")) marks.push(item({ id: "code", label: T("code", "Inline code"), shortcut: `${mod}E`, icon: icon(Code), pressed: s?.code, run: () => chain().toggleCode().run() }))
  if (marks.length) groups.push(marks)
  if (has("link")) {
    const index = n++
    groups.push([
      <Popover key="link" open={linkOpen} onOpenChange={setLinkOpen}>
        <PopoverTrigger
          data-toolbar-item={index}
          tabIndex={stop === index ? 0 : -1}
          aria-label={T("link", "Link")}
          aria-pressed={!!s?.link}
          title={`${T("link", "Link")} (${mod}K)`}
          disabled={disabled || !editor}
          onFocus={() => setStop(index)}
          onMouseDown={(e) => e.preventDefault()}
          className={toolButton}
        >
          {icon(Link2)}
        </PopoverTrigger>
        <PopoverContent label={T("linkTitle", "Edit link")} align="start" className="w-80 p-3">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              applyLink()
            }}
            className="grid gap-2"
          >
            <label htmlFor={`${id}-href`} className="text-sm font-medium">
              {T("linkAddress", "Web address")}
            </label>
            <input
              id={`${id}-href`}
              type="text"
              inputMode="url"
              autoComplete="off"
              dir="ltr"
              value={href}
              onChange={(e) => {
                setHref(e.target.value)
                setLinkError("")
              }}
              aria-invalid={linkError ? true : undefined}
              aria-describedby={linkError ? `${id}-href-error` : undefined}
              placeholder={T("linkPlaceholder", "example.com")}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20"
            />
            {linkError ? (
              <p id={`${id}-href-error`} role="alert" className="text-xs text-destructive">
                {linkError}
              </p>
            ) : null}
            <div className="flex justify-between gap-2">
              <Button type="button" variant="ghost" size="sm" disabled={!s?.link} onClick={removeLink}>
                <Unlink aria-hidden="true" />
                {T("linkRemove", "Remove")}
              </Button>
              <Button type="submit" size="sm">
                {T("linkApply", "Apply")}
              </Button>
            </div>
          </form>
        </PopoverContent>
      </Popover>,
    ])
  }
  const lists: React.ReactNode[] = []
  if (has("bulletList")) lists.push(item({ id: "bullets", label: T("bulletList", "Bulleted list"), shortcut: `${mod}Shift+8`, icon: icon(List), pressed: s?.bulletList, run: () => chain().toggleBulletList().run() }))
  if (has("orderedList")) lists.push(item({ id: "numbers", label: T("orderedList", "Numbered list"), shortcut: `${mod}Shift+7`, icon: icon(ListOrdered), pressed: s?.orderedList, run: () => chain().toggleOrderedList().run() }))
  if (has("taskList")) lists.push(item({ id: "tasks", label: T("taskList", "Checklist"), shortcut: `${mod}Shift+9`, icon: icon(ListChecks), pressed: s?.taskList, run: () => chain().toggleTaskList().run() }))
  if (lists.length) groups.push(lists)
  const blocks: React.ReactNode[] = []
  if (has("blockquote")) blocks.push(item({ id: "quote", label: T("blockquote", "Quote"), shortcut: `${mod}Shift+B`, icon: icon(Quote), pressed: s?.blockquote, run: () => chain().toggleBlockquote().run() }))
  if (has("codeBlock")) blocks.push(item({ id: "codeblock", label: T("codeBlock", "Code block"), shortcut: `${mod}Alt+C`, icon: icon(Code2), pressed: s?.codeBlock, run: () => chain().toggleCodeBlock().run() }))
  if (has("horizontalRule")) blocks.push(item({ id: "hr", label: T("horizontalRule", "Divider"), icon: icon(Minus), run: () => chain().setHorizontalRule().run() }))
  if (blocks.length) groups.push(blocks)
  if (has("align")) {
    groups.push([
      item({ id: "left", label: T("alignStart", "Align to the start"), icon: icon(rtl ? AlignRight : AlignLeft), pressed: s?.align === (rtl ? "right" : "left"), run: () => chain().setTextAlign(rtl ? "right" : "left").run() }),
      item({ id: "center", label: T("alignCenter", "Center"), icon: icon(AlignCenter), pressed: s?.align === "center", run: () => chain().setTextAlign("center").run() }),
      item({ id: "right", label: T("alignEnd", "Align to the end"), icon: icon(rtl ? AlignLeft : AlignRight), pressed: s?.align === (rtl ? "left" : "right"), run: () => chain().setTextAlign(rtl ? "left" : "right").run() }),
      item({ id: "justify", label: T("alignJustify", "Justify"), icon: icon(AlignJustify), pressed: s?.align === "justify", run: () => chain().setTextAlign("justify").run() }),
    ])
  }
  if (has("undo")) {
    groups.push([
      item({ id: "undo", label: T("undo", "Undo"), shortcut: `${mod}Z`, icon: <Undo2 className="size-4 rtl:-scale-x-100" aria-hidden="true" />, disabled: !s?.canUndo, run: () => chain().undo().run() }),
      item({ id: "redo", label: T("redo", "Redo"), shortcut: `${mod}Shift+Z`, icon: <Redo2 className="size-4 rtl:-scale-x-100" aria-hidden="true" />, disabled: !s?.canRedo, run: () => chain().redo().run() }),
    ])
  }

  const near = characterLimit ? counts.chars >= characterLimit * 0.9 : false
  const full = characterLimit ? counts.chars >= characterLimit : false

  const skeleton = (
    <div className="overflow-hidden rounded-xl border bg-card" aria-hidden="true">
      <div className="flex gap-1 border-b p-1.5">
        {Array.from({ length: 8 }, (_, i) => (
          <Skeleton key={i} className="size-8" />
        ))}
      </div>
      <div className="grid gap-2.5 p-4" style={{ minHeight }}>
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </div>
  )

  const effective: StateProps["state"] = state ?? "ready"

  return (
    <div data-slot="rich-text-editor" data-invalid={invalid || undefined} data-disabled={disabled || undefined} className={cn("min-w-0", className)} {...props}>
      <StateView state={effective} loading={skeleton} error={errorState ?? {}} empty={emptyState ?? {}} onRetry={onRetry} label={msg("rich-text-editor.loading", "Loading the editor")} bare className="rounded-xl">
        <div
          className={cn(
            "overflow-hidden rounded-xl border bg-card text-card-foreground shadow-xs transition-[border-color,box-shadow] duration-150 motion-reduce:transition-none",
            "focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50",
            invalid && "border-destructive focus-within:border-destructive focus-within:ring-destructive/20",
            disabled && "opacity-60"
          )}
        >
          <div
            ref={toolbar}
            role="toolbar"
            aria-label={msg("rich-text-editor.toolbar", "Formatting")}
            aria-controls={`${id}-content`}
            aria-orientation="horizontal"
            onKeyDown={onToolbarKey}
            className="flex flex-wrap items-center gap-0.5 border-b bg-muted/40 p-1.5"
          >
            {groups.flatMap((g, i) => (i ? [divider(`d${i}`), ...g] : g))}
          </div>
          <div id={`${id}-content`} className={cn("overflow-y-auto px-4 py-3", PROSE)} style={{ minHeight, maxHeight }} onClick={(e) => e.target === e.currentTarget && editor?.commands.focus("end")}>
            {editor ? <EditorContent editor={editor} /> : <div style={{ minHeight: minHeight - 24 }} aria-hidden="true" />}
          </div>
          {showCount || characterLimit ? (
            <div className="flex items-center justify-between gap-3 border-t bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground">
              <span className="tabular-nums">{msg("rich-text-editor.words", { one: "{count} word", other: "{count} words" }, { count: counts.words })}</span>
              <span className={cn("tabular-nums", near && "text-foreground", full && "font-medium text-destructive")} aria-live={near ? "polite" : "off"}>
                {characterLimit ? msg("rich-text-editor.charsOf", "{count} of {limit} characters", { count: counts.chars, limit: characterLimit }) : msg("rich-text-editor.chars", { one: "{count} character", other: "{count} characters" }, { count: counts.chars })}
              </span>
            </div>
          ) : null}
        </div>
        <div id={`${id}-description`} className={cn("mt-1.5 text-xs", invalid ? "text-destructive" : "text-muted-foreground", !description && "sr-only")}>
          {description ?? msg("rich-text-editor.hint", "Press Escape, then Tab, to leave the editor.")}
        </div>
      </StateView>
      {slash && slash.items.length ? <SlashMenu state={slash} rtl={rtl} onPick={(i) => slash.command(i)} onHover={(index) => setSlash({ ...slash, index })} /> : null}
      <span className="sr-only" role="status" aria-live="polite">
        {slash ? (slash.items.length ? msg("rich-text-editor.slashCount", { one: "{count} block available. {name} is highlighted.", other: "{count} blocks available. {name} is highlighted." }, { count: slash.items.length, name: slash.items[slash.index]?.label ?? "" }) : msg("rich-text-editor.slashNone", "No matching blocks")) : ""}
      </span>
    </div>
  )
}

/**
 * Tiptap makes its ids with `Math.random()`, which a page that is prerendered must not do while it renders. So the editor is made only in the
 * browser, after the page is shown: until then a same-size shell holds its place, which also means the server and the browser draw the same first frame.
 */
function RichTextEditor(props: RichTextEditorProps) {
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])
  if (mounted) return <RichTextEditorCore {...props} />
  const { minHeight = 160, className } = props
  return (
    <div data-slot="rich-text-editor" data-state="loading" className={cn("min-w-0", className)}>
      <div className="overflow-hidden rounded-xl border bg-card" aria-hidden="true">
        <div className="flex gap-1 border-b p-1.5">
          {Array.from({ length: 8 }, (_, i) => (
            <Skeleton key={i} className="size-8" />
          ))}
        </div>
        <div style={{ minHeight }} />
      </div>
    </div>
  )
}

function SlashMenu({ state, rtl, onPick, onHover }: { state: SlashState; rtl: boolean; onPick: (i: SlashItem) => void; onHover: (index: number) => void }) {
  const id = React.useId()
  const msg = useMessages()
  const { rect } = state
  const style: React.CSSProperties = rect
    ? { position: "fixed", top: rect.bottom + 6, ...(rtl ? { right: Math.max(8, window.innerWidth - rect.right) } : { left: Math.max(8, rect.left) }) }
    : { position: "fixed", top: 80, left: 16 }
  return (
    <div
      role="listbox"
      aria-label={msg("rich-text-editor.slashLabel", "Blocks")}
      data-slot="rich-text-editor-slash"
      style={style}
      className="z-50 max-h-72 w-72 overflow-y-auto rounded-xl border bg-popover p-1 text-popover-foreground shadow-lg"
      onMouseDown={(e) => e.preventDefault()}
    >
      {state.items.map((item, i) => (
        <div
          key={item.id}
          id={`${id}-${item.id}`}
          role="option"
          aria-selected={i === state.index}
          onMouseEnter={() => onHover(i)}
          onClick={() => onPick(item)}
          className={cn("flex cursor-default items-center gap-3 rounded-lg px-2 py-1.5 text-sm", i === state.index && "bg-accent text-accent-foreground")}
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-md border bg-background text-muted-foreground">{item.icon}</span>
          <span className="min-w-0">
            <span className="block font-medium">{item.label}</span>
            <span className="block truncate text-xs text-muted-foreground">{item.description}</span>
          </span>
        </div>
      ))}
    </div>
  )
}

export { RichTextEditor, cleanUrl, type RichTextEditorProps, type RichTextFeature }
