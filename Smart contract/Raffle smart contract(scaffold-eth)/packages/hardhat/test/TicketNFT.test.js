const { ethers } = require('hardhat');
const { expect, assert } = require('chai');

describe('TicketNFT', function() {
    let owner, secondAddress;

    before(async function() {
        this.TicketNFT = await ethers.getContractFactory('TicketNFT');
    });

    beforeEach(async function() {
        this.ticketNFT = await (await this.TicketNFT.deploy()).deployed();
        [owner, secondAddress] = await ethers.getSigners();
    });

    it('NFT deploys successfully', async function() {
        const address = this.ticketNFT.address;
        assert.notEqual(address, "");
        assert.notEqual(address, 0x0);
        assert.notEqual(address, undefined);
        assert.notEqual(address, null);

        console.log(address);
    });

    it('It has a name', async function() {
        const name = await this.ticketNFT.name();
        expect(name).to.equal('RaffleCampaignToken');
    });

    it('It has a symbol', async function() {
        const symbol = await this.ticketNFT.symbol();
        expect(symbol).to.equal('RCT');
    });

    it('create a new token', async function() {
        const result = await this.ticketNFT.mintNFT('#bc4df86cp');
        const totalSupply = await this.ticketNFT.totalSupply();
        const totalSupplyNum = totalSupply.toNumber();
        const item = await this.ticketNFT.Items(totalSupplyNum);
        const tokenOwner = await this.ticketNFT.ownerOf(totalSupplyNum);

        expect(owner.address).to.equal(tokenOwner);
        expect(item.uri).to.equal('#bc4df86cp');
        expect(item.creator).to.equal(tokenOwner);

        await expect(result).to.emit(this.ticketNFT, 'Transfer').withArgs('0x0000000000000000000000000000000000000000', owner.address, totalSupplyNum);
    });

    it('list ticketNfts', async function() {
        //mint 3 more tokens
        await this.ticketNFT.mintNFT('#s4fh86fE4');
        await this.ticketNFT.mintNFT('#EEEEFFFFF');
        await this.ticketNFT.mintNFT('#111110000');

        const totalSupply = await this.ticketNFT.totalSupply();
        const totalSupplyNum = totalSupply.toNumber();
        let item;
        let result = [];

        for (var i = 1; i <= totalSupplyNum; i++) {
            item = await this.ticketNFT.Items(i);
            result.push(item.uri);
        }

        let expected = ['#s4fh86fE4', '#EEEEFFFFF', '#111110000'];
        expect(result.join(',')).to.equal(expected.join(','));
    });
});
