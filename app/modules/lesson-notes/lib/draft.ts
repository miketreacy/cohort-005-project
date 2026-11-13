import { MAX_NOTE_LENGTH } from "~/lib/notes";

export type NoteDraftState = "empty" | "too-long" | "unsaved" | "saved";

export type NoteDraftStatus = {
  state: NoteDraftState;
  length: number;
  max: number;
  canSave: boolean;
};

export function describeDraft(
  draft: string,
  savedBody: string | null
): NoteDraftStatus {
  // The server trims before it stores, so whitespace at the edges is not a change.
  const body = draft.trim();
  const length = body.length;
  const state: NoteDraftState =
    length === 0
      ? "empty"
      : length > MAX_NOTE_LENGTH
        ? "too-long"
        : body === savedBody
          ? "saved"
          : "unsaved";

  return {
    state,
    length,
    max: MAX_NOTE_LENGTH,
    canSave: state === "unsaved",
  };
}
