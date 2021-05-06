"use strict";
// template: uuCommand
// templateVersion: 0.1.0
// documentation:
//@@viewOn:revision
// coded: Branislav Dolny (13-2838-1), 30/11/2020
//@@viewOff:revision

//@@viewOn:imports
const AppClientTokenHelper = require("../abl/helpers/app-client-token-helper");
const UuBtHelper = require("../abl/helpers/uu-bt-helper");
const { DaoFactory } = require("uu_appg01_server").ObjectStore;
const { Schemas } = require("../abl/common-constants");
//@@viewOff:imports

//@@viewOn:constants
//@@viewOff:constants

//@@viewOn:component
class TeacherDetail {
  constructor() {
    this.teacherDao = DaoFactory.getDao(Schemas.TEACHER);
  }

  async getTeacherDataFromEnvironment(
    uri,
    uuSchoolKit,
    uuObject,
    uuAppErrorMap,
    errors,
    session,
    callOpts = null,
    artifactEnvironment = null
  ) {
    if (!artifactEnvironment) {
      const loadEnvDtoIn = { id: uuObject.artifactId };

      try {
        if (!callOpts) {
          callOpts = await AppClientTokenHelper.createToken(uri, uuSchoolKit.btBaseUri, session);
        }
        artifactEnvironment = await UuBtHelper.uuObc.loadEnvironment(uuSchoolKit.btBaseUri, loadEnvDtoIn, callOpts);
      } catch (e) {
        throw new errors.FailedToLoadUuObcEnvironment({ uuAppErrorMap }, e);
      }
    }

    if (
      artifactEnvironment &&
      artifactEnvironment.responsibleRole &&
      artifactEnvironment.responsibleRole.mainUuIdentity
    ) {
      const teacherDetail = await this.teacherDao.getByUuIdentity(
        uuSchoolKit.awid,
        artifactEnvironment.responsibleRole.mainUuIdentity
      );
      if (teacherDetail) {
        uuObject.teacherApi = teacherDetail;
      }
    }

    return {
      uuObject,
      uuAppErrorMap
    };
  }
}
//@@viewOff:component

//@@viewOn:exports
module.exports = new TeacherDetail();
//@@viewOff:exports
