import { ethers } from "hardhat";

async function main() {
    const [owner, otherAccount] = await ethers.getSigners();

    const Oracle = await ethers.getContractFactory("Oracle");
    const WUSD = await ethers.getContractFactory("WUSD");

    const oracle = await Oracle.deploy();
    const wUSD = await WUSD.deploy(oracle);

    console.log(`Oracle deployed at: ${await oracle.getAddress()}`);
    console.log(`WUSD deployed at: ${await wUSD.getAddress()}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
