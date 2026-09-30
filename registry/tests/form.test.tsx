import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";
import { Form, FormField, FormSubmit } from "@/components/ballmac/form";

function Harness({ onSubmit }: { onSubmit: (v: { email: string }) => void | Promise<void> }) {
  const form = useForm<{ email: string }>({ defaultValues: { email: "" } });
  return (
    <Form form={form} onSubmit={onSubmit}>
      <FormField
        name="email"
        label="Email"
        description="We never share it."
        required
        rules={{ required: "Enter your email.", pattern: { value: /^\S+@\S+$/, message: "Enter a full address." } }}
        render={(props) => <input {...props} />}
      />
      <FormSubmit pendingText="Saving…">Save</FormSubmit>
    </Form>
  );
}

describe("Form", () => {
  it("shows a linked error, marks the control invalid and focuses it", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<Harness onSubmit={onSubmit} />);
    await user.click(screen.getByRole("button", { name: "Save" }));
    const input = await screen.findByLabelText(/Email/);
    await waitFor(() => expect(input).toHaveAttribute("aria-invalid", "true"));
    expect(input).toHaveAccessibleDescription("We never share it. Enter your email.");
    expect(screen.getByRole("alert")).toHaveTextContent("Enter your email.");
    expect(input).toHaveFocus();
    expect(onSubmit).not.toHaveBeenCalled();
  });
  it("submits valid values and shows the pending state", async () => {
    const user = userEvent.setup();
    let release: () => void = () => {};
    const onSubmit = vi.fn((_values: { email: string }) => new Promise<void>((r) => (release = r)));
    render(<Harness onSubmit={onSubmit} />);
    await user.type(screen.getByLabelText(/Email/), "jo@acme.example");
    await user.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0]).toEqual({ email: "jo@acme.example" });
    expect(screen.getByRole("button", { name: /Saving…/ })).toHaveAttribute("aria-busy", "true");
    release();
    await waitFor(() => expect(screen.getByRole("button", { name: "Save" })).not.toHaveAttribute("aria-busy"));
  });
});
