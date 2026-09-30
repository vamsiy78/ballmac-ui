// Ballmac UI: Form. https://ui.ballmac.com/components/form
// Based on shadcn/ui Form (MIT, Copyright (c) 2023 shadcn) on React Hook Form (MIT, Copyright (c) 2019 Beier Luo), rebuilt on Ballmac Field so one FormField renders label, control, description and error with ids, aria-invalid and aria-describedby wired for you, and a submit button with a pending state.
"use client";

import * as React from "react";
import {
  Controller,
  FormProvider,
  useFormContext,
  useFormState,
  type ControllerProps,
  type ControllerRenderProps,
  type FieldPath,
  type FieldValues,
  type SubmitErrorHandler,
  type SubmitHandler,
  type UseFormReturn,
} from "react-hook-form";
import { Button, type ButtonProps } from "@/components/ballmac/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  useFieldControl,
  type FieldProps,
} from "@/components/ballmac/field";
import { cn } from "@/lib/utils";

type FormProps<TValues extends FieldValues> = Omit<React.ComponentProps<"form">, "onSubmit" | "onError"> & {
  /** The object returned by `useForm()`. */
  form: UseFormReturn<TValues>;
  /** Called with validated values when the form is submitted. */
  onSubmit: SubmitHandler<TValues>;
  /** Called with the errors when validation fails. By default the first invalid control is focused. */
  onError?: SubmitErrorHandler<TValues>;
};

/** Provides the form to every FormField and wires `<form>` to `handleSubmit`. Browser validation is off (`noValidate`) so your schema owns the messages. */
function Form<TValues extends FieldValues>({ form, onSubmit, onError, className, children, ...props }: FormProps<TValues>) {
  return (
    <FormProvider {...form}>
      <form
        data-slot="form"
        noValidate
        onSubmit={form.handleSubmit(onSubmit, onError)}
        className={cn("grid w-full gap-5", className)}
        {...props}
      >
        {children}
      </form>
    </FormProvider>
  );
}

/** Everything a control needs, ready to spread: `<Input {...props} />`. */
type FormControlProps<TValues extends FieldValues = FieldValues, TName extends FieldPath<TValues> = FieldPath<TValues>> =
  ControllerRenderProps<TValues, TName> & {
    id?: string;
    "aria-invalid"?: true;
    "aria-describedby"?: string;
  };

type FormFieldProps<TValues extends FieldValues, TName extends FieldPath<TValues>> = {
  /** Field name, typed from your form values (supports paths such as `address.city`). */
  name: TName;
  /** Visible label. */
  label: React.ReactNode;
  /** Help text under the control. It stays readable to screen readers when an error is shown. */
  description?: React.ReactNode;
  /** Show the required asterisk. Pair it with a schema rule. */
  required?: boolean;
  /** Label and control layout. `horizontal` suits checkboxes and switches. */
  orientation?: FieldProps["orientation"];
  /** Built-in validation rules (`required`, `minLength`, `pattern`, `validate`…). Not needed when you use a schema resolver. */
  rules?: ControllerProps<TValues, TName>["rules"];
  /** Optional form object; defaults to the nearest `<Form>`. */
  form?: UseFormReturn<TValues>;
  /** Renders the control. Spread the props onto it: `render={(props) => <Input {...props} />}`. For checkboxes or switches map `props.value` to `checked` and `props.onChange` to `onCheckedChange`. */
  render: (props: FormControlProps<TValues, TName>) => React.ReactNode;
  className?: string;
};

function ControlHost<TValues extends FieldValues, TName extends FieldPath<TValues>>({
  field,
  render,
}: {
  field: ControllerRenderProps<TValues, TName>;
  render: FormFieldProps<TValues, TName>["render"];
}) {
  const control = useFieldControl();
  return <>{render({ ...field, ...control } as FormControlProps<TValues, TName>)}</>;
}

/** One field: label, your control, description and the validation message, all linked. */
function FormField<TValues extends FieldValues, TName extends FieldPath<TValues>>({
  name,
  label,
  description,
  required,
  orientation,
  form,
  rules,
  render,
  className,
}: FormFieldProps<TValues, TName>) {
  const context = useFormContext<TValues>();
  const control = (form ?? context).control;
  const horizontal = orientation === "horizontal";
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field, fieldState }) => (
        <Field data-slot="form-field" invalid={fieldState.invalid} orientation={orientation} className={className}>
          {horizontal ? (
            <>
              <ControlHost field={field} render={render} />
              <div className="flex flex-1 flex-col gap-1">
                <FieldLabel required={required}>{label}</FieldLabel>
                {description && <FieldDescription>{description}</FieldDescription>}
                <FieldError errors={[fieldState.error]} />
              </div>
            </>
          ) : (
            <>
              <FieldLabel required={required}>{label}</FieldLabel>
              <ControlHost field={field} render={render} />
              {description && <FieldDescription>{description}</FieldDescription>}
              <FieldError errors={[fieldState.error]} />
            </>
          )}
        </Field>
      )}
    />
  );
}

type FormSubmitProps = Omit<ButtonProps, "type" | "loading"> & {
  /** Text shown on the button while the submit handler is running. */
  pendingText?: React.ReactNode;
};
/** Submit button that shows a spinner and blocks repeat clicks while `onSubmit` is pending. */
function FormSubmit({ children, pendingText, disabled, ...props }: FormSubmitProps) {
  const { isSubmitting } = useFormState();
  return (
    <Button type="submit" loading={isSubmitting} disabled={disabled} {...props}>
      {isSubmitting && pendingText ? pendingText : children}
    </Button>
  );
}

export {
  Form,
  FormField,
  FormSubmit,
  useFormContext,
  type FormProps,
  type FormFieldProps,
  type FormControlProps,
  type FormSubmitProps,
};
