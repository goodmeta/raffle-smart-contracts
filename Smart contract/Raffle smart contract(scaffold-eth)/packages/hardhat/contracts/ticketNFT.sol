// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/// @title TicketNFT
contract TicketNFT is ERC721Enumerable {

    /// @notice counters library
    using Counters for Counters.Counter;

    /// @dev declare ticket token's id
    Counters.Counter private _tokenIds;

    /// @notice structure of each ticket item
    struct Item {
        uint256 id;
        address creator;
        string uri; //metadata url
    }

    /// @dev mapping of this contract
    mapping(uint256 => Item) public Items; //id => Item

    /// @notice this contract constructor
    constructor () ERC721("RaffleCampaignToken", "RCT") {}

    /**
    @notice function to mint ticket NFT on ethereum
    @dev only users not managers.
    @param uri is NFT's ipfs url
    */
    function mintNFT(string memory uri) external returns (uint256) {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _safeMint(msg.sender, newItemId);

        Items[newItemId] = Item({
            id: newItemId, 
            creator: msg.sender,
            uri: uri
        });

        return newItemId;
    }

    /**
    @notice function to get minted token's uri.
    @param tokenId is NFT's id.
    */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "ERC721URIStorage: URI query for nonexistent token");

        return Items[tokenId].uri;
    }

}
