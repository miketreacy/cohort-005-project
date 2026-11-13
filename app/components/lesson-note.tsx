import { useState } from "react";
import { useFetcher } from "react-router";
import { Lock, NotebookPen } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Textarea } from "~/components/ui/textarea";
import { cn, formatRelativeTime } from "~/lib/utils";
import { noteDraftStatus, type NoteDraftState } from "~/modules/lesson-notes";

export type SavedNote = { body: string; updatedAt: string } | null;

// Laid out like CommentThread so the two writing surfaces on the Lesson page
// read as one design: same card, heading scale and form footer.
export function LessonNote({ note }: { note: SavedNote }) {
  const fetcher = useFetcher<{ ok: boolean; error?: string }>();
  const [draft, setDraft] = useState(note?.body ?? "");
  const isSaving = fetcher.state !== "idle";
  const error = fetcher.data?.error;
  const status = noteDraftStatus(draft, note?.body ?? null);

  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <NoteHeader />

        <fetcher.Form method="post" className="space-y-2">
          <input type="hidden" name="intent" value="save-note" />
          <Textarea
            name="body"
            rows={4}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Jot down what you want to remember from this lesson..."
            aria-label="Your notes"
            className="min-h-28 resize-y"
          />

          <div className="flex items-center gap-3">
            <Button
              type="submit"
              size="sm"
              disabled={isSaving || !status.canSave}
            >
              {isSaving ? "Saving..." : "Save note"}
            </Button>

            <NoteStatusLine
              error={error}
              state={status.state}
              updatedAt={note?.updatedAt}
            />

            <span
              className={cn(
                "ml-auto text-xs",
                status.state === "too-long"
                  ? "text-destructive"
                  : "text-muted-foreground"
              )}
            >
              {status.length} / {status.max}
            </span>
          </div>
        </fetcher.Form>
      </CardContent>
    </Card>
  );
}

function NoteStatusLine({
  error,
  state,
  updatedAt,
}: {
  error: string | undefined;
  state: NoteDraftState;
  updatedAt: string | undefined;
}) {
  if (error) return <span className="text-sm text-destructive">{error}</span>;
  if (state === "unsaved" && updatedAt) {
    return (
      <span className="text-xs text-muted-foreground">Unsaved changes</span>
    );
  }
  if (state === "empty" && updatedAt) {
    return (
      <span className="text-xs text-muted-foreground">
        A note can't be empty
      </span>
    );
  }
  if (state === "saved" && updatedAt) {
    return (
      <span suppressHydrationWarning className="text-xs text-muted-foreground">
        Saved {formatRelativeTime(updatedAt)}
      </span>
    );
  }
  return null;
}

function NoteHeader() {
  return (
    <div className="mb-4 flex items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <NotebookPen className="size-5 text-primary" />
        <h2 className="text-xl font-semibold">Your Notes</h2>
      </div>
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        <Lock className="size-3" />
        Only you can see these
      </span>
    </div>
  );
}
