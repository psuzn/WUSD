# Stable WUSD using off-chain Oracle

This is a sample project demonstrating how a simple oracle can be implemented and used for EVM.

It has a `WUSD` contract which is an equivalent version of the US dollar. With the help of an oracle providing the latest exchange rate between Ethereum and the US dollar, the `WUSD` contract converts the `ETH` to `WUSD` or vice versa.

## Project structure

```
├── contracts
│   ...
│   ├── oracle
│   │   └── Oracle.sol
│   └── WUSD.sol
│
├─ oracle           # Offchain oracle
│   │ ...
│   └── main.ts
│
├── scrips          # Hardhat scripts
│   │ ...
│   └── deploy.ts
│
├─── run            # utility script
├─── package.json
└─── hardhat.config.ts
```

## Running the Project

There is a utility script [`run`](./run) which has some utility methods to make it easier to set up and run the project.

All available tasks can be printed by just running `./run`. They are:

-   `setup`
-   `balance` : runs [`./scripts/checkBalance.ts`](./scripts/checkBalance.ts)
-   `clean` : deletes hardhat artifacts, caches and generated ts type bindings
-   `deploy` : runs [`./scripts/deploy.ts`](./scripts/deploy.ts) script
-   `ex_eth` : runs [`./scripts/exchangeForUSD.ts`](./scripts/exchangeForUSD.ts)
-   `ex_usd` : runs [`./scripts/exchangeForEth.ts`](./scripts/exchangeForEth.ts)
-   `node` : Starts hardhat eth node in verbose mode
-   `oracle`: Runs the oracle [`./oracle/main.ts`](./oracle/main.ts)

### Steps

1. Clone this reo

    ```sh
    git clone git@github.com:psuzn/stable-wusd.git
    ```

2. Setup the dependencies

    ```sh
    ./run setup
    ```

    It does the following:

    - Installs the npm dependencies
    - Generates .env types
    - Compiles contracts and generates type bindings <br /> <br />

3. Start the hardhat node in a terminal instance

    ```sh
    ./run node
    ```

4. Once the hardhat node starts running, deploy the contracts (**on another terminal session**)

    ```sh
    ./run deploy
    ```

    It will print something like this:

    ```
    Oracle deployed at: 0x7845341Ba766Ac8c8Bf1aCB6c4bEaBCb988Cb20D
    WUSD deployed at: 0x03a16C47Fa284E13E3Ea628dCB5C7CD7d6F085d6
    ```

    If the contract addresses are different on yours update them on `.env` file.

5. Start the Oracle

    ```sh
    ./run oracle
    ```

6. Now, finally!! You can exchange the `ETH` for `WUSD`

    ```sh
    ./run balance ex_eth balance
    ```

    **Node**: You can chain the different tasks from the utility. Here first it will check the balance, then exchanges the eth for USD and again checks the balance.

    You can update the rate and exchange for the coins and exchange the tokens again. **Make sure** to stop and re run the oracle once you update the rates.

    ```ts
    oracle/main.ts;

    ...
    const BIG_NUMBER = BigInt(10 ** 18);
    const USD_PER_ETH = BigInt(1000); // our exchange rate
                            👆
    ```

    ## Disclaimer

    This project is for learning purpose only and not intended for production. There are a **lot** of room for improvements and gas optimization which are deliberately left to make it readable and easier to understand.

## References

-   [What Is a Blockchain Oracle?](https://chain.link/education/blockchain-oracles)
-   [Oracle: solidity-patterns](https://fravoll.github.io/solidity-patterns/oracle.html)
-   [ethereum-api/oraclizeAPI.so](https://github.com/provable-things/ethereum-api/blob/master/oraclizeAPI.sol)
