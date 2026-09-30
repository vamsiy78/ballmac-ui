import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CookieConsent } from "@/components/ballmac/cookie-consent";

const categories = [
  { id: "necessary", label: "Strictly necessary", description: "Needed.", required: true },
  { id: "analytics", label: "Analytics", description: "Usage." },
];
afterEach(() => window.localStorage.clear());

describe("CookieConsent", () => {
  it("shows a labelled, non-modal dialog with equal-weight accept and reject", () => {
    render(<CookieConsent open categories={categories} policyHref="/cookies" />);
    const dialog = screen.getByRole("dialog", { name: "We value your privacy" });
    expect(dialog).toHaveAttribute("aria-modal", "false");
    expect(screen.getByRole("button", { name: "Accept all" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reject non-essential" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Cookie policy" })).toHaveAttribute("href", "/cookies");
  });
  it("accepts all, rejects non-essential while keeping required on, and customizes", async () => {
    const user = userEvent.setup();
    const onConsent = vi.fn();
    render(<CookieConsent open categories={categories} onConsent={onConsent} />);
    await user.click(screen.getByRole("button", { name: "Reject non-essential" }));
    expect(onConsent).toHaveBeenLastCalledWith({ necessary: true, analytics: false });
    await user.click(screen.getByRole("button", { name: "Accept all" }));
    expect(onConsent).toHaveBeenLastCalledWith({ necessary: true, analytics: true });
    await user.click(screen.getByRole("button", { name: "Customize" }));
    const required = screen.getByRole("switch", { name: /Strictly necessary/ });
    expect(required).toBeDisabled();
    expect(required).toHaveAttribute("aria-checked", "true");
    await user.click(screen.getByRole("switch", { name: "Analytics" }));
    await user.click(screen.getByRole("button", { name: "Save preferences" }));
    expect(onConsent).toHaveBeenLastCalledWith({ necessary: true, analytics: true });
  });
  it("remembers the choice in localStorage and stays hidden afterwards", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<CookieConsent categories={categories} storageKey="consent" />);
    await user.click(await screen.findByRole("button", { name: "Accept all" }));
    expect(JSON.parse(window.localStorage.getItem("consent")!)).toEqual({ necessary: true, analytics: true });
    unmount();
    render(<CookieConsent categories={categories} storageKey="consent" />);
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });
});
