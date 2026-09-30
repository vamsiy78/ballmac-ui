import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { BackToTop } from "@/components/ballmac/back-to-top";

function Harness() {
  const ref = React.useRef<HTMLDivElement>(null);
  return (
    <div>
      <div ref={ref} data-testid="box" tabIndex={0} aria-label="Box">
        content
      </div>
      <BackToTop container={ref} threshold={50} focusTarget="[aria-label='Box']" />
    </div>
  );
}

describe("BackToTop", () => {
  it("appears after scrolling, scrolls to top and moves focus to the target", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    expect(screen.queryByRole("button", { name: "Back to top" })).not.toBeInTheDocument();
    const box = screen.getByTestId("box");
    const scrollTo = vi.fn();
    box.scrollTo = scrollTo as unknown as typeof box.scrollTo;
    Object.defineProperty(box, "scrollTop", { value: 200, configurable: true });
    act(() => {
      box.dispatchEvent(new Event("scroll"));
    });
    const button = await screen.findByRole("button", { name: "Back to top" });
    await user.click(button);
    expect(scrollTo).toHaveBeenCalledWith(expect.objectContaining({ top: 0 }));
    expect(box).toHaveFocus();
    Object.defineProperty(box, "scrollTop", { value: 0, configurable: true });
    act(() => {
      box.dispatchEvent(new Event("scroll"));
    });
    await waitFor(() => expect(screen.queryByRole("button", { name: "Back to top" })).not.toBeInTheDocument());
  });
});
