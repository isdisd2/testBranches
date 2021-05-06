"use strict";
const { AppClient } = require("uu_appg01_server-client");
const { UriBuilder } = require("uu_appg01_core-uri");

const UUEE_COMMANDS = {
  session: {
    create: "loadCourseForExecutivesStudent",
  },
};

let UuCkHelper = {
  commands: UUEE_COMMANDS,

  session: {
    async create(uri, dtoIn) {
      uri = UriBuilder.parse(uri).setUseCase(UUCK_COMMANDS.course.get).clearParameters();

      return await AppClient.get(uri.toString(), dtoIn, { session });
    },
  },
};

module.exports = UuCkHelper;
