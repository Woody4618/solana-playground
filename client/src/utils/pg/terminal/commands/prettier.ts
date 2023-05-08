import { createCmd } from "./_command";
import { PgCommon } from "../../common";
import { Lang } from "../../explorer";
import { EventName } from "../../../../constants";

export const prettier = createCmd({
  name: "prettier",
  description: "Format the current file with prettier",
  process: async () => {
    await PgCommon.sendAndReceiveCustomEvent(EventName.EDITOR_FORMAT, {
      lang: Lang.TYPESCRIPT,
      fromTerminal: true,
    });
  },
});
