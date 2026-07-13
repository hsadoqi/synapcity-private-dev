import React from "react"
import { LucideProps } from "lucide-react"
import { ForwardRefExoticComponent, RefAttributes } from "react"

export const ThemeFormSectionHeader = ({
  label,
  icon: Icon,
}: {
  label: string
  icon: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >
}) => {
  return (
    <div className="my-4 flex w-full flex-1 items-center justify-between gap-2">
      <label className="text-sm font-medium tracking-wider text-muted-foreground uppercase">
        {label}
      </label>

      <Icon aria-hidden="true" className="size-4 text-muted-foreground" />
    </div>
  )
}
