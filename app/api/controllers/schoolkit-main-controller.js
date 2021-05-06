"use strict";
const { InitAbl, GetAbl, LoadAbl, UpdateAbl, SetStateAbl } = require("../../abl/schoolkit-main/");

class SchoolkitMainController {
  init(ucEnv) {
    return InitAbl.init(ucEnv.getUri(), ucEnv.getDtoIn(), ucEnv.getSession());
  }
  get(ucEnv) {
    return GetAbl.get(ucEnv.getUri().getAwid(), ucEnv.getDtoIn());
  }
  load(ucEnv) {
    return LoadAbl.load(ucEnv.getUri(), ucEnv.getDtoIn(), ucEnv.getAuthorizationResult(), ucEnv.getSession());
  }
  update(ucEnv) {
    return UpdateAbl.update(ucEnv.getUri(), ucEnv.getDtoIn(), ucEnv.getSession(), ucEnv.getAuthorizationResult());
  }
  setState(ucEnv) {
    return SetStateAbl.setState(ucEnv.getUri(), ucEnv.getDtoIn(), ucEnv.getSession(), ucEnv.getAuthorizationResult());
  }
}

module.exports = new SchoolkitMainController();
