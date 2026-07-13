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
    <div className="my-4 flex items-center justify-between gap-2 flex-1 w-full ">
      <label className="text-sm font-medium tracking-wider text-muted-foreground uppercase">
        {label}
      </label>

      <Icon aria-hidden="true" className="size-4 text-muted-foreground" />
    </div>
  )
}