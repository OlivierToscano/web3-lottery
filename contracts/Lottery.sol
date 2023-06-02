// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;


/*
 * @dev Provides information about the current execution context, including the
 * sender of the transaction and its data. While these are generally available
 * via msg.sender and msg.data, they should not be accessed in such a direct
 * manner, since when dealing with meta-transactions the account sending and
 * paying for execution may not be the actual sender (as far as an application
 * is concerned).
 *
 * This contract is only required for intermediate, library-like contracts.
 */
abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        this; // silence state mutability warning without generating bytecode - see https://github.com/ethereum/solidity/issues/2691
        return msg.data;
    }
}

/**
 * @dev Contract module which provides a basic access control mechanism, where
 * there is an account (an owner) that can be granted exclusive access to
 * specific functions.
 *
 * By default, the owner account will be the one that deploys the contract. This
 * can later be changed with {transferOwnership}.
 *
 * This module is used through inheritance. It will make available the modifier
 * `onlyOwner`, which can be applied to your functions to restrict their use to
 * the owner.
 */
abstract contract Ownable is Context {
    address private _owner;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /**
     * @dev Initializes the contract setting the deployer as the initial owner.
     */
    constructor () {
        address msgSender = _msgSender();
        _owner = msgSender;
        emit OwnershipTransferred(address(0), msgSender);
    }

    /**
     * @dev Returns the address of the current owner.
     */
    function owner() public view virtual returns (address) {
        return _owner;
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        require(owner() == _msgSender(), "Ownable: caller is not the owner");
        _;
    }

    /**
     * @dev Leaves the contract without owner. It will not be possible to call
     * `onlyOwner` functions anymore. Can only be called by the current owner.
     *
     * NOTE: Renouncing ownership will leave the contract without an owner,
     * thereby removing any functionality that is only available to the owner.
     */
    function renounceOwnership() public virtual onlyOwner {
        emit OwnershipTransferred(_owner, address(0));
        _owner = address(0);
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner) public virtual onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        emit OwnershipTransferred(_owner, newOwner);
        _owner = newOwner;
    }
}

contract LotteryFactory is Ownable {
    address payable[] public deployedLotteries;
    address payable creatorAccount;

    // Emitted when a lottery has been created
    event LotteryHasBeenCreated(address lottery);

    constructor() {
        creatorAccount = payable(msg.sender);
    }

    function createLottery(uint minimum) public {
        address newLottery = address(new Lottery(minimum, payable(msg.sender), creatorAccount));
        deployedLotteries.push(payable(newLottery));

        emit LotteryHasBeenCreated(newLottery);
    }

    function getDeployedLotteries() public view returns (address payable[] memory) {
        return deployedLotteries;
    }

    function updateCreatorAccount(address payable _newAccount) external onlyOwner {
        creatorAccount = _newAccount;
    }  
}

contract Lottery {
    address payable creatorAccount;
    address payable public manager;
    uint public bet;
    address payable[] public players;
    mapping(address => bool) aleardyParticipated;
    bool public complete;
    address public winnerAddress;
    uint public winnerAmount;
    
    // Emitted when the winner has been picked
    event WinnerHasBeenPicked(address winner, uint amount);

    constructor(uint _bet, address payable _manager, address payable _creatorAccount) {
        creatorAccount = _creatorAccount;
        manager = _manager;
        bet = _bet;
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

    function calculateOnePercentFee(uint256 amount) public pure returns (uint256) {
        return amount/100;
    }
    
    function pickWinner() public restricted {
        require(!complete, "Winner has already been picked");

        // pick up a random indox from players array
        uint index = random() % players.length;
        uint amount = address(this).balance;

        // calcul 1% fee
        uint256 onePercentFee = calculateOnePercentFee(amount);

        // give 1% of the amount to the lottery manager
        manager.transfer(onePercentFee);

        // give 1% of the amount to the creatorAccount
        creatorAccount.transfer(onePercentFee);

        // send funds to the winner
        players[index].transfer(amount - onePercentFee - onePercentFee);

        // fill winner info
        winnerAddress = players[index];
        winnerAmount = (amount - onePercentFee - onePercentFee);
        
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