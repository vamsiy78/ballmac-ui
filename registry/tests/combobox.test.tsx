import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Combobox } from "@/components/ballmac/combobox";

const options = [
  { value: "next", label: "Next.js", keywords: ["react"] },
  { value: "nuxt", label: "Nuxt", keywords: ["vue"] },
  { value: "astro", label: "Astro", disabled: true },
];

describe("Combobox", () => {
  it("opens, filters by keyword, selects, closes and restores focus", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Combobox aria-label="Framework" options={options} onValueChange={onValueChange} />);
    const trigger = screen.getByRole("combobox", { name: "Framework" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    await user.click(trigger);
    await user.keyboard("vue");
    expect(screen.queryByRole("option", { name: "Next.js" })).not.toBeInTheDocument();
    await user.keyboard("{Enter}");
    expect(onValueChange).toHaveBeenCalledWith("nuxt");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(trigger).toHaveTextContent("Nuxt");
    expect(trigger).toHaveFocus();
  });
  it("clears a clearable value and keeps disabled options unselectable", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Combobox aria-label="Framework" options={options} defaultValue="next" clearable onValueChange={onValueChange} />);
    await user.click(screen.getByRole("button", { name: "Clear selection" }));
    expect(onValueChange).toHaveBeenLastCalledWith("");
    await user.click(screen.getByRole("combobox"));
    expect(await screen.findByRole("option", { name: "Astro" })).toHaveAttribute("aria-disabled", "true");
  });
  it("submits its value in a form and reflects invalid state", () => {
    const { container } = render(
      <form>
        <Combobox aria-label="Framework" options={options} name="framework" defaultValue="nuxt" invalid />
      </form>,
    );
    expect(new FormData(container.querySelector("form")!).get("framework")).toBe("nuxt");
    expect(screen.getByRole("combobox")).toHaveAttribute("aria-invalid", "true");
  });
});
