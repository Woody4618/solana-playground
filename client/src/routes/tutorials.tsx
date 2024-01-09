import { Tutorials } from "../components/Tutorials";
import { PgExplorer, PgRouter, PgView } from "../utils/pg";

export const tutorials = PgRouter.create({
  path: "/tutorials",
  handle: () => {
    // Set main view
    PgView.setMain(async () => {
      // Initialize explorer
      await PgExplorer.init();

      // Set sidebar
      PgView.setSidebarPage("Tutorials");

      return Tutorials;
    });

    // Handle sidebar
    // TODO: Handle this in a better way
    return PgView.onDidChangeSidebarPage((state) => {
      switch (state) {
        case "Explorer":
        case "Build & Deploy":
        case "Test":
          PgRouter.navigate();
      }
    });
  },
});
