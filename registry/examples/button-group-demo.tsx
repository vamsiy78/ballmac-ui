"use client";
import * as React from "react";
import { Copy, Download, Share2 } from "lucide-react";
import {
  ButtonGroup,
  ButtonGroupText,
} from "@/components/ballmac/button-group";
const actionClass =
  "inline-flex h-9 items-center justify-center gap-2 border bg-background px-3 text-sm font-medium outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 [&_svg]:size-4";
export default function ButtonGroupDemo() {
  const [message, setMessage] = React.useState("Ready to share");
  return (
    <div className="w-full max-w-sm rounded-xl border bg-card p-5 shadow-sm">
      <p className="mb-1 text-sm font-semibold">Q3 product brief</p>
      <p className="mb-4 text-xs text-muted-foreground">
        Last edited a few minutes ago
      </p>
      <ButtonGroup aria-label="Document actions" className="max-w-full">
        <ButtonGroupText>Share</ButtonGroupText>
        <button
          type="button"
          className={actionClass}
          onClick={() => setMessage("Link copied")}
        >
          <Copy aria-hidden="true" />
          <span className="hidden sm:inline">Copy link</span>
          <span className="sr-only sm:hidden">Copy link</span>
        </button>
        <button
          type="button"
          aria-label="Download"
          className={actionClass}
          onClick={() => setMessage("Download prepared")}
        >
          <Download aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label="Share"
          className={actionClass}
          onClick={() => setMessage("Share panel ready")}
        >
          <Share2 aria-hidden="true" />
        </button>
      </ButtonGroup>
      <p role="status" className="mt-3 text-xs text-muted-foreground">
        {message}
      </p>
    </div>
  );
}
