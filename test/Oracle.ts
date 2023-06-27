import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { TypedEventLog } from "../typechain-types/common";
import { NewRequestEvent } from "../typechain-types/contracts/oracle/Oracle.sol/Oracle";

async function loadOracleFixtures() {
    const [owner, otherAccount] = await ethers.getSigners();

    const Oracle = await ethers.getContractFactory("Oracle");

    const oracle = await Oracle.deploy();

    return { oracle, owner, otherAccount };
}

const oracleFixtures = async () => loadFixture(loadOracleFixtures);

const get_rate = "get_rate";
const abiCoder = ethers.AbiCoder.defaultAbiCoder();

describe("Oracle", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.

    describe("Deployment", function () {
        it("Should have the right fee and name", async function () {
            const { oracle, owner, otherAccount } = await oracleFixtures();

            const query = await oracle.getQuery(get_rate);
            expect(query.name).equal("get_rate");
            expect(query.fee).equal(ethers.parseEther("0.01"));
        });
    });

    describe("Request query", function () {
        it("Should be able to add new requests", async function () {
            const { oracle, owner, otherAccount } = await oracleFixtures();

            const tnx = await oracle.newRequest(get_rate, "USD/ETH", {
                value: ethers.parseEther("0.1"),
            });

            const receipt = await tnx.wait(2);

            const [requestId, name, args] = (
                receipt!!.logs[0] as TypedEventLog<NewRequestEvent.Event>
            ).args;

            expect(Number(requestId)).to.equal(1);
            expect(Number(await oracle.lastRequestId())).to.equal(1);

            expect(args).to.equal("USD/ETH");

            const request = await oracle.getRequest(requestId);

            expect(request.origin).equal(owner.address);
            expect(request.served).to.be.false;
        });

        it("Should be able to deliver the result for request", async function () {
            const { oracle, owner, otherAccount } = await oracleFixtures();

            await oracle.newRequest(get_rate, "USD/ETH", {
                value: ethers.parseEther("0.1"),
            });

            const tnx = oracle.queryResult(
                1,
                abiCoder.encode(["uint256"], [1])
            );

            expect(tnx).revertedWith(
                "Transaction reverted: function call to a non-contract account"
            );
        });
    });
});
