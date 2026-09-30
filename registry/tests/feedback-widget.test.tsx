import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { FeedbackWidget } from "@/components/ballmac/feedback-widget";

describe("FeedbackWidget", () => {
  it("opens a labelled panel with five rating radios and a disabled send until rated", async () => {
    const user = userEvent.setup();
    render(<FeedbackWidget />);
    await user.click(screen.getByRole("button", { name: "Feedback" }));
    expect(await screen.findByRole("dialog", { name: "Send feedback" })).toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(5);
    expect(screen.getByRole("button", { name: "Send feedback" })).toBeDisabled();
    await user.click(screen.getByRole("radio", { name: "Happy" }));
    expect(screen.getByRole("button", { name: "Send feedback" })).toBeEnabled();
  });
  it("submits rating, topic and message, then confirms", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<FeedbackWidget defaultOpen topics={["Bug", "Idea"]} onSubmit={onSubmit} closeAfter={0} />);
    await user.click(await screen.findByRole("radio", { name: "Delighted" }));
    await user.click(screen.getByRole("button", { name: "Idea" }));
    expect(screen.getByRole("button", { name: "Idea" })).toHaveAttribute("aria-pressed", "true");
    await user.type(screen.getByLabelText(/Tell us more/), "Love the new inbox");
    await user.click(screen.getByRole("button", { name: "Send feedback" }));
    expect(onSubmit).toHaveBeenCalledWith({ rating: 5, message: "Love the new inbox", topic: "Idea" });
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Thank you"));
  });
  it("requires a message when asked", async () => {
    const user = userEvent.setup();
    render(<FeedbackWidget defaultOpen requireMessage />);
    await user.click(await screen.findByRole("radio", { name: "Neutral" }));
    expect(screen.getByRole("button", { name: "Send feedback" })).toBeDisabled();
    await user.type(screen.getByLabelText(/Tell us more/), "ok");
    expect(screen.getByRole("button", { name: "Send feedback" })).toBeEnabled();
  });
});
