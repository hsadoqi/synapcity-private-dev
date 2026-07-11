import "@testing-library/jest-dom/vitest"
import { cleanup } from "@testing-library/react"
import { afterEach } from "vitest"

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => undefined,
    removeListener: () => undefined,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    dispatchEvent: () => false,
  }),
})

afterEach(() => {
  cleanup()
  window.localStorage.clear()
  document.documentElement.removeAttribute("style")
  for (const name of [...document.documentElement.attributes].map(
    (attribute) => attribute.name
  )) {
    if (name.startsWith("data-theme")) {
      document.documentElement.removeAttribute(name)
    }
  }
})
