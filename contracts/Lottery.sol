// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract LotteryFactory {
    address payable[] public deployedLotteries;

    // Emitted when a lottery has been created
    event LotteryHasBeenCreated(address lottery);

    function createLottery(uint minimum) public {
        address newLottery = address(new Lottery(minimum, msg.sender));
        deployedLotteries.push(payable(newLottery));

        emit LotteryHasBeenCreated(newLottery);
    }

    function getDeployedLotteries() public view returns (address payable[] memory) {
        return deployedLotteries;
    }
}

contract Lottery {
    address public manager;
    uint public bet;
    address payable[] public players;
    mapping(address => bool) aleardyParticipated;
    bool public complete;
    address public winnerAddress;
    uint public winnerAmount;
    
    // Emitted when the winner has been picked
    event WinnerHasBeenPicked(address winner, uint amount);

    constructor(uint betAmount, address creator) {
        manager = creator;
        bet = betAmount;
        complete = false;
    }
    
    function enter() public payable {
        require(msg.value == bet, "Bet is not correct"); // in wei
        require(aleardyParticipated[msg.sender] == false, "One address can participate only once");

        players.push(payable(msg.sender));
        aleardyParticipated[msg.sender] = true;
    }
    
    function random() private view returns (uint) {
        return uint(keccak256(abi.encodePacked(block.difficulty, block.timestamp, players)));
    }
    
    function pickWinner() public restricted {
        require(!complete, "Winner has already been picked");

        // pick up a random indox from players array
        uint index = random() % players.length;
        uint amount = address(this).balance;

        // send funds to the winner
        players[index].transfer(amount);

        // fill winner info
        winnerAddress = players[index];
        winnerAmount = amount;
        
        // return winner address value and amount transfered
        emit WinnerHasBeenPicked(winnerAddress, winnerAmount);

        // set lottery complete
        complete = true;
    }
    
    modifier restricted() {
        require(msg.sender == manager);
        _;
    }
    
    function getPlayers() public view returns (address payable[] memory) {
        return players;
    }
}   