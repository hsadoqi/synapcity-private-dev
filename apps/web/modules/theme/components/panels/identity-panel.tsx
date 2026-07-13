import * as React from "react"

import { TextField } from "../form-components/text-field"
import type { ThemeFormData } from "../form-components/theme-form-popover"

export function IdentityPanel({
  formData,
  onChange,
}: {
  formData: ThemeFormData
  onChange: <K extends keyof ThemeFormData>(
    field: K,
    value: ThemeFormData[K]
  ) => void
}) {
  const descriptionId = React.useId()

  return (
    <div
      role="tabpanel"
      id="identity-panel"
      aria-labelledby="identity-tab"
      className="space-y-3"
    >
      <TextField
        label="Name"
        value={formData.name}
        placeholder="My Theme"
        autoFocus
        onChange={(value) => onChange("name", value)}
      />

      <div>
        <label
          htmlFor={descriptionId}
          className="text-xs font-medium tracking-wide text-muted-foreground uppercase"
        >
          Description
        </label>
        <textarea
          id={descriptionId}
          placeholder="What's this theme for?"
          value={formData.description}
          onChange={(event) => onChange("description", event.target.value)}
          rows={3}
          className="mt-1 w-full resize-none rounded border border-border bg-input px-2 py-1.5 text-xs focus:ring-2 focus:ring-ring/50 focus:outline-none"
        />
      </div>
    </div>
  )
}
