const { ethers } = require('hardhat');
const { expect, assert } = require('chai');

describe('RaffleCampaign', function() {
    let owner, secondAddress;

    before(async function() {
        this.TicketNFT = await ethers.getContractFactory('TicketNFT');
        this.RaffleCampaign = await ethers.getContractFactory('RaffleCampaign');
    });

    beforeEach(async function() {
        this.ticketNFT = await (await this.TicketNFT.deploy()).deployed();
        this.raffleCampaign = await (await this.RaffleCampaign.deploy("www", "vvv", "uuu", 28539487, 89548348734, 15, 9000, 20, this.ticketNFT.address)).deployed();
        [owner, secondAddress] = await ethers.getSigners();
    });

    it('Raffle deploys successfully', async function() {
        const tokenaddress = this.ticketNFT.address;
        const raffleaddress = this.raffleCampaign.address;

        assert.notEqual(raffleaddress, "");
        assert.notEqual(raffleaddress, 0x0);
        assert.notEqual(raffleaddress, undefined);
        assert.notEqual(raffleaddress, null);

        console.log(tokenaddress);
        console.log(raffleaddress);

        const manager = await this.raffleCampaign.manager();
        const campaignfinished = await this.raffleCampaign.campaignFinished();

        const rafflename = await this.raffleCampaign.raffleName();
        const influencer = await this.raffleCampaign.influencer();
        const raffleDescription = await this.raffleCampaign.raffleDescription();
        const campaignStart = await this.raffleCampaign.campaignStart();
        const campaignEnd = await this.raffleCampaign.campaignEnd();
        const ticketPrice = await this.raffleCampaign.ticketPrice();
        const totalTickets = await this.raffleCampaign.totalTickets();
        const totalWinners = await this.raffleCampaign.totalWinners();

        expect(manager).to.equal(owner.address);
        expect(campaignfinished).to.equal(false);
        assert.notEqual(tokenaddress, raffleaddress);

        expect(rafflename).to.equal("www");
        expect(influencer).to.equal("vvv");
        expect(raffleDescription).to.equal("uuu");
        expect(campaignStart).to.equal(28539487);
        expect(campaignEnd).to.equal(89548348734);
        expect(ticketPrice).to.equal(15);
        expect(totalTickets).to.equal(9000);
        expect(totalWinners).to.equal(20);
    });

    it('buyer buys ticket successfully.', async function() {
        const result1 = await this.raffleCampaign.buyTicket(5678, '#C4D74EA');
        const result2 = await this.raffleCampaign.buyTicket(6789, '#B73CDG5');

        const firstticket = await this.raffleCampaign.tickets(0);
        const ticketowner1 = await this.raffleCampaign.ticketOwner(5678);
        const ownertickets1 = await this.raffleCampaign.ownerTicketCount(ticketowner1);

        const secondticket = await this.raffleCampaign.tickets(1);
        const ticketowner2 = await this.raffleCampaign.ticketOwner(6789);
        const ownertickets2 = await this.raffleCampaign.ownerTicketCount(ticketowner2);

        assert.notEqual(ticketowner1, "");
        assert.notEqual(ticketowner1, 0x0);
        assert.notEqual(ticketowner1, undefined);
        assert.notEqual(ticketowner1, null);

        assert.notEqual(ticketowner2, "");
        assert.notEqual(ticketowner2, 0x0);
        assert.notEqual(ticketowner2, undefined);
        assert.notEqual(ticketowner2, null);

        expect(ticketowner1).to.equal(owner.address);
        expect(firstticket.toNumber()).to.equal(5678);
        expect(ownertickets1).to.equal(2);

        expect(ticketowner2).to.equal(owner.address);
        expect(secondticket.toNumber()).to.equal(6789);
        expect(ownertickets2).to.equal(2);

        await expect(result1).to.emit(this.raffleCampaign, 'TicketBought').withArgs(5678, 1, '#C4D74EA');
        await expect(result2).to.emit(this.raffleCampaign, 'TicketBought').withArgs(6789, 2, '#B73CDG5');
    });

    it('manager deletes raffle campaign successfully.', async function() {
        // await campaign.buyTicket(5863, '#F74HJ4Q');
        const result = await this.raffleCampaign.deleteCampaign();

        const campaignfinished = await this.raffleCampaign.campaignFinished();
        expect(campaignfinished).to.equal(true);

        await expect(result).to.emit(this.raffleCampaign, 'DeleteCampaign').withArgs(campaignfinished);
    });

    describe('manager draws ticket', function() {
        beforeEach(async function() {
            await this.raffleCampaign.buyTicket(3468, '#SJ6JHY9');
            await this.raffleCampaign.buyTicket(24795, '#KIY83G');
            await this.raffleCampaign.buyTicket(12640, '#DO9IY86');
        });

        it('manager draws ticket manually.', async function() {
            const result = await this.raffleCampaign.manualDrawTicket(24795);

            const matchedticket = await this.raffleCampaign.tickets(1);
            const drawnticket = await this.raffleCampaign.drawnTickets(0);

            expect(matchedticket.toNumber()).to.equal(12640);
            expect(drawnticket.toNumber()).to.equal(24795);

            await expect(result).to.emit(this.raffleCampaign, 'TicketDrawn').withArgs(1, 24795);
        });

        it('manager draws ticket randomly.', async function() {
            const result = await this.raffleCampaign.autoDrawnTicket();

            const drawnticket = await this.raffleCampaign.drawnTickets(0);
            const restticket1 = await this.raffleCampaign.tickets(0);
            const restticket2 = await this.raffleCampaign.tickets(1);

            console.log(drawnticket.toNumber());
            console.log(restticket1.toNumber());
            console.log(restticket2.toNumber());

            await expect(result).to.emit(this.raffleCampaign, 'TicketDrawn');
        });
    });
});
