// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

error NotOwner();
error ZeroGoal();
error ZeroDonation();

contract DonateEntry {
    event Funded(address donor, uint256 amount, string data);

    address private immutable i_owner;
    uint256 private immutable i_goal;
    string private s_cid;
    uint256 private s_amountReceived;

    modifier onlyOwner() {
        if (msg.sender != i_owner) revert NotOwner();
        _;
    }

    constructor(
        address owner,
        string memory cid,
        uint256 goal
    ) {
        if (goal == 0) {
            revert ZeroGoal();
        }
        i_owner = owner;
        s_cid = cid;
        i_goal = goal;
    }

    function fund() public payable {
        if (msg.value == 0) {
            revert ZeroDonation();
        }
        s_amountReceived += msg.value;
        emit Funded(msg.sender, msg.value, string(msg.data));
    }

    function withdraw() public onlyOwner {
        (bool success, ) = i_owner.call{value: address(this).balance}("");
        require(success);
    }

    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getCid() public view returns (string memory) {
        return s_cid;
    }

    function getGoal() public view returns (uint256) {
        return i_goal;
    }

    function getAmountReceived() public view returns (uint256) {
        return s_amountReceived;
    }
}
