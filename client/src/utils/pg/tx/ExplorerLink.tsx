import { FC } from "react";
import styled from "styled-components";

import Link from "../../../components/Link";
import { PgCommon } from "../common";
import { PgSettings } from "../settings";

interface ExplorerLinkProps {
  txHash: string;
}

export const ExplorerLink: FC<ExplorerLinkProps> = ({ txHash }) => {
  const { explorer, solscan } = PgCommon.getExplorerTxUrls(
    txHash,
    PgSettings.connection.endpoint
  );

  return (
    <Wrapper>
      <Link href={explorer}>Solana Explorer</Link>
      {solscan && <Link href={solscan}>Solscan</Link>}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  justify-content: space-around;

  & > a:hover {
    text-decoration: underline;
  }
`;
