// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract YourContract {
    address public immutable owner;
    string public greeting;
    bool public premium;
    uint256 public totalCounter;
    mapping(address => uint256) public userGreetingCounter;

    event GreetingChange(
        address indexed greetingSetter,
        string newGreeting,
        bool premium,
        uint256 value
    );

    constructor(address _owner) {
        owner = _owner;
        greeting = "Building Onchain Summer";
    }

    function setGreeting(string memory _newGreeting) public payable {
        greeting = _newGreeting;
        totalCounter++;
        userGreetingCounter[msg.sender]++;
        premium = msg.value > 0;
        emit GreetingChange(msg.sender, _newGreeting, msg.value > 0, msg.value);
    }

    function withdraw() public {
        require(msg.sender == owner, "Not the owner");
        (bool ok,) = owner.call{value: address(this).balance}("");
        require(ok, "Transfer failed");
    }

    receive() external payable {}
}
