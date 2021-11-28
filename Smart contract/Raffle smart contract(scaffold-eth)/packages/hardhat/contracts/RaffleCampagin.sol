//SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;

import "./SafeMath.sol";

contract Raffle {
    using SafeMath for uint256;
    uint256 campaginstart;
    uint256 campaginend;
    uint256 totaltickets;
    uint256 totalwinners;
    uint256[] private randomnums;
    bool rafflecampaginfinished = false;
    uint256 joinedParticipants;
    uint256 maxParticipants;
    uint256 minParticipants;
    mapping (address => bool) participantsMapping;
    address[] currentparticipants;
    address organizer;
    uint256 chosenNumber;
    address winnerParticipant;

    event ChooseWinner (uint _chosenNumber, address winner );

    constructor(uint256 _campaginstart, uint256 _campaginend, uint256 _totaltickets, uint256 _totalwinners) {
        require(_campaginstart > _campaginend, "Input correct campagin time!");
        require(_totaltickets > 1);
        require(_totalwinners >= 1);

        campaginstart = _campaginstart;
        totaltickets = _totaltickets;
        totalwinners = _totalwinners;

        maxParticipants = totaltickets;
        minParticipants = 2;
        organizer = msg.sender;

        for(uint256 i = 0; i < totaltickets; i++) {
            randomnums[i] = i;
        }
    }

    function joinraffle() public {
        require(!rafflecampaginfinished, "Raffle Campagin finished!");
        require(msg.sender != organizer, "Raffle Campagin Organizer can't join this Raffle Campagin");
        require(joinedParticipants + 1 < maxParticipants, "All tickets are selled out!");
        require(!participantsMapping[msg.sender], "You already joined!");

        currentparticipants.push(msg.sender);
        joinedParticipants++;
    }

    // Choose winner(only organizer)
    function ManualchooseWinner(uint _chosenNum) public {
        chosenNumber = _chosenNum;
        winnerParticipant = currentparticipants[chosenNumber];
        emit ChooseWinner(chosenNumber, currentparticipants[chosenNumber]);
    }

    // Automatically choose winner
    function chooseWinner(uint _chosenNum) internal {
        chosenNumber = _chosenNum;
        winnerParticipant = currentparticipants[chosenNumber];
        emit ChooseWinner(chosenNumber, currentparticipants[chosenNumber]);
    }

    function generatedRandomNum() public {
        require(!rafflecampaginfinished, "Raffle Campagin finished!");
        require(joinedParticipants >= minParticipants, "current participants is little");

        rafflecampaginfinished = true;

        uint256 _length = totaltickets.sub(currentparticipants);
        uint256 _index = block.timestamp.Mod(_length);
        uint256 _randomNum = randomnums[_index];
        randomnums.pop();

        chooseWinner(_randomNum);
    }

    function getChosenNumber() public view returns (uint) {
        return chosenNumber;
    }

    function getWinnerAddress() public view returns (address) {
        return winnerParticipant;
    }

    function getCurrentParticipants() public view returns (address[] memory) {
        return currentparticipants;
    }
}