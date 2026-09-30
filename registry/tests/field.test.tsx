import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  useFieldControl,
} from "@/components/ballmac/field";

function Control() {
  return <input {...useFieldControl()} />;
}

describe("Field", () => {
  it("links label, description and error to the control", () => {
    render(
      <Field invalid>
        <FieldLabel required>Email</FieldLabel>
        <Control />
        <FieldDescription>We never share it.</FieldDescription>
        <FieldError errors={["Enter a valid email", { message: "Enter a valid email" }]} />
      </Field>,
    );
    const input = screen.getByLabelText(/Email/);
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("We never share it. Enter a valid email");
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Enter a valid email");
    expect(alert.querySelector("li")).toBeNull(); // duplicates collapse to a single message
  });
  it("omits the error from the description when valid and renders no alert", () => {
    render(
      <Field>
        <FieldLabel>Name</FieldLabel>
        <Control />
        <FieldError errors={[undefined]} />
      </Field>,
    );
    expect(screen.getByLabelText("Name")).not.toHaveAttribute("aria-invalid");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
  it("lists several distinct messages and passes disabled to the control", () => {
    render(
      <Field invalid disabled>
        <FieldLabel>Password</FieldLabel>
        <Control />
        <FieldError errors={["Too short", "Needs a number"]} />
      </Field>,
    );
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByLabelText("Password")).toBeDisabled();
  });
});
