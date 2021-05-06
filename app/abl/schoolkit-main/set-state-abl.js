"use strict";
const { Validator } = require("uu_appg01_server").Validation;
const { DaoFactory } = require("uu_appg01_server").ObjectStore;
const { ValidationHelper } = require("uu_appg01_server").AppServer;
const AppClientTokenHelper = require("../helpers/app-client-token-helper.js");
const UuBtHelper = require("../helpers/uu-bt-helper.js");
const InstanceChecker = require("../../components/instance-checker");
const { Schemas, SchoolKit } = require("../common-constants");

const Errors = require("../../api/errors/schoolkit-main-error.js");
const Warnings = require("../../api/warnings/schoolkit-main-warnings");

class SetStateAbl {
  constructor() {
    this.validator = Validator.load();
    this.dao = DaoFactory.getDao(Schemas.SCHOOLKIT);
  }

  async setState(uri, dtoIn, session, authResult, uuAppErrorMap = {}) {
    // HDS 1
    const awid = uri.getAwid();

    // 1.1 - 1.3
    let allowedStates = SchoolKit.NonFinalStatesWithPassive;
    let uuSchoolKit = await InstanceChecker.ensureInstanceAndState(awid, Errors.SetState, allowedStates, uuAppErrorMap);

    // HDS 2
    // 2.2.
    // 2.2.1.
    // 2.3.
    // 2.3.1.
    let validationResult = this.validator.validate("uuSchoolKitSetStateDtoInType", dtoIn);
    uuAppErrorMap = ValidationHelper.processValidationResult(
      dtoIn,
      validationResult,
      Warnings.SetStateUnsupportedKeys.CODE,
      Errors.SetState.InvalidDtoIn
    );

    // HDS 3
    // 3.1
    let artifactEnvironment;
    let callOpts;
    const uuAwscSetStateDtoIn = {
      id: uuSchoolKit.artifactId,
      state: dtoIn.state,
      data: dtoIn.data,
      desc: dtoIn.setStateReason
    };
    if (dtoIn.setStateReason !== undefined) {
      const setStateReason = uuSchoolKit.setStateReason || [];
      setStateReason.push(dtoIn.setStateReason);
      uuSchoolKit.setStateReason = setStateReason;
    }
    try {
      // 3.2
      // 3.2.A
      callOpts = await AppClientTokenHelper.createToken(uri, uuSchoolKit.btBaseUri, session);
      artifactEnvironment = await UuBtHelper.uuAwsc.setState(uuSchoolKit.btBaseUri, uuAwscSetStateDtoIn, callOpts);
    } catch (e) {
      // 3.2.B
      // 3.2.B.1
      throw new Errors.SetState.UuAwscSetStateFailed({ uuAppErrorMap }, e);
    }

    // HDS 4
    // 4.1
    try {
      // 4.1.A
      uuSchoolKit = await this.dao.update({ ...uuSchoolKit, state: dtoIn.state });
    } catch (e) {
      // 4.1.B
      // 4.1.B.1
      throw new Errors.SetState.UuSchoolKitUpdateDaoFailed({ uuAppErrorMap }, e);
    }

    if (uuSchoolKit.principal) {
      let principal;
      try {
        principal = await UuBtHelper.uuRoleIfc.get(uuSchoolKit.btBaseUri, { id: uuSchoolKit.principal }, callOpts);
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

    // HDS 8
    return {
      ...uuSchoolKit,
      artifactEnvironment,
      uuAppErrorMap
    };
  }
}

module.exports = new SetStateAbl();
