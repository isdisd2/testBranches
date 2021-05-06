"use strict";
const { Validator } = require("uu_appg01_server").Validation;
const { DaoFactory } = require("uu_appg01_server").ObjectStore;
const { ValidationHelper } = require("uu_appg01_server").AppServer;
const AppClientTokenHelper = require("../helpers/app-client-token-helper.js");
const UuBtHelper = require("../helpers/uu-bt-helper.js");
const InstanceChecker = require("../../components/instance-checker");
const { Schemas } = require("../common-constants");
const userRolesChecker = require("../../components/user-roles-checker");

const Errors = require("../../api/errors/schoolkit-main-error.js");
const Warnings = require("../../api/warnings/schoolkit-main-warnings");

class LoadAbl {
  constructor() {
    this.validator = Validator.load();
    this.dao = DaoFactory.getDao(Schemas.SCHOOLKIT);
  }

  async load(uri, dtoIn, authResult, session, uuAppErrorMap = {}) {
    // HDS 1
    // 1.1 - 1.2
    const awid = uri.getAwid();
    let uuSchoolKit = await InstanceChecker.ensureInstance(awid, Errors.Load, uuAppErrorMap);

    // HDS 2
    // 2.1
    // 2.2
    const { btBaseUri, artifactId } = uuSchoolKit;
    let artifactEnvironment;
    let callOpts;
    try {
      // 2.2.A
      callOpts = await AppClientTokenHelper.createToken(uri, btBaseUri, session);
      artifactEnvironment = await UuBtHelper.uuAwsc.loadEnvironment(btBaseUri, { id: artifactId }, callOpts);
    } catch (e) {
      // 2.2.B
      // 2.2.B.1
      throw new Errors.Load.FailedToLoadUuAwscEnvironment({ uuAppErrorMap }, e);
    }

    // FIXME duplicated code fragment
    if (uuSchoolKit.principal) {
      let principal;
      try {
        principal = await UuBtHelper.uuRoleIfc.get(btBaseUri, { id: uuSchoolKit.principal }, callOpts);
      } catch (e) {
        ValidationHelper.addWarning(
          uuAppErrorMap,
          Warnings.FailedToLoadPrincipalRole.CODE,
          Warnings.FailedToLoadPrincipalRole.MESSAGE,
          { principalRole: uuSchoolKit.principal, cause: e }
        );
      }

      if (principal && principal.name) {
        uuSchoolKit.principalName = principal.name;
        uuSchoolKit.principalState = principal.state;
      }
    }

    // HDS 3
    let profileList = authResult.getIdentityProfiles();

    const uuIdentity = session.getIdentity().getUuIdentity();
    const userRoles = await userRolesChecker.checkUserRoles(awid, uuIdentity, Errors.Load, uuAppErrorMap);
    const standardUserRoles = userRoles.userRoles;
    uuAppErrorMap = userRoles.uuAppErrorMap;
    // HDS 4
    return {
      ...uuSchoolKit,
      artifactEnvironment,
      profileList,
      standardUserRoles,
      uuAppErrorMap,
    };
  }
}

module.exports = new LoadAbl();
