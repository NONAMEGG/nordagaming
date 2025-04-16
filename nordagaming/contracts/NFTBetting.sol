// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;


import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

contract NFTBetting is IERC721Receiver {
    address public owner;
    uint public minimumBet;
    uint public gameId;
    uint public bettingEndTime;
    uint public constant BETTING_DURATION = 24 hours;
    
    IERC721 public nftContract;
    uint public nftId;
    bool public nftDeposited;

    struct Bet {
        address player;
        uint amount;
    }

    struct Game {
        uint id;
        bool ended;
        uint totalAmount;
        address winner;
        uint winningAmount;
    }

    mapping(uint => Game) public games;
    mapping(uint => Bet[]) public bets;
    mapping(uint => mapping(address => uint)) public playerContributions;

    event BetPlaced(address indexed player, uint amount);
    event GameEnded(uint indexed gameId, address winner, uint winningAmount);
    event NFTDeposited(address indexed depositor, uint tokenId);
    event NFTClaimed(address indexed winner, uint tokenId);

    constructor(uint _minimumBet, address _nftContract) {
        owner = msg.sender;
        minimumBet = _minimumBet;
        nftContract = IERC721(_nftContract);
        gameId = 1;
        _startNewGame();
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier bettingOpen() {
        require(block.timestamp <= bettingEndTime, "Betting period has ended");
        require(nftDeposited, "NFT not deposited yet");
        _;
    }

    function _startNewGame() private {
        games[gameId].id = gameId;
        bettingEndTime = block.timestamp + BETTING_DURATION;
    }

    function depositNFT(uint _tokenId) external onlyOwner {
        require(!nftDeposited, "NFT already deposited");
        nftContract.safeTransferFrom(msg.sender, address(this), _tokenId);
        nftId = _tokenId;
        nftDeposited = true;
        emit NFTDeposited(msg.sender, _tokenId);
    }

    function placeBet() external payable bettingOpen {
        require(msg.value >= minimumBet, "Bet amount is less than minimum");
        
        bets[gameId].push(Bet({
            player: msg.sender,
            amount: msg.value
        }));
        
        games[gameId].totalAmount += msg.value;
        playerContributions[gameId][msg.sender] += msg.value;
        
        emit BetPlaced(msg.sender, msg.value);
    }

    function endGame() external onlyOwner {
        require(block.timestamp > bettingEndTime, "Betting period not ended yet");
        require(!games[gameId].ended, "Game already ended");
        require(nftDeposited, "No NFT deposited for this game");
        
        uint random = uint(keccak256(abi.encodePacked(
            block.timestamp, block.prevrandao, games[gameId].totalAmount
        )));
        uint winningNumber = random % games[gameId].totalAmount;
        
        uint runningSum = 0;
        address winner;
        for(uint i = 0; i < bets[gameId].length; i++) {
            runningSum += bets[gameId][i].amount;
            if(runningSum >= winningNumber) {
                winner = bets[gameId][i].player;
                break;
            }
        }
        
        uint winningAmount = games[gameId].totalAmount * 90 / 100;
        uint ownerCut = games[gameId].totalAmount - winningAmount;
        
        games[gameId].ended = true;
        games[gameId].winner = winner;
        games[gameId].winningAmount = winningAmount;
        
        payable(winner).transfer(winningAmount);
        payable(owner).transfer(ownerCut);
        
        nftContract.safeTransferFrom(address(this), winner, nftId);
        nftDeposited = false;
        
        emit GameEnded(gameId, winner, winningAmount);
        emit NFTClaimed(winner, nftId);
        
        gameId++;
        _startNewGame();
    }

    function onERC721Received(
        address,
        address,
        uint256,
        bytes memory
    ) public virtual override returns (bytes4) {
        return this.onERC721Received.selector;
    }

    function getBets(uint _gameId) external view returns (Bet[] memory) {
        return bets[_gameId];
    }

    function getPlayerContribution(uint _gameId, address _player) external view returns (uint) {
        return playerContributions[_gameId][_player];
    }
}
