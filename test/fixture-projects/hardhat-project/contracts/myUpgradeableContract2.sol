// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract MyUpgradeableContract2 is Initializable { 
    function returnMeSomething() public pure returns (string memory) {
        return "beta";
    }
}
