"use strict";
const { AppClient } = require("uu_appg01_server-client");
const { UriBuilder } = require("uu_appg01_core-uri");

const UUCK_COMMANDS = {
  course: {
    get: "loadCourseForExecutivesStudent",
  },
  lesson: {
    get: "getLessonsInCourse",
  },
  topic: {
    get: "loadTopicForExecutives",
  },
};

const UUCK_ERRORS = {
  notAuthorized: "uu-appg01/authorization/accessDenied",
};

let UuCkHelper = {
  commands: UUCK_COMMANDS,
  errors: UUCK_ERRORS,

  course: {
    async get(uri, dtoIn, session) {
      uri = UriBuilder.parse(uri).setUseCase(UUCK_COMMANDS.course.get).clearParameters();

      return await AppClient.get(uri.toString(), dtoIn, { session });
    },
  },

  lesson: {
    async get(uri, dtoIn, session) {
      uri = UriBuilder.parse(uri).setUseCase(UUCK_COMMANDS.lesson.get).clearParameters();

      return await AppClient.get(uri.toString(), dtoIn, { session });
    },
  },

  topic: {
    async get(uri, dtoIn, session) {
      uri = UriBuilder.parse(uri).setUseCase(UUCK_COMMANDS.topic.get).clearParameters();

      return await AppClient.get(uri.toString(), dtoIn, { session });
    },
  },
};

module.exports = UuCkHelper;
