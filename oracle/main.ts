import { ethers } from "hardhat";
import { oracle, trustedSigner } from "./chain";

const BIG_NUMBER = BigInt(10 ** 18);
const USD_PER_ETH = BigInt(1000); // our exchange rate

const ONE_ETH = ethers.parseEther("1");
const ONE_USD = BigInt(10 ** 18); // WUSD has 18 decimal places

const USD_PER_WEI = (ONE_USD * BIG_NUMBER * USD_PER_ETH) / ONE_ETH;
const WEI_PER_USD = (BIG_NUMBER * BIG_NUMBER) / USD_PER_WEI;

const abiCoder = ethers.AbiCoder.defaultAbiCoder();

const handleGetRateMethod = async (id: bigint, pair: string) => {
    if (pair === "USD/ETH" || pair === "ETH/USD") {
        const rate = pair == "USD/ETH" ? USD_PER_WEI : WEI_PER_USD;

        const result = abiCoder.encode(["uint256"], [rate]);

        const tnx = await oracle.connect(trustedSigner).queryResult(id, result);

        await tnx.wait();

        console.log(`Sent oracle response for requestId: '${id}'`);
    } else {
        console.error(`Unsupported pair ${pair}`);
    }
};

function main() {
    oracle.on(oracle.filters.NewRequest(), (...args: any) => {
        const [id, query, arg] = args[0].args;

        console.log(
            `Received oracle request: '${query}' with (requestId: '${id}', arg: '${arg}')`
        );

        switch (query) {
            case "get_rate":
                handleGetRateMethod(id, arg);
                break;

            // new methods can be added here
        }
    });

    console.log("Oracle is running");
}

main();
