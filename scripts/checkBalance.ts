import { ethers } from "hardhat";
import { WUSD__factory } from "../typechain-types";

async function main() {
    const [owner, otherAccount] = await ethers.getSigners();

    const WUSD = WUSD__factory.connect(process.env.WUSD_ADDRESS, owner);

    const usdBalance = await WUSD.balanceOf(owner.address);
    const ethBalance = await owner.provider.getBalance(owner);

    console.log(`WUSD balance: ${ethers.formatEther(usdBalance)}`);
    console.log(`ETH balance: ${ethers.formatEther(ethBalance)}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
