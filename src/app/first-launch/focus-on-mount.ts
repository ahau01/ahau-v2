/**
 * Moves keyboard focus to an element when it appears, so a person using a
 * keyboard or screen reader lands on, and hears, each new screen. Give the
 * element `tabindex="-1"` if it isn't focusable on its own (e.g. a heading).
 */
export function focusOnMount (node: HTMLElement): void {
  node.focus()
}
