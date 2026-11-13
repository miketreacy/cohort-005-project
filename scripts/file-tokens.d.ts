// Types for file-tokens.js, which stays plain JavaScript so the pre-commit
// hook can run it with `node` and no build step.
export declare const MAX_TOKENS: number;
export declare const tokensOf: (bytes: number) => number;
export declare const judge: (
  tokens: number,
  baseTokens: number | null
) => "ok" | "over" | "grew";
