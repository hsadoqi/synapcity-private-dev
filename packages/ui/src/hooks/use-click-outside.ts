import { useEffect } from "react"

type ClickOutsideEvent = MouseEvent | TouchEvent

type UseClickOutsideOptions = {
  enabled?: boolean
}

export default function useClickOutside<TElement extends HTMLElement>(
  ref: React.RefObject<TElement | null>,
  handler: (event: ClickOutsideEvent) => void,
  options: UseClickOutsideOptions = {}
) {
  const { enabled = true } = options

  useEffect(() => {
    if (!enabled) return

    let startedInside = false
    let startedWhenMounted = false

    const isEventTargetInside = (event: Event) => {
      const element = ref.current
      const target = event.target

      if (!element || !(target instanceof Node)) {
        return false
      }

      return element.contains(target)
    }

    const validateEventStart = (event: MouseEvent | TouchEvent) => {
      startedWhenMounted = ref.current !== null
      startedInside = isEventTargetInside(event)
    }

    const listener = (event: MouseEvent | TouchEvent) => {
      if (startedInside || !startedWhenMounted) return
      if (isEventTargetInside(event)) return

      handler(event)
    }

    document.addEventListener("mousedown", validateEventStart)
    document.addEventListener("touchstart", validateEventStart)
    document.addEventListener("click", listener)

    return () => {
      document.removeEventListener("mousedown", validateEventStart)
      document.removeEventListener("touchstart", validateEventStart)
      document.removeEventListener("click", listener)
    }
  }, [ref, handler, enabled])
}
