"use strict";
const { DaoFactory } = require("uu_appg01_server").ObjectStore;
const InstanceChecker = require("../../components/instance-checker");
const { Schemas } = require("../common-constants");

const Errors = require("../../api/errors/schoolkit-main-error.js");

class GetAbl {
  constructor() {
    this.dao = DaoFactory.getDao(Schemas.SCHOOLKIT);
  }

  async get(awid, dtoIn, uuAppErrorMap = {}) {
    // HDS 1
    // 1.1
    let uuSchoolKit = await InstanceChecker.ensureInstance(awid, Errors.Get, uuAppErrorMap);

    // HDS 2
    return {
      ...uuSchoolKit,
      uuAppErrorMap
    };
  }
}

module.exports = new GetAbl();
