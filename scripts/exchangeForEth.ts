import { ethers } from "hardhat";
import { WUSD__factory } from "../typechain-types";

async function main() {
    const [owner, otherAccount] = await ethers.getSigners();

    const USD_TO_EXCHANGE = "100";

    const usd = WUSD__factory.connect(process.env.WUSD_ADDRESS, owner);

    const tnx = await usd.withdraw(ethers.parseEther(USD_TO_EXCHANGE), {
        value: ethers.parseEther("0.01"),
    });

    await tnx.wait();

    console.log(`Sent request to exchange ${USD_TO_EXCHANGE} USD`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
