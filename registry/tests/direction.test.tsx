import { render, renderHook, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { Dir, DirectionProvider, useDirection } from "@/lib/ballmac/direction";
import { Tabs, TabsList, TabsTrigger } from "@/components/ballmac/tabs";
import { Sheet, SheetContent, SheetTitle } from "@/components/ballmac/sheet";
import { Slider } from "@/components/ballmac/slider";
import { TreeView } from "@/components/ballmac/tree-view";

afterEach(() => {
  document.documentElement.dir = "";
});

function Views() {
  return (
    <Tabs defaultValue="a">
      <TabsList aria-label="Views">
        <TabsTrigger value="a">A</TabsTrigger>
        <TabsTrigger value="b">B</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

describe("direction", () => {
  it("reads <html dir>, a provider or an explicit value", () => {
    expect(renderHook(() => useDirection()).result.current).toBe("ltr");
    document.documentElement.dir = "rtl";
    expect(renderHook(() => useDirection()).result.current).toBe("rtl");
    expect(renderHook(() => useDirection("ltr")).result.current).toBe("ltr");
    document.documentElement.dir = "";
    const wrapper = ({ children }: { children: React.ReactNode }) => <DirectionProvider dir="rtl">{children}</DirectionProvider>;
    expect(renderHook(() => useDirection(), { wrapper }).result.current).toBe("rtl");
  });

  it("Dir sets the attribute without adding layout", () => {
    render(
      <Dir dir="rtl" data-testid="box">
        <span>x</span>
      </Dir>,
    );
    expect(screen.getByTestId("box")).toHaveAttribute("dir", "rtl");
    expect(screen.getByTestId("box")).toHaveClass("contents");
  });

  it("Tabs: ArrowLeft moves to the next tab on a right-to-left page", async () => {
    const user = userEvent.setup();
    document.documentElement.dir = "rtl";
    render(<Views />);
    screen.getByRole("tab", { name: "A" }).focus();
    await user.keyboard("{ArrowLeft}");
    expect(screen.getByRole("tab", { name: "B" })).toHaveAttribute("aria-selected", "true");
  });

  it("Tabs: ArrowRight still moves forward left-to-right", async () => {
    const user = userEvent.setup();
    render(<Views />);
    screen.getByRole("tab", { name: "A" }).focus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "B" })).toHaveAttribute("aria-selected", "true");
  });

  it("Slider: ArrowLeft raises the value on a right-to-left page", async () => {
    const user = userEvent.setup();
    document.documentElement.dir = "rtl";
    render(<Slider defaultValue={[50]} aria-label="Volume" />);
    screen.getByRole("slider").focus();
    await user.keyboard("{ArrowLeft}");
    expect(screen.getByRole("slider")).toHaveAttribute("aria-valuenow", "51");
  });

  it("Sheet: start and end follow the reading direction, left and right do not", () => {
    render(
      <Sheet open>
        <SheetContent side="start">
          <SheetTitle>Start</SheetTitle>
        </SheetContent>
      </Sheet>,
    );
    const start = screen.getByRole("dialog");
    expect(start.className).toContain("start-0");
    expect(start.className).toContain("rtl:data-[state=open]:slide-in-from-right");
    expect(start.className).not.toMatch(/\bleft-0\b/);
  });

  it("TreeView: ArrowLeft expands and ArrowRight collapses on a right-to-left page", async () => {
    const user = userEvent.setup();
    document.documentElement.dir = "rtl";
    render(
      <TreeView
        label="Files"
        nodes={[
          { id: "root", label: "Root", children: [{ id: "child", label: "Child" }] },
          { id: "other", label: "Other" },
        ]}
      />,
    );
    const root = screen.getByRole("treeitem", { name: "Root" });
    root.focus();
    await user.keyboard("{ArrowLeft}{ArrowDown}");
    expect(screen.getByRole("treeitem", { name: "Child" })).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(root).toHaveFocus();
  });
});

