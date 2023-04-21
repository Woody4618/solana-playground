import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import { useAtom } from "jotai";
import { PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import styled, { css } from "styled-components";

import Button from "../Button";
import Input from "../Input";
import Foldable from "../Foldable";
import { uiBalanceAtom, txHashAtom } from "../../state";
import { PgCommon, PgTerminal, PgTx, PgValidator } from "../../utils/pg";
import { PgThemeManager } from "../../utils/pg/theme";
import { useCurrentWallet, usePgConnection } from "../../hooks";

const Send = () => (
  <Wrapper>
    <Foldable ClickEl={<Title>Send</Title>}>
      <SendExpanded />
    </Foldable>
  </Wrapper>
);

const Wrapper = styled.div`
  ${({ theme }) => css`
    ${PgThemeManager.convertToCSS(theme.components.wallet.main.send.default)};
  `}
`;

const Title = styled.div`
  ${({ theme }) => css`
    ${PgThemeManager.convertToCSS(theme.components.wallet.main.send.title)};
  `}
`;

const SendExpanded = () => {
  const [, setTxHash] = useAtom(txHashAtom);
  const [balance] = useAtom(uiBalanceAtom);

  const [address, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [disabled, setDisabled] = useState(true);
  const [loading, setLoading] = useState(false);

  const addressInputRef = useRef<HTMLInputElement>(null);
  const amountInputRef = useRef<HTMLInputElement>(null);

  // Send button disable
  useEffect(() => {
    if (
      PgValidator.isPubkey(address) &&
      PgValidator.isFloat(amount) &&
      balance &&
      balance > parseFloat(amount)
    ) {
      setDisabled(false);
    } else setDisabled(true);
  }, [address, amount, balance, setDisabled]);

  const handleChangeAddress = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setRecipient(e.target.value);
    },
    [setRecipient]
  );

  const handleChangeAmount = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setAmount(e.target.value);
    },
    [setAmount]
  );

  const { connection: conn } = usePgConnection();
  const { currentWallet } = useCurrentWallet();

  const send = () => {
    PgTerminal.process(async () => {
      if (!currentWallet) return;

      setLoading(true);
      PgTerminal.log(PgTerminal.info(`Sending ${amount} SOL to ${address}...`));

      let msg = "";

      try {
        const pk = new PublicKey(address);

        const ix = SystemProgram.transfer({
          fromPubkey: currentWallet.publicKey,
          toPubkey: pk,
          lamports: PgCommon.solToLamports(parseFloat(amount)),
        });

        const tx = new Transaction().add(ix);

        const txHash = await PgCommon.transition(
          PgTx.send(tx, conn, currentWallet)
        );
        setTxHash(txHash);
        msg = PgTerminal.success("Success.");
      } catch (e: any) {
        const convertedError = PgTerminal.convertErrorMessage(e.message);
        msg = `Transfer error: ${convertedError}`;
      } finally {
        setLoading(false);
        PgTerminal.log(msg + "\n");
      }
    });
  };

  return (
    <ExpandedWrapper>
      <ExpandedInput
        ref={addressInputRef}
        onChange={handleChangeAddress}
        validator={PgValidator.isPubkey}
        placeholder="Recipient address"
      />
      <ExpandedInput
        ref={amountInputRef}
        onChange={handleChangeAmount}
        validator={(input) => {
          if (
            !PgValidator.isFloat(input) ||
            (balance && parseFloat(input) > balance)
          ) {
            throw new Error("Invalid amount");
          }
        }}
        placeholder="SOL amount"
      />
      <ExpandedButton
        onClick={send}
        disabled={disabled || loading}
        btnLoading={loading}
        kind="primary-transparent"
        fullWidth
      >
        Send
      </ExpandedButton>
    </ExpandedWrapper>
  );
};

const ExpandedWrapper = styled.div`
  ${({ theme }) => css`
    ${PgThemeManager.convertToCSS(
      theme.components.wallet.main.send.expanded.default
    )};
  `}
`;

const ExpandedInput = styled(Input)`
  ${({ theme }) => css`
    ${PgThemeManager.convertToCSS(
      theme.components.wallet.main.send.expanded.input
    )};
  `}
`;

const ExpandedButton = styled(Button)`
  ${({ theme }) => css`
    ${PgThemeManager.convertToCSS(
      theme.components.wallet.main.send.expanded.sendButton
    )};
  `}
`;

export default Send;
