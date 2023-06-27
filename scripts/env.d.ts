declare global {
  namespace NodeJS {
    interface ProcessEnv {
      TEST_MNEMONICS: string;
      TRUSTED_ACCOUNT_MNEMONICS: string;
      JSON_RPC_URL: string;
      CHAIN_ID: string;
      ORACLE_ADDRESS: string;
      WUSD_ADDRESS: string;
    }
  }
}

export {}
