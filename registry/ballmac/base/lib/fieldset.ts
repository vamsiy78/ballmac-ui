// Ballmac UI: Fieldset disabled (Base UI). https://ui.ballmac.com/docs/guides/base-ui
import * as React from "react"

/**
 * A native button or input inside `<fieldset disabled>` is disabled by the browser. Base UI's switch, checkbox and radio are spans, so they
 * would stay usable. This reads the fieldset once the control mounts and returns the ref to attach and the `disabled` value to pass on.
 */
export function useFieldsetDisabled<T extends HTMLElement>(disabled?: boolean, outerRef?: React.Ref<T>) {
  const [inherited, setInherited] = React.useState(false)
  const ref = React.useCallback(
    (el: T | null) => {
      setInherited(!!el?.closest("fieldset[disabled]"))
      if (typeof outerRef === "function") outerRef(el)
      else if (outerRef) (outerRef as React.RefObject<T | null>).current = el
    },
    [outerRef]
  )
  return { ref, disabled: disabled || inherited || undefined }
}
