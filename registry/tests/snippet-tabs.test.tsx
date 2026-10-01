import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SnippetTabs } from "@/components/ballmac/snippet-tabs";

const snippets = [
  { label: "cURL", code: 'curl -H "Authorization: Bearer {{key}}" https://api.example.com' },
  { label: "Python", code: "import requests\nrequests.get('{{url}}')" },
];

describe("SnippetTabs", () => {
  it("switches language with the arrow keys and reports it", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<SnippetTabs snippets={snippets} title="Call it" onValueChange={onValueChange} />);
    const curl = screen.getByRole("tab", { name: "cURL" });
    expect(curl).toHaveAttribute("aria-selected", "true");
    curl.focus();
    await user.keyboard("{ArrowRight}");
    expect(onValueChange).toHaveBeenCalledWith("Python");
    expect(screen.getByRole("region", { name: "Python code" })).toBeInTheDocument();
  });
  it("fills {{variables}} in the code and in the copied text", async () => {
    const user = userEvent.setup();
    render(<SnippetTabs snippets={snippets} variables={{ key: "sk_test_1" }} />);
    expect(screen.getByRole("region", { name: "cURL code" })).toHaveTextContent("Bearer sk_test_1");
    await user.click(screen.getByRole("button", { name: "Copy snippet" }));
    expect(await navigator.clipboard.readText()).toContain("Bearer sk_test_1");
  });
  it("remembers the choice under storageKey and shares it with other instances", async () => {
    const user = userEvent.setup();
    render(
      <>
        <SnippetTabs snippets={snippets} storageKey="t-lang" title="One" />
        <SnippetTabs snippets={snippets} storageKey="t-lang" title="Two" />
      </>
    );
    await user.click(screen.getAllByRole("tab", { name: "Python" })[0]!);
    expect(screen.getAllByRole("tab", { name: "Python" })[1]).toHaveAttribute("aria-selected", "true");
  });
  it("shows line numbers on request", () => {
    render(<SnippetTabs snippets={snippets} lineNumbers />);
    expect(screen.getByRole("region", { name: "cURL code" })).toHaveTextContent("1");
  });
});
