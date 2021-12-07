// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "./GetRandomNumber.sol";
import "./SafeMath.sol";

/// @title TicketNFT contract interface
interface ITicketNFT {
    function mintNFT(string memory tokenURI) external returns (uint256);
}

/// @title RaffleCampaign
contract RaffleCampaign is Ownable, RandomNumberConsumer {

    using SafeMath for uint256;

    ITicketNFT ticketNFT;

    /// @notice raffle's name
    string public raffleName;

    /// @notice influencer's name
    string public influencer;

    /// @notice raffle's description
    string public raffleDescription;

    /// @notice campaign's start time
    uint public campaignStart;

    /// @notice campaign's end time
    uint public campaignEnd;

    /// @notice price per ticket
    uint public ticketPrice;

    /// @notice one owner's maximum purchase amount per raffle
    uint public maxBuyAmount = 9000;

    /// @notice total number of tickets per raffle
    uint public totalTickets;

    /// @notice total number of winners per raffle
    uint public totalWinners;

    /// @notice bought tickets array
    uint[] public tickets;

    /// @notice drawn tickets array
    uint[] public drawnTickets;

    /// @notice evaluate campaign to be expired or not
    bool public campaignFinished;

    /// @notice campaign manager's address
    address public manager;

    /// @dev mappings of this contract
    mapping (uint => address) public ticketOwner;
    mapping (address => uint) public ownerTicketCount;

    /// @dev Events of this contract
    event CreateCampaign(bool finished);
    event TicketBought(uint ticketNum, uint256 tokenId);
    event TicketDrawn(uint ticketId, uint ticketNum);
    event DeleteCampaign(bool finished);

    /// @dev modifier to evaluate campaign's finish
    modifier finishedCampaign(bool _finished) {
        require(!_finished, "Raffle campaign finished.");
        _;
    }

    /// @notice this contract constructor
    constructor(string memory _raffleName, string memory _influencer, string memory _raffleDescription, uint _campaignStart, uint _campaignEnd, uint _ticketPrice, uint _totalTickets, uint _totalWinners, address _ticketNFT) onlyOwner {
        require(_campaignStart < _campaignEnd, "Input correct campaign time.");
        require(_totalTickets > 1 && _totalTickets < 25000, "Total tickets range is 1 ~ 25000.");
        require(_totalTickets > _totalWinners, "Total tickets should be more than total winners.");

        campaignFinished = false;
        manager = msg.sender;

        raffleName = _raffleName;
        influencer = _influencer;
        raffleDescription = _raffleDescription;
        campaignStart = _campaignStart;
        campaignEnd = _campaignEnd;
        ticketPrice = _ticketPrice;
        totalTickets = _totalTickets;
        totalWinners = _totalWinners;

        ticketNFT = ITicketNFT(_ticketNFT);

        emit CreateCampaign(campaignFinished);
    }

    /// @notice forwarded in {IERC721Receiver-onERC721Received} to contract recipients.
    function onERC721Received(address operator, address from, uint256 tokenId, bytes memory data) external pure returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }

    /**
    @notice function to buy a ticket.
    @dev only users not manager.
    @param _ticketNum is ticket's number to be bought by user.
    */
    function buyTicket(uint _ticketNum, string memory _tokenUri) public onlyOwner finishedCampaign(campaignFinished) {
        require(ticketOwner[_ticketNum] == address(0), "One ticket can't be sold more than twice.");
        require(manager != msg.sender, "Manager can't buy ticket.");
        require(ownerTicketCount[msg.sender] < maxBuyAmount / ticketPrice, "Number of tickets one user can buy is limited.");
        
        tickets.push(_ticketNum);
        ticketOwner[_ticketNum] = msg.sender;
        ownerTicketCount[msg.sender] = ownerTicketCount[msg.sender].add(1);

        uint256 _tokenId = ticketNFT.mintNFT(_tokenUri);

        emit TicketBought(_ticketNum, _tokenId);
    }

    /**
    @notice function to delete a raffle campaign when it is expired.
    @dev only manager.
    */
    function deleteCampaign() public onlyOwner finishedCampaign(campaignFinished) {
        require(tickets.length < 1, "Raffle campaign can't delete as one more tickets were sold.");
        require(block.timestamp < campaignEnd, "Raffle campaign expired can't delete.");

        campaignFinished = true;

        emit DeleteCampaign(campaignFinished);
    }

    /**
    @notice function to draw a ticket manually.
    @dev only manager.
    @param _ticketNum is a bought ticket number to be drawn by manager.
    */
    function manualDrawTicket(uint _ticketNum) public onlyOwner finishedCampaign(campaignFinished) {
        uint idx;
        for (uint id = 0; id < tickets.length; id++) {
            if (tickets[id] == _ticketNum) {
                drawnTickets.push(tickets[id]);
                _removeTicket(id);
                idx = id;
            }
        }
        
        emit TicketDrawn(idx, _ticketNum);
    }

    /**
    @notice function to draw a ticket randomly.
    @dev only manager.
    */
    function _autoDrawnTicket() internal onlyOwner finishedCampaign(campaignFinished) {
        uint id = _randomTicketId();
        drawnTickets.push(tickets[id]);
        _removeTicket(id);

        emit TicketDrawn(id, tickets[id]);
    }

    /**
    @notice internal function to remove a ticket from tickets array sold.
    @param _ticketId is index of ticket sold to be drawn by manager.
    */
    function _removeTicket(uint _ticketId) internal {
        require(_ticketId < tickets.length, "Tickets array index is out of bound.");
        for (uint i = _ticketId; i < tickets.length - 1; i++) {
            tickets[i] = tickets[i+1];
        }

        tickets.pop();
    }

    /// @notice internal function to get a random ticket index.
    function _randomTicketId() internal view returns (uint) {
        uint idx = _random() % tickets.length;
        return idx;
    }

    /// @notice internal function to get a random number using block number.
    function _random() internal view returns (uint) {
        uint seed = block.number;

        uint a = 1103515245;
        uint c = 12345;
        uint m = 2 ** 32;

        return (a * seed + c) % m;
    }

    /// @notice function to get current drawn ticket number.
    function getCurrentWinner() public view returns (uint) {
        require(drawnTickets.length > 0);
        return drawnTickets[drawnTickets.length - 1];
    }

    /// @notice function to get current drawn ticket's owner address.
    function getCurrentWinnerAddress() public view returns (address) {
        require(drawnTickets.length > 0);
        uint drawnTicketNum = drawnTickets[drawnTickets.length - 1];
        return ticketOwner[drawnTicketNum];
    }

    /// @notice function to get total sold tickets count.
    function getBoughtTicketsCount() public view returns (uint) {
        return tickets.length + drawnTickets.length;
    }

    /// @notice function to get undrawned tickets count in sold tickets.
    function getUndrawnTicketsCount() public view returns (uint) {
        return tickets.length;
    }

    /// @notice function to get total drawn tickets count.
    function getDrawnTicketsCount() public view returns (uint) {
        return drawnTickets.length;
    }

    /// @notice function to get one owner's total tickets count.
    /// @param _owner is one owner's address.
    function getOwnerTicketsCount(address _owner) public view returns (uint) {
        return ownerTicketCount[_owner];
    }

    /// @notice function to get one owner's total tickets price.
    /// @param _owner is one owner's address.
    function getOwnerTicketsPrice(address _owner) public view returns (uint) {
        return ticketPrice * ownerTicketCount[_owner];
    }

    /// @notice function to get remained tickets count.
    function getRemainTickets() public view returns (uint) {
        return totalTickets - (tickets.length + drawnTickets.length);
    }

    /// @notice function to get total sold tickets price.
    function getBoughtTicketsPrice() public view returns (uint) {
        return ticketPrice * (tickets.length + drawnTickets.length);
    }

    /// @notice function to get total tickets price.
    function getTotalTicketsPrice() public view returns (uint) {
        return ticketPrice * totalTickets;
    }

}
