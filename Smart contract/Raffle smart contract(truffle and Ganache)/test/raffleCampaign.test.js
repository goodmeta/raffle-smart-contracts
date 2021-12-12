const RaffleCampaign = artifacts.require("RaffleCampaign");
const TicketNFT = artifacts.require("TicketNFT");
var expect = require('chai').expect;
const { assert } = require('chai');
const truffleAssert = require('truffle-assertions');

require('chai')
  .use(require('chai-as-promised'))
  .should();

contract("RaffleCampaign", (accounts) => {
    let raffleOwner = accounts[0];
    let token;
    let campaign;

    beforeEach(async () => {
        token = await TicketNFT.deployed();
        campaign = await RaffleCampaign.new("zzz", "yyy", "xxx", 1111111, 99999999, 55, 10000, 77, token.address);
    });

    describe('deployment', async () => {
        it('Raffle deploys successfully', async () => {
            const tokenaddress = token.address;
            const campaignaddress = campaign.address;

            let txHash = await campaign.transactionHash;
            let result = await truffleAssert.createTransactionResult(campaign, txHash);
            truffleAssert.eventEmitted(result, 'CreateCampaign');

            const manager = await campaign.manager();
            const campaignfinished = await campaign.campaignFinished();

            const rafflename = await campaign.raffleName();
            const influencer = await campaign.influencer();
            const raffleDescription = await campaign.raffleDescription();
            const campaignStart = await campaign.campaignStart();
            const campaignEnd = await campaign.campaignEnd();
            const ticketPrice = await campaign.ticketPrice();
            const totalTickets = await campaign.totalTickets();
            const totalWinners = await campaign.totalWinners();
            
            assert.notEqual(campaignaddress, "");
            assert.notEqual(campaignaddress, 0x0);
            assert.notEqual(campaignaddress, undefined);
            assert.notEqual(campaignaddress, null);

            expect(manager).to.equal(raffleOwner);
            expect(campaignfinished).to.equal(false);
            assert.notEqual(tokenaddress, campaignaddress);

            assert.equal(rafflename, "zzz");
            assert.equal(influencer, "yyy");
            assert.equal(raffleDescription, "xxx");
            assert.equal(campaignStart.toNumber(), 1111111);
            assert.equal(campaignEnd.toNumber(), 99999999);
            assert.equal(ticketPrice.toNumber(), 55);
            assert.equal(totalTickets.toNumber(), 10000);
            assert.equal(totalWinners.toNumber(), 77);
        });
    });

    describe('buy ticket', async () => {
        it('buyer buys ticket successfully.', async () => {
            const result1 = await campaign.buyTicket(12345, '#ABCDE');
            const result2 = await campaign.buyTicket(23456, '#BCDEF');

            const event1 = result1.logs[0].args;
            const ticketnum1 = event1.ticketNum.toNumber();
            const tokenid1 = event1.tokenId.toNumber();
            const tokenuri1 = event1.tokenUri;
            const firstticket = await campaign.tickets(0);
            const ticketowner1 = await campaign.ticketOwner(12345);
            const ownertickets1 = await campaign.ownerTicketCount(ticketowner1);

            const event2 = result2.logs[0].args;
            const ticketnum2 = event2.ticketNum.toNumber();
            const tokenid2 = event2.tokenId.toNumber();
            const tokenuri2 = event2.tokenUri;
            const secondticket = await campaign.tickets(1);
            const ticketowner2 = await campaign.ticketOwner(23456);
            const ownertickets2 = await campaign.ownerTicketCount(ticketowner2);

            assert.notEqual(ticketowner1, "");
            assert.notEqual(ticketowner1, 0x0);
            assert.notEqual(ticketowner1, undefined);
            assert.notEqual(ticketowner1, null);

            assert.notEqual(ticketowner2, "");
            assert.notEqual(ticketowner2, 0x0);
            assert.notEqual(ticketowner2, undefined);
            assert.notEqual(ticketowner2, null);

            assert.equal(ticketowner1, raffleOwner);
            assert.equal(firstticket.toNumber(), ticketnum1);
            assert.equal(ownertickets1, 2);
            assert.equal(ticketnum1, 12345);
            assert.equal(tokenid1, 1);
            assert.equal(tokenuri1, '#ABCDE');

            assert.equal(ticketowner2, raffleOwner);
            assert.equal(secondticket.toNumber(), ticketnum2);
            assert.equal(ownertickets2, 2);
            assert.equal(ticketnum2, 23456);
            assert.equal(tokenid2, 2);
            assert.equal(tokenuri2, '#BCDEF');
        })
    });

    describe('delete campaign', async () => {
        it('manager deletes raffle campaign successfully.', async () => {
            // await campaign.buyTicket(34567, '#CDEFG');
            const result = await campaign.deleteCampaign();

            const event = result.logs[0].args;
            const finished = event.finished;
            const campaignfinished = await campaign.campaignFinished();

            expect(finished).to.equal(campaignfinished);
        })
    });

    describe('draw ticket', async () => {
        beforeEach(async () => {
            await campaign.buyTicket(45678, '#DEFGH');
            await campaign.buyTicket(56789, '#EFGHI');
            await campaign.buyTicket(67890, '#FGHIJ');
        });

        it('manager draws ticket manually.', async () => {
            const result = await campaign.manualDrawTicket(56789);

            const event = result.logs[0].args;
            const ticketid = event.ticketId.toNumber();
            const ticketnum = event.ticketNum.toNumber();
            const matchedticket = await campaign.tickets(ticketid);
            const drawnticket = await campaign.drawnTickets(0);

            expect(matchedticket.toNumber()).to.equal(67890);
            expect(drawnticket.toNumber()).to.equal(ticketnum);
            expect(ticketid).to.equal(1);
            expect(ticketnum).to.equal(56789);
        })

        it('manager draws ticket randomly.', async () => {
            const result = await campaign.autoDrawnTicket();

            const event = result.logs[0].args;
            const ticketid = event.ticketId.toNumber();
            const ticketnum = event.ticketNum.toNumber();
            const drawnticket = await campaign.drawnTickets(0);
            const restticket1 = await campaign.tickets(0);
            const restticket2 = await campaign.tickets(1);

            console.log(ticketid);
            console.log(ticketnum);
            console.log(restticket1.toNumber());
            console.log(restticket2.toNumber());

            expect(drawnticket.toNumber()).to.equal(ticketnum);
        })
    });
});
