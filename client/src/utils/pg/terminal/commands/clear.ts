import { createCmd } from "./_command";
import { PgTerminal } from "../terminal";

export const clear = createCmd({
  name: "clear",
  description: "Clear terminal",
  process: async () => {
    await PgTerminal.run({ clear: [{ full: true }] });
  },
});
