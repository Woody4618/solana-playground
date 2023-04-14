import { useEffect, lazy, Suspense, useState } from "react";
import { useAtom } from "jotai";
import styled, { css } from "styled-components";

import Home from "./Home";
import { MainViewLoading } from "../../../../../../components/Loading";
import { explorerAtom, refreshExplorerAtom } from "../../../../../../state";
import { Lang, PgCommon } from "../../../../../../utils/pg";

const CodeMirror = lazy(() => import("./CodeMirror"));
const Monaco = lazy(() => import("./Monaco"));

const Editor = () => {
  const [explorer] = useAtom(explorerAtom);
  const [explorerChanged] = useAtom(refreshExplorerAtom);

  const [showHome, setShowHome] = useState<boolean>();
  const [showMonaco, setShowMonaco] = useState<boolean>();

  // Decide which editor to show
  useEffect(() => {
    if (!explorer) return;

    setShowHome(!explorer.getTabs().length);

    const lang = explorer.getCurrentFileLanguage();
    setShowMonaco(!(lang === Lang.RUST || lang === Lang.PYTHON));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [explorer, explorerChanged]);

  // Save explorer metadata
  useEffect(() => {
    if (!explorer) return;

    // Save metadata to IndexedDB if we haven't rendered in 5s
    const saveMetadataIntervalId = PgCommon.setIntervalOnFocus(() => {
      explorer.saveMeta().catch();
    }, 5000);

    return () => clearInterval(saveMetadataIntervalId);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [explorer, explorerChanged]);

  if (showHome === undefined || showMonaco === undefined) {
    return <MainViewLoading />;
  }

  return (
    <Suspense fallback={<MainViewLoading />}>
      <Wrapper>
        {showHome ? <Home /> : showMonaco ? <Monaco /> : <CodeMirror />}
      </Wrapper>
    </Suspense>
  );
};

export const EDITOR_SCROLLBAR_WIDTH = "0.75rem";

const Wrapper = styled.div`
  ${({ theme }) => css`
    flex: 1;
    overflow: auto;
    background: ${theme.components.home.default.bg};
    font-size: ${theme.font.code.size.large};

    & > div {
      height: 100%;
    }

    /* Scrollbar */
    /* Chromium */
    &::-webkit-scrollbar,
    & ::-webkit-scrollbar {
      width: ${EDITOR_SCROLLBAR_WIDTH};
      height: 0.75rem;
    }

    &::-webkit-scrollbar-track,
    & ::-webkit-scrollbar-track {
      background-color: ${theme.components.sidebar.right.default.bg};
      border-left: 1px solid ${theme.colors.default.border};
    }

    &::-webkit-scrollbar-thumb,
    & ::-webkit-scrollbar-thumb {
      border: 0.25rem solid transparent;
      background-color: ${theme.default.scrollbar.thumb.color};
    }

    &::-webkit-scrollbar-thumb:hover,
    & ::-webkit-scrollbar-thumb:hover {
      background-color: ${theme.default.scrollbar.thumb.hoverColor};
    }

    & ::-webkit-scrollbar-corner {
      background-color: ${theme.components.sidebar.right.default.bg};
    }
  `}
`;

export default Editor;
