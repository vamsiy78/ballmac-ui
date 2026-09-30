import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { SplitView, SplitViewBack, SplitViewDetail, SplitViewList, useSplitView } from "@/components/ballmac/split-view";

function Item() {
  const { setDetailOpen } = useSplitView();
  return <button onClick={() => setDetailOpen(true)}>Open message</button>;
}

function setup() {
  return render(
    <SplitView>
      <SplitViewList label="Messages">
        <Item />
      </SplitViewList>
      <SplitViewDetail label="Message">
        <SplitViewBack>Inbox</SplitViewBack>
        Body
      </SplitViewDetail>
    </SplitView>,
  );
}

describe("SplitView", () => {
  it("opens and closes the detail pane for narrow containers", async () => {
    const user = userEvent.setup();
    const { container } = setup();
    const root = container.querySelector("[data-slot=split-view]")!;
    expect(root).not.toHaveAttribute("data-detail-open");
    await user.click(screen.getByRole("button", { name: "Open message" }));
    expect(root).toHaveAttribute("data-detail-open");
    await user.click(screen.getByRole("button", { name: "Inbox" }));
    expect(root).not.toHaveAttribute("data-detail-open");
  });
  it("resizes the list with the keyboard within limits", async () => {
    const user = userEvent.setup();
    render(
      <SplitView listWidth={300} minListWidth={250} maxListWidth={340}>
        <SplitViewList>List</SplitViewList>
        <SplitViewDetail>Detail</SplitViewDetail>
      </SplitView>,
    );
    const divider = screen.getByRole("separator", { name: "Resize list" });
    divider.focus();
    await user.keyboard("{ArrowRight}");
    expect(divider).toHaveAttribute("aria-valuenow", "316");
    await user.keyboard("{End}");
    expect(divider).toHaveAttribute("aria-valuenow", "340");
    await user.keyboard("{Home}");
    expect(divider).toHaveAttribute("aria-valuenow", "250");
  });
  it("labels both panes as regions", () => {
    setup();
    expect(screen.getByRole("region", { name: "Messages" })).toBeInTheDocument();
    expect(document.querySelector("[data-slot=split-view-detail]")).toHaveAttribute("aria-label", "Message");
  });
});
