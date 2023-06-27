import { ethers } from "hardhat";
import { Oracle, Oracle__factory } from "../typechain-types";
import { config } from "./config";

const jsonRpcProvider = new ethers.JsonRpcProvider(config.JSON_RPC_URL, {
    name: "binance",
    chainId: config.CHAIN_ID,
});

export const trustedSigner = ethers.Wallet.fromPhrase(
    process.env.TRUSTED_ACCOUNT_MNEMONICS,
    jsonRpcProvider
);

export const oracle: Oracle = Oracle__factory.connect(
    config.ORACLE_ADDRESS,
    jsonRpcProvider
);
