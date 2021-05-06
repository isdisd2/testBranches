"use strict";
const { AppClient } = require("uu_appg01_server-client");
const { UriBuilder } = require("uu_appg01_core-uri");

const BEM_COMMANDS = {
  person: {
    get: "/personCard/get",
  },
};

const BEM_ERRORS = {
  notAuthorized: "uu-appg01/authorization/accessDenied",
};

let UuBtHelper = {
  commands: BEM_COMMANDS,
  errors: BEM_ERRORS,

  person: {
    async get(uri, dtoIn, session) {
      uri = UriBuilder.parse(uri).setUseCase(BEM_COMMANDS.person.get).clearParameters();

      return await AppClient.get(uri.toString(), dtoIn, { session });
    },
  },
};

module.exports = UuBtHelper;
