import { get } from "es-toolkit/compat"

// Matches a single {{ ... }} placeholder, non-greedy so a field holding two of
// them resolves each on its own rather than swallowing the text between.
const PLACEHOLDER = /\{\{(.*?)\}\}/g

/**
 * Swaps every {{ nodeId.path }} placeholder in one field's text for the value it
 * points at, reading from the outputs every node has produced so far this run
 * (keyed by node id). The whole expression is a get-by-path into that map, so
 * the first segment is the node id and the rest walks into its output —
 * {{ n1.title }}, {{ n1.items[0].name }}.
 *
 * Placeholders that resolve to nothing become an empty string; objects and
 * arrays are dropped in as JSON. Pure — text in, text out.
 */
export function interpolate(
  text: string,
  outputs: Record<string, unknown>
): string {
  return text.replace(PLACEHOLDER, (_match, path: string) => {
    const value = get(outputs, path.trim())

    // An unrun node, a typo'd id, or a path off the end of the output all land
    // here — a blank is friendlier in a URL or prompt than a literal "undefined".
    if (value === undefined || value === null) return ""
    if (typeof value === "object") return JSON.stringify(value)

    return String(value)
  })
}
