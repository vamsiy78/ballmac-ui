import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { EnvEditor, formatEnv, parseEnv } from "@/components/ballmac/env-editor";

describe("EnvEditor", () => {
  it("masks values until revealed", async () => {
    const user = userEvent.setup();
    render(<EnvEditor defaultValue={[{ key: "API_KEY", value: "s3cret" }]} />);
    const value = screen.getByLabelText("Value of API_KEY");
    expect(value).toHaveAttribute("type", "password");
    await user.click(screen.getByRole("button", { name: "Show value of API_KEY" }));
    expect(value).toHaveAttribute("type", "text");
    await user.click(screen.getByRole("button", { name: "Hide all" }));
    expect(value).toHaveAttribute("type", "password");
  });
  it("adds a row and focuses its name, then removes it and announces", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<EnvEditor defaultValue={[{ key: "A", value: "1" }]} onChange={onChange} />);
    await user.click(screen.getByRole("button", { name: "Add variable" }));
    expect(screen.getByLabelText("Name of variable 2")).toHaveFocus();
    expect(onChange).toHaveBeenLastCalledWith(expect.arrayContaining([expect.objectContaining({ key: "" })]));
    await user.type(screen.getByLabelText("Name of variable 2"), "B");
    await user.click(screen.getByRole("button", { name: "Remove B" }));
    await waitFor(() => expect(screen.queryByLabelText("Name of variable 2")).toBeNull());
    expect(screen.getByText("Removed B")).toBeInTheDocument();
  });
  it("flags invalid and duplicate names with linked messages", async () => {
    render(<EnvEditor defaultValue={[{ key: "1BAD", value: "x" }, { key: "DUP", value: "1" }, { key: "DUP", value: "2" }]} />);
    const bad = screen.getByLabelText("Name of variable 1");
    expect(bad).toHaveAttribute("aria-invalid", "true");
    expect(document.getElementById(bad.getAttribute("aria-describedby")!)).toHaveTextContent("Use letters, numbers and underscores");
    expect(screen.getByLabelText("Name of variable 2")).toHaveAccessibleDescription("This name is used more than once.");
  });
  it("imports pasted .env text", async () => {
    const user = userEvent.setup();
    render(<EnvEditor defaultValue={[{ key: "KEEP", value: "1" }]} />);
    await user.click(screen.getByRole("button", { name: "Paste .env" }));
    await user.click(screen.getByLabelText("Paste a .env file"));
    await user.paste('# comment\nexport A=1\nB="two words" # note\nKEEP=updated');
    await user.click(screen.getByRole("button", { name: /Import 3 variables/ }));
    expect(screen.getByLabelText("Value of A")).toHaveValue("1");
    expect(screen.getByLabelText("Value of B")).toHaveValue("two words");
    expect(screen.getByLabelText("Value of KEEP")).toHaveValue("updated");
  });
  it("parses and formats .env text", () => {
    expect(parseEnv("A=1\n#c\nB='x y'\nC=z # n")).toEqual([{ key: "A", value: "1" }, { key: "B", value: "x y" }, { key: "C", value: "z" }]);
    expect(formatEnv([{ key: "A", value: "1" }, { key: "B", value: "x y" }, { key: "", value: "skip" }])).toBe('A=1\nB="x y"');
  });
});
