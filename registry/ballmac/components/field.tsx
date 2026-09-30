// Ballmac UI: Field. https://ui.ballmac.com/components/field
// Based on shadcn/ui Field (MIT, Copyright (c) 2023 shadcn), adding automatic id wiring (label, description, error) through useFieldControl and an invalid/disabled state that flows to the control.
"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

type FieldContextValue = {
  id: string;
  invalid: boolean;
  disabled: boolean;
};
const FieldContext = React.createContext<FieldContextValue | null>(null);

type FieldControlProps = {
  id?: string;
  "aria-invalid"?: true;
  "aria-describedby"?: string;
  disabled?: true;
};

/**
 * Props to spread on the control inside a `Field` (Input, Textarea, Select trigger, Combobox…).
 * It links the control to the label, description and error, and passes the invalid and disabled state.
 * Returns an empty object outside a `Field`.
 */
function useFieldControl(): FieldControlProps {
  const field = React.useContext(FieldContext);
  if (!field) return {};
  return {
    id: field.id,
    "aria-invalid": field.invalid || undefined,
    "aria-describedby":
      [`${field.id}-description`, field.invalid ? `${field.id}-error` : null]
        .filter(Boolean)
        .join(" ") || undefined,
    disabled: field.disabled || undefined,
  };
}

type FieldSetProps = React.ComponentProps<"fieldset">;
function FieldSet({ className, ...props }: FieldSetProps) {
  return (
    <fieldset
      data-slot="field-set"
      className={cn("flex flex-col gap-5", className)}
      {...props}
    />
  );
}

type FieldLegendProps = React.ComponentProps<"legend"> & {
  /** `legend` for a section title, `label` for a smaller heading. */
  variant?: "legend" | "label";
};
function FieldLegend({ className, variant = "legend", ...props }: FieldLegendProps) {
  return (
    <legend
      data-slot="field-legend"
      data-variant={variant}
      className={cn(
        "mb-3 font-semibold data-[variant=label]:text-sm data-[variant=legend]:text-base",
        className,
      )}
      {...props}
    />
  );
}

type FieldGroupProps = React.ComponentProps<"div">;
function FieldGroup({ className, ...props }: FieldGroupProps) {
  return (
    <div
      data-slot="field-group"
      className={cn("group/field-group flex w-full flex-col gap-5", className)}
      {...props}
    />
  );
}

const fieldVariants = cva("group/field flex w-full gap-2 data-[invalid=true]:text-destructive", {
  variants: {
    orientation: {
      vertical: "flex-col",
      horizontal: "flex-row items-center [&>[data-slot=field-label]]:flex-auto",
      responsive:
        "flex-col @md/field-group:flex-row @md/field-group:items-center @md/field-group:[&>[data-slot=field-label]]:flex-auto",
    },
  },
  defaultVariants: { orientation: "vertical" },
});

type FieldProps = React.ComponentProps<"div"> &
  VariantProps<typeof fieldVariants> & {
    /** Layout of label and control. `horizontal` suits checkboxes and switches. */
    orientation?: "vertical" | "horizontal" | "responsive";
    /** Marks the control invalid: the label turns destructive, the control gets `aria-invalid` and the error is announced. */
    invalid?: boolean;
    /** Disables the control and dims the label. */
    disabled?: boolean;
    /** Override the generated id shared by the label and control. */
    controlId?: string;
  };
function Field({
  className,
  orientation = "vertical",
  invalid = false,
  disabled = false,
  controlId,
  ...props
}: FieldProps) {
  const generated = React.useId();
  const id = controlId ?? generated;
  const value = React.useMemo(() => ({ id, invalid, disabled }), [id, invalid, disabled]);
  return (
    <FieldContext.Provider value={value}>
      <div
        role="group"
        data-slot="field"
        data-orientation={orientation}
        data-invalid={invalid}
        data-disabled={disabled}
        className={cn(
          fieldVariants({ orientation }),
          "data-[disabled=true]:opacity-60",
          className,
        )}
        {...props}
      />
    </FieldContext.Provider>
  );
}

type FieldContentProps = React.ComponentProps<"div">;
/** Groups the label and description beside a horizontal control. */
function FieldContent({ className, ...props }: FieldContentProps) {
  return (
    <div
      data-slot="field-content"
      className={cn("flex flex-1 flex-col gap-1 leading-snug", className)}
      {...props}
    />
  );
}

type FieldLabelProps = React.ComponentProps<"label"> & {
  /** Show a required asterisk after the text. Add `required` to the control too. */
  required?: boolean;
};
function FieldLabel({ className, required, children, htmlFor, ...props }: FieldLabelProps) {
  const field = React.useContext(FieldContext);
  return (
    <label
      data-slot="field-label"
      htmlFor={htmlFor ?? field?.id}
      className={cn(
        "flex w-fit select-none items-center gap-2 text-sm leading-snug font-medium group-data-[disabled=true]/field:cursor-not-allowed",
        className,
      )}
      {...props}
    >
      {children}
      {required && (
        <span aria-hidden="true" className="text-destructive">
          *
        </span>
      )}
    </label>
  );
}

type FieldTitleProps = React.ComponentProps<"div">;
/** A label-styled title for cards that hold a control (radio cards, switch rows). */
function FieldTitle({ className, ...props }: FieldTitleProps) {
  return (
    <div
      data-slot="field-title"
      className={cn("flex w-fit items-center gap-2 text-sm leading-snug font-medium", className)}
      {...props}
    />
  );
}

type FieldDescriptionProps = React.ComponentProps<"p">;
function FieldDescription({ className, id, ...props }: FieldDescriptionProps) {
  const field = React.useContext(FieldContext);
  return (
    <p
      data-slot="field-description"
      id={id ?? (field ? `${field.id}-description` : undefined)}
      className={cn("text-sm leading-normal font-normal text-muted-foreground", className)}
      {...props}
    />
  );
}

type FieldErrorProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** Messages to show. Duplicates are removed; one message renders as text, several as a list. */
  errors?: Array<{ message?: string } | string | undefined>;
  /** Custom content instead of `errors`. */
  children?: React.ReactNode;
};
/** Announces validation messages (`role="alert"`). Renders nothing when there are none. */
function FieldError({ className, errors, children, id, ...props }: FieldErrorProps) {
  const field = React.useContext(FieldContext);
  const messages = React.useMemo(() => {
    const list = (errors ?? [])
      .map((e) => (typeof e === "string" ? e : e?.message))
      .filter((m): m is string => Boolean(m));
    return [...new Set(list)];
  }, [errors]);
  const content =
    children ??
    (messages.length === 0 ? null : messages.length === 1 ? (
      messages[0]
    ) : (
      <ul className="ml-4 flex list-disc flex-col gap-1">
        {messages.map((m) => (
          <li key={m}>{m}</li>
        ))}
      </ul>
    ));
  if (!content) return null;
  return (
    <div
      role="alert"
      data-slot="field-error"
      id={id ?? (field ? `${field.id}-error` : undefined)}
      className={cn("text-sm font-normal text-destructive", className)}
      {...props}
    >
      {content}
    </div>
  );
}

type FieldSeparatorProps = React.ComponentProps<"div"> & {
  /** Text in the middle of the rule, for example "or". */
  children?: React.ReactNode;
};
function FieldSeparator({ children, className, ...props }: FieldSeparatorProps) {
  return (
    <div
      data-slot="field-separator"
      aria-hidden="true"
      className={cn("relative -my-1 flex h-5 items-center text-sm", className)}
      {...props}
    >
      <span className="absolute inset-x-0 h-px bg-border" />
      {children && (
        <span className="relative mx-auto bg-background px-2 text-muted-foreground">
          {children}
        </span>
      )}
    </div>
  );
}

export {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldContent,
  FieldTitle,
  useFieldControl,
  fieldVariants,
  type FieldControlProps,
  type FieldProps,
  type FieldLabelProps,
  type FieldDescriptionProps,
  type FieldErrorProps,
  type FieldGroupProps,
  type FieldLegendProps,
  type FieldSeparatorProps,
  type FieldSetProps,
  type FieldContentProps,
  type FieldTitleProps,
};
