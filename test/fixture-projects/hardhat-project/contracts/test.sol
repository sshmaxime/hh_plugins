// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MyContract {
    struct s_Record {
        uint256 index;
        string name;
        address recordShares;
        string[] words;
    }

    function generateRecord(
        uint256 index,
        string memory name,
        address recordShares
    ) public pure returns (s_Record memory) {
        string[] memory words;

        return s_Record({ index: index, name: name, recordShares: recordShares, words: words });
    }
}
