import { ethers } from "hardhat";
import { WUSD__factory } from "../typechain-types";

async function main() {
    const [owner, otherAccount] = await ethers.getSigners();

    const ETH_TO_EXCHANGE = "1.01";

    const usd = WUSD__factory.connect(process.env.WUSD_ADDRESS, owner);

    const tnx = await usd.deposit({
        value: ethers.parseEther(ETH_TO_EXCHANGE),
    });

    await tnx.wait();

    console.log(`Sent request to exchange ${ETH_TO_EXCHANGE} ETH`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
