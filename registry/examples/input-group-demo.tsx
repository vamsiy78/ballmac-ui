"use client";
import * as React from "react";
import { ArrowUp, AtSign, Check, Copy, Globe, Search } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ballmac/input-group";
export default function InputGroupDemo() {
  const [copied, setCopied] = React.useState(false);
  return (
    <div className="grid w-full max-w-sm gap-3">
      <InputGroup aria-label="Search">
        <InputGroupAddon>
          <Search aria-hidden="true" />
        </InputGroupAddon>
        <InputGroupInput aria-label="Search projects" placeholder="Search projects" />
        <InputGroupAddon align="inline-end">
          <span className="text-xs tabular-nums">12 results</span>
        </InputGroupAddon>
      </InputGroup>
      <InputGroup aria-label="Website address">
        <InputGroupAddon>
          <InputGroupText>
            <Globe aria-hidden="true" /> https://
          </InputGroupText>
        </InputGroupAddon>
        <InputGroupInput aria-label="Domain" defaultValue="acme" />
        <InputGroupAddon align="inline-end">
          <InputGroupText>.example.com</InputGroupText>
        </InputGroupAddon>
      </InputGroup>
      <InputGroup aria-label="Share link">
        <InputGroupInput aria-label="Share link" readOnly value="acme.example/r/8f3k" />
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            size="icon-xs"
            aria-label={copied ? "Copied" : "Copy link"}
            onClick={() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
          >
            {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      <InputGroup aria-label="Message">
        <InputGroupTextarea aria-label="Message" placeholder="Reply to the thread…" rows={2} />
        <InputGroupAddon align="block-end">
          <InputGroupButton size="icon-sm" variant="ghost" aria-label="Mention someone">
            <AtSign aria-hidden="true" />
          </InputGroupButton>
          <InputGroupButton size="sm" variant="default" className="ms-auto">
            Send <ArrowUp aria-hidden="true" />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
}
