"use client"

import * as React from "react"
import { RgbaColorPicker, type RgbaColor } from "react-colorful"

import useClickOutside from "@workspace/ui/hooks/use-click-outside"
import { isValidOklch, normalizeOklch } from "../engine/oklch"
import { oklchToRgbaObj, rgbaObjToOklchStr } from "../utils/rgba-oklch"

type ColorPickerProps = {
  color: string
  onChange: (color: string) => void
}

export function ColorPicker({ color, onChange }: ColorPickerProps) {
  const popoverRef = React.useRef<HTMLDivElement | null>(null)
  const [isOpen, setIsOpen] = React.useState(false)
const [textDraft, setTextDraft] = React.useState(() => ({
  sourceColor: color,
  value: color,
}))

const textInput = textDraft.sourceColor === color ? textDraft.value : color

  const close = React.useCallback(() => {
    setIsOpen(false)
  }, [])

  const rgbaColor = React.useMemo(() => {
    return oklchToRgbaObj(color)
  }, [color])

  const commitTextInput = React.useCallback(() => {
    if (isValidOklch(textInput)) {
      onChange(normalizeOklch(textInput))
      return
    }

    setTextDraft({ sourceColor: color, value: color })
  }, [color, onChange, textInput])

  const handlePickerChange = React.useCallback(
    (nextRgba: RgbaColor) => {
      onChange(rgbaObjToOklchStr(nextRgba))
    },
    [onChange]
  )

  useClickOutside(popoverRef, close, {
    enabled: isOpen,
  })

  const textInputIsValid = textInput.length === 0 || isValidOklch(textInput)

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Open color picker"
        className="h-8 w-8 cursor-pointer rounded border border-border hover:shadow-sm"
        style={{ backgroundColor: color }}
        onClick={() => setIsOpen(true)}
      />

      {isOpen && (
        <div
          ref={popoverRef}
          className="absolute top-full left-0 z-50 mt-2 rounded-sm border border-border bg-popover p-3 shadow-sm"
        >
          <RgbaColorPicker color={rgbaColor} onChange={handlePickerChange} />
          <label className="mt-3 block space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              OKLCH seed
            </span>
            <input
              className="h-10 w-full rounded-md border bg-background px-3 font-mono text-sm"
              value={textInput}
              onChange={(event) =>
                setTextDraft({
                  sourceColor: color,
                  value: event.target.value,
                })
              }
              onBlur={commitTextInput}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  commitTextInput()
                  event.currentTarget.blur()
                }

                if (event.key === "Escape") {
                  setTextDraft({ sourceColor: color, value: color })
                  event.currentTarget.blur()
                }
              }}
            />
            {!textInputIsValid ? (
              <p className="text-xs text-destructive">Use valid OKLCH.</p>
            ) : null}
          </label>
        </div>
      )}
    </div>
  )
}
