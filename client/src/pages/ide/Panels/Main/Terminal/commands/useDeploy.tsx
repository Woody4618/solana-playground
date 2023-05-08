import { useCallback, useState } from "react";
import { useAtom } from "jotai";
import { PublicKey } from "@solana/web3.js";

import {
  DEFAULT_PROGRAM,
  deployCountAtom,
  Program,
  refreshProgramIdAtom,
  TerminalAction,
  txHashAtom,
} from "../../../../../../state";
import {
  PgCommon,
  PgConnection,
  PgDeploy,
  PgProgramInfo,
  PgTerminal,
  PgWallet,
} from "../../../../../../utils/pg";
import { useAsyncEffect, usePgConnection } from "../../../../../../hooks";

export const useDeploy = (program: Program = DEFAULT_PROGRAM) => {
  const [, setTxHash] = useAtom(txHashAtom);
  const [, setDeployCount] = useAtom(deployCountAtom);

  const { authority, hasAuthority, upgradeable } = useAuthority();

  const runDeploy = useCallback(async () => {
    if (upgradeable === false) {
      PgTerminal.log(PgTerminal.warning("The program is not upgradeable."));
      return;
    }
    if (hasAuthority === false) {
      PgTerminal.log(
        `${PgTerminal.warning(
          "You don't have the authority to upgrade this program."
        )}
Program ID: ${PgProgramInfo.getPk()!.programPk}
Program authority: ${authority}
Your address: ${PgWallet.getKp().publicKey}`
      );
      return;
    }

    PgTerminal.setTerminalState(TerminalAction.deployLoadingStart);
    PgTerminal.log(
      `${PgTerminal.info(
        "Deploying..."
      )} This could take a while depending on the program size and network conditions.`
    );
    PgTerminal.setProgress(0.1);

    let msg;
    try {
      const wallet = await PgWallet.get();
      const startTime = performance.now();
      const txHash = await PgDeploy.deploy(wallet, program.buffer);
      const timePassed = (performance.now() - startTime) / 1000;
      setTxHash(txHash);

      msg = `${PgTerminal.success(
        "Deployment successful."
      )} Completed in ${PgCommon.secondsToTime(timePassed)}.`;

      setDeployCount((c) => c + 1);
    } catch (e: any) {
      const convertedError = PgTerminal.convertErrorMessage(e.message);
      msg = `Deployment error: ${convertedError}`;
      return 1; // To indicate error
    } finally {
      PgTerminal.log(msg + "\n");
      PgTerminal.setTerminalState(TerminalAction.deployLoadingStop);
      PgTerminal.setProgress(0);
    }
  }, [
    program,
    authority,
    hasAuthority,
    upgradeable,
    setTxHash,
    setDeployCount,
  ]);

  return { runDeploy, hasAuthority, upgradeable };
};

interface ProgramData {
  upgradeable: boolean;
  authority?: PublicKey;
}

const useAuthority = () => {
  // To re-render if user changes program id
  const [programIdCount] = useAtom(refreshProgramIdAtom);

  const { connection: conn } = usePgConnection();

  const [programData, setProgramData] = useState<ProgramData>({
    upgradeable: true,
  });

  useAsyncEffect(async () => {
    if (!PgConnection.isReady(conn)) return;

    const programPk = PgProgramInfo.getPk()?.programPk;
    if (!programPk) return;

    try {
      const programAccountInfo = await conn.getAccountInfo(programPk);
      const programDataPkBuffer = programAccountInfo?.data.slice(4);
      if (!programDataPkBuffer) {
        setProgramData({ upgradeable: true });
        return;
      }
      const programDataPk = new PublicKey(programDataPkBuffer);

      const programDataAccountInfo = await conn.getAccountInfo(programDataPk);

      // Check if program authority exists
      const authorityExists = programDataAccountInfo?.data.at(12);
      if (!authorityExists) {
        setProgramData({ upgradeable: false });
        return;
      }

      const upgradeAuthorityPkBuffer = programDataAccountInfo?.data.slice(
        13,
        45
      );

      const upgradeAuthorityPk = new PublicKey(upgradeAuthorityPkBuffer!);

      setProgramData({ authority: upgradeAuthorityPk, upgradeable: true });
    } catch (e: any) {
      console.log("Could not get authority:", e.message);
    }
  }, [conn, programIdCount]);

  return {
    authority: programData.authority,
    hasAuthority:
      programData.authority &&
      programData.authority.equals(PgWallet.getKp().publicKey),
    upgradeable: programData.upgradeable,
  };
};
