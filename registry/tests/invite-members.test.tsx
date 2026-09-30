import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { InviteMembers } from "@/components/ballmac/invite-members";

const roles = [{ value: "admin", label: "Admin" }, { value: "member", label: "Member" }];

describe("InviteMembers", () => {
  it("turns typed and pasted addresses into chips and flags invalid, duplicate and existing ones", async () => {
    const user = userEvent.setup();
    render(<InviteMembers roles={roles} existing={["ana@acme.example"]} />);
    const input = screen.getByRole("textbox", { name: "Email addresses" });
    await user.type(input, "kofi@acme.example,");
    expect(screen.getByRole("button", { name: "Remove kofi@acme.example" })).toBeInTheDocument();
    await user.click(input);
    await user.paste("bad-address ana@acme.example kofi@acme.example");
    expect(screen.getByText(/Not a valid email address/)).toBeInTheDocument();
    expect(screen.getByText(/Already invited or a member/)).toBeInTheDocument();
    expect(screen.getByText(/Listed twice/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Send 1 invitation" })).toBeEnabled();
  });
  it("sends only valid invitations with the chosen role and confirms", async () => {
    const user = userEvent.setup();
    const onInvite = vi.fn().mockResolvedValue(undefined);
    render(<InviteMembers roles={roles} onInvite={onInvite} />);
    await user.selectOptions(screen.getByLabelText("Role"), "admin");
    await user.type(screen.getByRole("textbox", { name: "Email addresses" }), "mei@acme.example{Enter}nope{Enter}");
    await user.click(screen.getByRole("button", { name: /Send 1 invitation/ }));
    expect(onInvite).toHaveBeenCalledWith([{ email: "mei@acme.example", role: "admin" }]);
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("1 invitation sent"));
  });
  it("lists pending invitations with resend and revoke and removes the last chip with Backspace", async () => {
    const user = userEvent.setup();
    const onResend = vi.fn();
    const onRevoke = vi.fn();
    render(<InviteMembers roles={roles} pending={[{ email: "sam@acme.example", role: "member", sent: "Sent today" }]} onResend={onResend} onRevoke={onRevoke} />);
    await user.click(screen.getByRole("button", { name: "Resend invitation to sam@acme.example" }));
    await user.click(screen.getByRole("button", { name: "Revoke invitation for sam@acme.example" }));
    expect(onResend).toHaveBeenCalledWith("sam@acme.example");
    expect(onRevoke).toHaveBeenCalledWith("sam@acme.example");
    const input = screen.getByRole("textbox", { name: "Email addresses" });
    await user.type(input, "a@b.co,");
    await user.keyboard("{Backspace}");
    await waitFor(() => expect(screen.queryByRole("button", { name: "Remove a@b.co" })).not.toBeInTheDocument());
  });
});
