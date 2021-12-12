const TicketNFT = artifacts.require("TicketNFT");
const RaffleCampaign = artifacts.require("RaffleCampaign");

module.exports = async function (deployer) {
  await deployer.deploy(TicketNFT);
  
  const token = await TicketNFT.deployed();

  await deployer.deploy(RaffleCampaign, "aaa", "bbb", "ccc", 1234567, 98765432, 50, 20000, 100, token.address);
};
