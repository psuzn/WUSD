import dotenv from "dotenv";

dotenv.config();

export const config = {
    JSON_RPC_URL: process.env.JSON_RPC_URL,
    CHAIN_ID: Number(process.env.CHAIN_ID),
    ORACLE_ADDRESS: process.env.ORACLE_ADDRESS,
    TRUSTED_ACCOUNT_MNEMONICS: process.env.TRUSTED_ACCOUNT_MNEMONICS,
};
