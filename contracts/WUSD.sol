// SPDX-License-Identifier: Apache v2.0
pragma solidity ^0.8.9;

import "./oracle/Oracle.sol";

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// import "hardhat/console.sol";

contract WUSD is ERC20, usingOracle {
    event NewRequest(uint256 id);
    event RequestServed(uint256 id);

    error NotEnoughFeeSent();
    error NotEnoughTokens();
    error NotEnoughLP();
    error ZeroAmount();
    error RequestNotFound(uint256 id);
    error RequestAlreadyServed(uint256 id);

    enum RequestType {
        DEPOSIT,
        WITHDRAW
    }

    struct ExchangeRequest {
        RequestType rType;
        address destination;
        uint256 amount;
        bool processed;
    }

    uint256 private constant BIG_NUMBER = 10 ** 18;
    string private constant get_rate = "get_rate";

    mapping(uint256 => ExchangeRequest) private requests;

    constructor(address oracle) ERC20("WUSD", "W$") usingOracle(oracle) {}

    // deposits ETH and gets the USD in return
    function deposit() public payable {
        uint256 fee = oracleQueryFee(get_rate);
        uint256 value = msg.value;

        if (value < fee) {
            revert NotEnoughFeeSent();
        }

        uint256 toConvert = value - fee;

        if (toConvert == 0) {
            revert ZeroAmount();
        }

        uint256 requestId = oracleRequest(get_rate, "USD/ETH");

        requests[requestId] = ExchangeRequest({
            rType: RequestType.DEPOSIT,
            destination: msg.sender,
            amount: toConvert,
            processed: false
        });

        emit NewRequest(requestId);
    }

    // deposits WUSD and gets the ETH in return
    function withdraw(uint256 amount) public payable {
        uint256 fee = oracleQueryFee(get_rate);
        uint256 value = msg.value;

        if (value < fee) {
            revert NotEnoughFeeSent();
        }

        if (amount == 0) {
            revert ZeroAmount();
        }

        if (balanceOf(msg.sender) < amount) {
            revert NotEnoughTokens();
        }

        _transfer(msg.sender, address(this), amount);

        uint256 requestId = oracleRequest(get_rate, "ETH/USD");

        requests[requestId] = ExchangeRequest({
            rType: RequestType.WITHDRAW,
            destination: msg.sender,
            amount: amount,
            processed: false
        });

        emit NewRequest(requestId);
    }

    function _callback(uint256 id, uint256 result) public onlyOracle {
        ExchangeRequest memory request = requests[id];

        if (request.processed) {
            revert RequestAlreadyServed(id);
        }

        requests[id].processed = true;

        if (request.rType == RequestType.DEPOSIT) {
            _deposit(request.amount, request.destination, result);
        } else if (request.rType == RequestType.WITHDRAW) {
            _withdraw(request.amount, payable(request.destination), result);
        }

        emit RequestServed(id);
    }

    function _deposit(
        uint256 ethAmount,
        address destination,
        uint256 rate
    ) private {
        uint256 usdAmount = (ethAmount * rate) / BIG_NUMBER;
        if (usdAmount == 0) {
            revert ZeroAmount();
        }

        _mint(destination, usdAmount);
    }

    function _withdraw(
        uint256 usdAmount,
        address payable destination,
        uint256 rate
    ) private {
        uint256 ethAmount = (usdAmount * rate) / BIG_NUMBER;

        if (ethAmount == 0) {
            revert ZeroAmount();
        }

        if (ethAmount > address(this).balance) {
            revert NotEnoughLP();
        }

        destination.transfer(ethAmount);

        _burn(address(this), usdAmount);
    }

    function getExchangeRequest(
        uint256 id
    ) public view returns (ExchangeRequest memory) {
        ExchangeRequest memory request = requests[id];

        if (request.amount == 0) {
            // amount can never be zero for a valid request
            revert RequestNotFound(id);
        }

        return request;
    }
}
