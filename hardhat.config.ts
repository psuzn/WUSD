import "@nomicfoundation/hardhat-toolbox";
import dotenv from "dotenv";
import { HardhatUserConfig, task } from "hardhat/config";

dotenv.config();
// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
    const accounts = await hre.ethers.getSigners();

    for (const account of accounts) {
        console.log(account.address);
    }
});

const config: HardhatUserConfig = {
    solidity: "0.8.18",
    networks: {
        local: {
            url: "http://127.0.0.1:8545",
            accounts: {
                mnemonic: String(process.env.TEST_MNEMONICS),
                count: 100,
                initialIndex: 0,
            },
        },
        hardhat: {
            loggingEnabled: true,
            accounts: {
                mnemonic: String(process.env.TEST_MNEMONICS),
                count: 10,
                initialIndex: 0,
            },
            mining: {
                auto: true,
                interval: 1000,
            },
        },
    },
};

export default config;
