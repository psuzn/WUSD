// SPDX-License-Identifier: Apache v2.0
pragma solidity ^0.8.9;

// import "hardhat/console.sol";

interface OracleCallback {
    function _callback(uint256 id, uint256 result) external;
}

contract Oracle {
    event NewQueryMethod(string name, uint256 fee);
    event NewRequest(uint256 id, string query, string arguments);
    event RequestServed(uint256 id);

    error OracleQueryNotFound(string id);
    error InSufficientFeeSent(string id, uint256 required, uint256 sent);
    error NotATrustedSource(address sender);
    error RequestAlreadyServed(uint256 id);
    error RequestNotFound(uint256 id);

    struct QueryMethod {
        string name;
        uint256 fee;
    }

    struct QueryRequest {
        address origin;
        bool served;
    }

    modifier onlyTrustedSource(address sender) {
        if (sender != trustedSource) {
            revert NotATrustedSource(sender);
        }
        _;
    }

    mapping(string => QueryMethod) private methods;
    mapping(uint256 => QueryRequest) private requests;

    uint256 public lastRequestId;
    address public trustedSource;

    constructor() {
        _addNewMethod("get_rate", 0.01 ether);

        trustedSource = msg.sender;
    }

    function _addNewMethod(string memory queryName, uint256 fee) private {
        methods[queryName] = QueryMethod({name: queryName, fee: fee});
        emit NewQueryMethod(queryName, fee);
    }

    function newRequest(
        string memory method,
        string calldata arguments
    ) public payable returns (uint256) {
        uint256 fee = getQueryFee(method);

        if (msg.value < fee) {
            revert InSufficientFeeSent(method, fee, msg.value);
        }

        uint256 requestId = ++lastRequestId;

        requests[requestId] = QueryRequest({origin: msg.sender, served: false});

        emit NewRequest(requestId, method, arguments);

        return requestId;
    }

    function queryResult(
        uint256 requestId,
        uint256 result
    ) public onlyTrustedSource(msg.sender) {
        if (requests[requestId].served) {
            revert RequestAlreadyServed(requestId);
        }

        requests[requestId].served = true;

        OracleCallback(requests[requestId].origin)._callback(requestId, result);

        emit RequestServed(requestId);
    }

    function getQueryFee(string memory query) public view returns (uint256) {
        uint256 fee = methods[query].fee;
        if (fee == 0) {
            // no query is free
            revert OracleQueryNotFound(query);
        }
        return fee;
    }

    function getQuery(
        string memory method
    ) public view returns (QueryMethod memory) {
        QueryMethod memory oracleQuery = methods[method];
        if (oracleQuery.fee == 0) {
            // no query is free
            revert OracleQueryNotFound(method);
        }
        return oracleQuery;
    }

    function getRequest(uint256 id) public view returns (QueryRequest memory) {
        QueryRequest memory request = requests[id];
        if (request.origin == address(0)) {
            revert RequestNotFound(id);
        }
        return request;
    }
}

abstract contract usingOracle is OracleCallback {
    error InvalidOracleAddress(address);
    error NotTheOracle(address);

    Oracle private oracle;

    modifier onlyOracle() {
        if (address(oracle) != msg.sender) {
            revert NotTheOracle(msg.sender);
        }
        _;
    }

    constructor(address oracleAddress) {
        if (oracleAddress.code.length == 0) {
            revert InvalidOracleAddress(oracleAddress);
        }

        oracle = Oracle(oracleAddress);
    }

    function oracleRequest(
        string memory query,
        string memory arguments
    ) internal returns (uint256) {
        uint256 fee = oracle.getQueryFee(query);

        return oracle.newRequest{value: fee}(query, arguments);
    }

    function oracleQueryFee(string memory query) public view returns (uint256) {
        return oracle.getQueryFee(query);
    }
}
