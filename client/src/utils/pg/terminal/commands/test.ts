import { createCmd } from "./_command";
import { PgCommon } from "../../common";
import { EventName } from "../../../../constants";

export const test = createCmd({
  name: "test",
  description: "Run test(s)",
  process: async (input) => {
    const match = new RegExp(/^\w+\s?(.*)/).exec(input);
    await PgCommon.sendAndReceiveCustomEvent(EventName.CLIENT_RUN, {
      isTest: true,
      path: match && match[1],
    });
  },
});
