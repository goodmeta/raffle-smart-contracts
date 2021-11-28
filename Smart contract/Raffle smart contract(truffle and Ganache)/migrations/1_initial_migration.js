const Migrations = artifacts.require("RaffleCampagin");

module.exports = function (deployer) {
  deployer.deploy(Migrations);
};
