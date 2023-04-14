// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract LotteryFactory {
    address payable[] public deployedLotteries;

    function createLottery(uint minimum) public {
        address newLottery = address(new Lottery(minimum, msg.sender));
        deployedLotteries.push(payable(newLottery));
    }

    function getDeployedLotteries() public view returns (address payable[] memory) {
        return deployedLotteries;
    }
}

contract Lottery {
    address public manager;
    uint public minimumParticipation;
    address payable[] public players;
    
    // Emitted when the winner has been picked
    event WinnerHasBeenPicked(address winnerAddress);

    constructor(uint minimum, address creator) {
        manager = creator;
        minimumParticipation = minimum;
    }
    
    function enter() public payable {
        require(msg.value > minimumParticipation); // in wei
        players.push(payable(msg.sender));
    }
    
    function random() private view returns (uint) {
        return uint(keccak256(abi.encodePacked(block.difficulty, block.timestamp, players)));
    }
    
    function pickWinner() public restricted {
        // pick up a random indox from players array
        uint index = random() % players.length;

        // send funds to the winner
        players[index].transfer(address(this).balance);
        
        // return winner address value
        emit WinnerHasBeenPicked(players[index]);

        // reset players array
        players = new address payable[](0);
    }
    
    modifier restricted() {
        require(msg.sender == manager);
        _;
    }
    
    function getPlayers() public view returns (address payable[] memory) {
        return players;
    }
}   