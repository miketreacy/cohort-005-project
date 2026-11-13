import { describe, expect, it } from "vitest";
import { noteDraftStatus } from "../index";
import { MAX_NOTE_LENGTH } from "~/lib/notes";

describe("noteDraftStatus", () => {
  it("is empty and cannot be saved when there is no text", () => {
    expect(noteDraftStatus("", null)).toEqual({
      state: "empty",
      length: 0,
      max: MAX_NOTE_LENGTH,
      canSave: false,
    });
  });

  it("treats whitespace-only text as empty", () => {
    expect(noteDraftStatus("   \n\t ", null).state).toBe("empty");
  });

  it("is unsaved and can be saved when there is no saved Note yet", () => {
    const status = noteDraftStatus("Generics are like parameters", null);
    expect(status.state).toBe("unsaved");
    expect(status.canSave).toBe(true);
  });

  it("is saved and cannot be saved again when the draft matches the saved Note", () => {
    const status = noteDraftStatus("Same text", "Same text");
    expect(status.state).toBe("saved");
    expect(status.canSave).toBe(false);
  });

  it("ignores whitespace at the edges when comparing to the saved Note", () => {
    expect(noteDraftStatus("  Same text \n", "Same text").state).toBe("saved");
  });

  it("is unsaved when the draft differs from the saved Note", () => {
    expect(noteDraftStatus("Edited text", "Same text").state).toBe("unsaved");
  });

  it("counts the trimmed length", () => {
    expect(noteDraftStatus("  abc  ", null).length).toBe(3);
  });

  it("can be saved at exactly the limit", () => {
    const status = noteDraftStatus("a".repeat(MAX_NOTE_LENGTH), null);
    expect(status.state).toBe("unsaved");
    expect(status.canSave).toBe(true);
  });

  it("is too long and cannot be saved one character over the limit", () => {
    const status = noteDraftStatus("a".repeat(MAX_NOTE_LENGTH + 1), null);
    expect(status.state).toBe("too-long");
    expect(status.length).toBe(MAX_NOTE_LENGTH + 1);
    expect(status.canSave).toBe(false);
  });

  it("clearing a saved Note is empty, not a save", () => {
    const status = noteDraftStatus("", "Old note");
    expect(status.state).toBe("empty");
    expect(status.canSave).toBe(false);
  });
});
