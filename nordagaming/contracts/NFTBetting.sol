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
    bool public gameEnded;

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
        bool endedEarly;
    }

    mapping(uint => Game) public games;
    mapping(uint => Bet[]) public bets;
    mapping(uint => mapping(address => uint)) public playerContributions;
    mapping(uint => mapping(address => uint)) public betIndex; // Для быстрого поиска ставок игрока

    event BetPlaced(address indexed player, uint amount);
    event GameEnded(uint indexed gameId, address winner, uint winningAmount, bool endedEarly);
    event NFTDeposited(address indexed depositor, uint tokenId);
    event NFTClaimed(address indexed winner, uint tokenId);
    event NewGameStarted(uint indexed gameId);

    constructor(uint _minimumBet, address _nftContract) {
        require(_nftContract != address(0), "NFT contract cannot be zero address");
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
        require(!gameEnded, "Game has ended");
        require(block.timestamp <= bettingEndTime, "Betting period has ended");
        require(nftDeposited, "NFT not deposited yet");
        _;
    }

    function _startNewGame() private {
        games[gameId] = Game({
            id: gameId,
            ended: false,
            totalAmount: 0,
            winner: address(0),
            winningAmount: 0,
            endedEarly: false
        });
        //bettingEndTime = block.timestamp + BETTING_DURATION;
        gameEnded = false;
        emit NewGameStarted(gameId);
    }

    function depositNFT(uint _tokenId) external onlyOwner {
    require(!nftDeposited, "NFT already deposited");
    nftContract.safeTransferFrom(msg.sender, address(this), _tokenId);
    nftId = _tokenId;
    nftDeposited = true;

    
    bettingEndTime = block.timestamp + BETTING_DURATION;

    emit NFTDeposited(msg.sender, _tokenId);
    }

    function placeBet() external payable bettingOpen {
        require(msg.value >= minimumBet, "Bet amount is less than minimum");
        
        uint index = betIndex[gameId][msg.sender];
        if (index > 0) {
            // Обновляем существующую ставку
            bets[gameId][index - 1].amount += msg.value;
        } else {
            // Добавляем новую ставку
            bets[gameId].push(Bet(msg.sender, msg.value));
            betIndex[gameId][msg.sender] = bets[gameId].length;
        }
        
        games[gameId].totalAmount += msg.value;
        playerContributions[gameId][msg.sender] += msg.value;
        
        emit BetPlaced(msg.sender, msg.value);
    }

    function checkGameEnd() public {
        if (block.timestamp > bettingEndTime && !gameEnded && nftDeposited) {
            _endGame(false);
        }
    }

    function endGameEarly() external onlyOwner {
        require(!gameEnded, "Game already ended");
        require(nftDeposited, "No NFT deposited for this game");
        _endGame(true);
    }

    function _endGame(bool endedEarly) private {
        gameEnded = true;
        games[gameId].ended = true;
        games[gameId].endedEarly = endedEarly;

        if (bets[gameId].length > 0) {
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
            
            games[gameId].winner = winner;
            games[gameId].winningAmount = winningAmount;
            
            payable(winner).transfer(winningAmount);
            payable(owner).transfer(ownerCut);
            
            nftContract.safeTransferFrom(address(this), winner, nftId);
            
            emit NFTClaimed(winner, nftId);
        } else {
            nftContract.safeTransferFrom(address(this), owner, nftId);
        }
        
        nftDeposited = false;
        emit GameEnded(gameId, games[gameId].winner, games[gameId].winningAmount, endedEarly);
        
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

    function setMinimumBet(uint _minimumBet) external onlyOwner {
        minimumBet = _minimumBet;
    }
}