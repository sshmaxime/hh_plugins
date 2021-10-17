// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MyContract {
    string private a;

    function returnMeSomething() public pure returns (string memory) {
        return "alpha";
    }

    function setA(string memory newA) public {
        a = newA;
    }

    function getA() public view returns (string memory) {
        return a;
    }
}
