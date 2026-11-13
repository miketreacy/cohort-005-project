// The size rule behind scripts/check-file-tokens.js, kept apart from the CLI
// so a test can call it.
//
// It is a ratchet. A file at or under the limit stays there. A file that was
// already over the limit at HEAD may be edited, but may not grow: a small fix
// to a big legacy file does not force the whole file to be split in the same
// change. A split is a change of its own.

export const MAX_TOKENS = 5000;
const BYTES_PER_TOKEN = 4;

export const tokensOf = (bytes) => Math.ceil(bytes / BYTES_PER_TOKEN);

/**
 * @param {number} tokens the file's size now
 * @param {number | null} baseTokens its size at HEAD; null for a new file
 * @returns {"ok" | "over" | "grew"}
 */
export const judge = (tokens, baseTokens) => {
  if (tokens <= MAX_TOKENS) return "ok";
  if (baseTokens === null || baseTokens <= MAX_TOKENS) return "over";
  return tokens <= baseTokens ? "ok" : "grew";
};
