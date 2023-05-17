// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./DonateEntry.sol";

contract Donate3 {
    event EntryCreated(address donateEntry, address owner);

    function createEntry(string memory cid, uint256 goal) public returns (address) {
        DonateEntry donateEntry = new DonateEntry(msg.sender, cid, goal);
        emit EntryCreated(address(donateEntry), msg.sender);
        return address(donateEntry);
    }
}
