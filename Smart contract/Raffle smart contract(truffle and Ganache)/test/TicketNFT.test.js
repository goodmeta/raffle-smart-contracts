const TicketNFT = artifacts.require("TicketNFT");
var expect = require('chai').expect;
const { assert } = require('chai');

require('chai')
  .use(require('chai-as-promised'))
  .should();

contract("TicketNFT", (accounts) => {
    let ticketnft = accounts[0];
    let ticketToken;

    beforeEach(async () => {
        ticketToken = await TicketNFT.deployed();
    });

    // before(async () => {
    //     ticketToken = await TicketNFT.new();
    // });

    describe('deployment', async () => {
        it('NFT deploys successfully', async () => {
            const address = ticketToken.address;
            assert.notEqual(address, "");
            assert.notEqual(address, 0x0);
            assert.notEqual(address, undefined);
            assert.notEqual(address, null);
        });

        it('has a name', async () => {
            const name = await ticketToken.name();
            assert.equal(name, 'RaffleCampaignToken');
        });

        it('has a symbol', async () => {
            const symbol = await ticketToken.symbol();
            assert.equal(symbol, 'RCT');
        });
    });

    describe('minting', async () => {
        it('create a new token', async () => {
            const result = await ticketToken.mintNFT('#EC058E');

            const totalSupply = await ticketToken.totalSupply();
            const event = result.logs[0].args;
            const tokenId = event.tokenId.toNumber();
            const item = await ticketToken.Items(tokenId);
            const owner = await ticketToken.ownerOf(tokenId);
            console.log(ticketnft);
            console.log(owner);
            console.log(result.tx);
            
            expect(result.receipt.status).to.equal(true);

            assert.equal(result.logs[0].event, 'Transfer', 'Emit correct event.');
            assert.equal(totalSupply, tokenId, 'id is correct');
            assert.equal(item.uri, '#EC058E', 'uri is correct');
            assert.equal(item.creator, ticketnft, 'NFT creator is correct');
            assert.equal(event.from, '0x0000000000000000000000000000000000000000', 'from is correct');
            assert.equal(event.to, ticketnft, 'to is correct');
        })
    })

    describe('indexing', async () => {
        it('list nfts', async () => {
            //mint 3 more tokens
            await ticketToken.mintNFT('#5386E4');
            await ticketToken.mintNFT('#FFFFFF');
            await ticketToken.mintNFT('#000000');
        
            const totalSupply = await ticketToken.totalSupply();
            let item;
            let result = [];
        
            for (var i = 1; i <= totalSupply; i++) {
                item = await ticketToken.Items(i);
                result.push(item.uri);
            }
        
            let expected = ['#EC058E', '#5386E4', '#FFFFFF', '#000000'];
            assert.equal(result.join(','), expected.join(','));
        });
    });
});
