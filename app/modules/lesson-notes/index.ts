import { describeDraft, type NoteDraftStatus } from "./lib/draft";

export type { NoteDraftState, NoteDraftStatus } from "./lib/draft";

/**
 * Where the Student's draft Note stands against the Note they last saved:
 * whether there is anything to save, and whether the Lesson page may save it.
 */
export function noteDraftStatus(
  draft: string,
  savedBody: string | null
): NoteDraftStatus {
  return describeDraft(draft, savedBody);
}
