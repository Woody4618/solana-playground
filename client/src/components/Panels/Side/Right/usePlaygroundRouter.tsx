import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAtom } from "jotai";

import { Route } from "../../../../constants";
import { explorerAtom, refreshExplorerAtom } from "../../../../state";
import {
  PgCommon,
  PgExplorer,
  PgRouter,
  PgShare,
  PgTutorial,
  PgView,
  Sidebar,
} from "../../../../utils/pg";

export const usePlaygroundRouter = () => {
  const [explorer, setExplorer] = useAtom(explorerAtom);
  const [, refreshExplorer] = useAtom(refreshExplorerAtom);

  const [loading, setLoading] = useState(true);

  const { pathname } = useLocation();

  // Initialize explorer
  useEffect(() => {
    (async () => {
      try {
        // Default
        if (pathname === Route.DEFAULT) {
          const _explorer = new PgExplorer(refreshExplorer);
          await _explorer.init();

          // If it's a tutorial, navigate to the tutorial's path
          if (
            _explorer.currentWorkspaceName &&
            PgTutorial.isWorkspaceTutorial(_explorer.currentWorkspaceName)
          ) {
            await PgTutorial.open(_explorer.currentWorkspaceName);
          }

          setExplorer(_explorer);
        }

        // Tutorials
        else if (pathname.startsWith(Route.TUTORIALS)) {
          const _explorer = new PgExplorer(refreshExplorer);
          await _explorer.init();
          setExplorer(_explorer);
        }

        // Github
        else if (pathname.startsWith(Route.GITHUB)) {
          const _explorer = new PgExplorer(refreshExplorer);
          await _explorer.init();

          // Import the repository
          await _explorer.importFromGithub(
            pathname.split(`${Route.GITHUB}/`)?.[1]
          );
          // Navigate to main(will re-run current function)
          PgRouter.navigate(Route.DEFAULT);
        }

        // Shared
        else if (
          PgShare.isValidPathname(pathname) &&
          !(await PgCommon.timeout(PgExplorer.get()))?.isShared
        ) {
          const explorerData = await PgShare.get(pathname);
          setExplorer(new PgExplorer(refreshExplorer, explorerData));
        }

        // Not found
        else {
          PgRouter.navigate(Route.DEFAULT);
        }
      } catch (e: any) {
        console.log(e.message);
        PgRouter.navigate(Route.DEFAULT);
      }
    })();
  }, [pathname, setExplorer, refreshExplorer]);

  // Handle workspace change/deletion
  useEffect(() => {
    if (!explorer) return;

    const initWorkspace = explorer.onDidChangeWorkspace(() => {
      if (!explorer.currentWorkspaceName) return;

      // If it's a tutorial, navigate to the tutorial's path
      if (PgTutorial.isWorkspaceTutorial(explorer.currentWorkspaceName)) {
        PgTutorial.open(explorer.currentWorkspaceName);
      } else {
        PgRouter.navigate(Route.DEFAULT);
      }
    });

    const deleteWorkspace = explorer.onDidDeleteWorkspace(() => {
      // Set view to the default editor if there are no workspaces
      if (!explorer.hasWorkspaces()) PgView.setMain();
    });

    return () => {
      initWorkspace.dispose();
      deleteWorkspace.dispose();
    };
  }, [explorer]);

  // Handle sidebar state change
  useEffect(() => {
    if (!explorer) return;

    const disposable = PgView.onDidChangeSidebarState(async (sidebarState) => {
      const { pathname } = await PgRouter.getLocation();
      if (
        sidebarState === Sidebar.TUTORIALS &&
        !pathname.startsWith(Route.TUTORIALS)
      ) {
        PgRouter.navigate(Route.TUTORIALS);
      } else if (sidebarState !== Sidebar.TUTORIALS && !explorer.isShared) {
        const tutorial = PgTutorial.getTutorialFromPathname(pathname);
        if (!tutorial) {
          PgRouter.navigate(Route.DEFAULT);
        } else if (
          pathname !== Route.TUTORIALS &&
          pathname.startsWith(Route.TUTORIALS)
        ) {
          if (explorer.currentWorkspaceName !== tutorial.name) {
            if (explorer.allWorkspaceNames?.includes(tutorial.name)) {
              await explorer.changeWorkspace(tutorial.name);
            } else {
              await PgRouter.navigate(Route.DEFAULT);
            }
          } else {
            const metadata = await PgTutorial.getMetadata(tutorial.name);
            if (metadata.pageNumber) {
              PgTutorial.setPageNumber(metadata.pageNumber);
            }
          }
        }
      }
    });

    return () => disposable.dispose();
  }, [explorer]);

  // Handle loading state
  useEffect(() => {
    setLoading(true);
    if (explorer) setLoading(false);
  }, [explorer]);

  return { loading };
};
