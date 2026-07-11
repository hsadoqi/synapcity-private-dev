import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components"
import { Command, Ellipsis, Palette, Search } from "lucide-react"
import Link from "next/link"

import { cn } from "@workspace/ui/lib/utils"
import { useCommand } from "@/components/command/command-context"

export const MobileHeaderActions = ({ className }: { className?: string }) => {
  const { setOpen } = useCommand()

  return (
    <div className={cn("flex flex-1 gap-2", className)}>
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="More actions">
                <Ellipsis />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>More actions</TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuLabel>Application</DropdownMenuLabel>
          <DropdownMenuItem>
            <Search />
            Search all
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setOpen(true)}>
            <Command />
            Command palette
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/settings/theme">
              <Palette />
              Theme
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
