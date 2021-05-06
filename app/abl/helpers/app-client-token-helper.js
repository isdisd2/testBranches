const { AppClientTokenService } = require("uu_appg01_workspace");

let AppClientTokenHelper = {
  async createToken(baseUri, callUri, session) {
    let appClientToken = await AppClientTokenService.createToken(baseUri, callUri);
    return AppClientTokenService.setToken({ session }, appClientToken);
  },

  async getUuToken(baseUri, callUri, session) {
    let appClientToken = await AppClientTokenService.createToken(baseUri, callUri);
    return AppClientTokenService.setToken({ session }, appClientToken);
  },
};

module.exports = AppClientTokenHelper;
