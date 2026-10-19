"use client"

import * as React from "react"

import { Button } from "@/components/ballmac/button"
import { NativeSelect, NativeSelectOption } from "@/components/ballmac/native-select"

export default function NativeSelectForm() {
  const [value, setValue] = React.useState("")
  const [touched, setTouched] = React.useState(false)
  const invalid = touched && value === ""
  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        setTouched(true)
      }}
      className="grid w-full max-w-xs gap-3"
    >
      <div className="grid gap-1.5">
        <label htmlFor="role" className="text-sm font-medium">
          Your role
        </label>
        <NativeSelect id="role" name="role" required placeholder="Select a role" value={value} onValueChange={setValue} aria-invalid={invalid || undefined} aria-describedby="role-hint">
          <NativeSelectOption value="design">Design</NativeSelectOption>
          <NativeSelectOption value="eng">Engineering</NativeSelectOption>
          <NativeSelectOption value="ops">Operations</NativeSelectOption>
        </NativeSelect>
        <p id="role-hint" className={invalid ? "text-xs text-destructive" : "text-xs text-muted-foreground"}>
          {invalid ? "Choose the role that fits you best." : "It decides which tips you see first."}
        </p>
      </div>
      <Button type="submit">Continue</Button>
    </form>
  )
}
