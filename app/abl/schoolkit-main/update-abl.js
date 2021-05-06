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

class UpdateAbl {
  constructor() {
    this.validator = Validator.load();
    this.dao = DaoFactory.getDao(Schemas.SCHOOLKIT);
  }

  async update(uri, dtoIn, session, authResult, uuAppErrorMap = {}) {
    // HDS 1
    const awid = uri.getAwid();

    // 1.1 - 1.3
    let allowedStates = SchoolKit.NonFinalStatesWithPassive;
    let uuObject = await InstanceChecker.ensureInstanceAndState(awid, Errors.Update, allowedStates, uuAppErrorMap);

    // HDS 2, 2.1, 2.2, 2.2.1, 2.3, 2.3.1
    let validationResult = this.validator.validate("schoolKitUpdateDtoInType", dtoIn);
    uuAppErrorMap = ValidationHelper.processValidationResult(
      dtoIn,
      validationResult,
      Warnings.UpdateUnsupportedKeys.CODE,
      Errors.Update.InvalidDtoIn
    );

    let callOpts = {};
    const btBaseUri = uuObject.btBaseUri;
    let artifactEnvironment;
    // HDS 3
    // 3.1, 3.1.A
    if ((dtoIn.name && dtoIn.name !== uuObject.name) || (dtoIn.desc && dtoIn.desc !== uuObject.desc)) {
      // 3.1.A.1
      const dtoInUuAwcsSetBasicAttributes = {
        id: uuObject.artifactId,
        name: dtoIn.name,
        desc: dtoIn.desc
      };
      // 3.1.A.2
      // 3.1.A.2.A
      try {
        callOpts = await AppClientTokenHelper.createToken(uri, btBaseUri, session);
        artifactEnvironment = await UuBtHelper.uuAwsc.setBasicAttributes(
          btBaseUri,
          dtoInUuAwcsSetBasicAttributes,
          callOpts
        );
        // 3.1.A.2.B.
      } catch (e) {
        // 3.1.A.2.B.1.
        throw new Errors.Update.SetBasicUuAwscArtifactAttributesFailed({ uuAppErrorMap }, e);
      }
      // 3.1.B
    } else {
      // 3.1.B.1
      try {
        callOpts = await AppClientTokenHelper.createToken(uri, btBaseUri, session);
        artifactEnvironment = await UuBtHelper.uuAwsc.loadEnvironment(btBaseUri, { id: uuObject.artifactId }, callOpts);
        // 3.1.B.1.B
      } catch (e) {
        // 3.1.B.1.B.1
        throw new Errors.Update.FailedToLoadUuAwscEnvironment({ uuAppErrorMap }, e);
      }
    }

    // Related Apps
    if (dtoIn.appMap && dtoIn.appMap.length > 0) {
      uuObject.appMap = Array.from(new Set(dtoIn.appMap));
      delete dtoIn.appMap;
    }
    // HDS 4, 4.1

    let updatedUuSchoolKit = { ...uuObject, ...dtoIn };
    // 4.1.A.
    try {
      uuObject = await this.dao.update(updatedUuSchoolKit);
      // 4.1.B.
    } catch (e) {
      // 4.1.B.1.
      throw new Errors.Update.UuSchoolKitDaoUpdateFailed({ uuAppErrorMap }, { awid }, e);
    }

    // FIXME duplicated code fragment
    if (uuObject.principal) {
      let principal;
      try {
        principal = await UuBtHelper.uuRoleIfc.get(btBaseUri, { id: uuObject.principal }, callOpts);
      } catch (e) {
        ValidationHelper.addWarning(
          uuAppErrorMap,
          Warnings.FailedToLoadPrincipalRole.CODE,
          Warnings.FailedToLoadPrincipalRole.MESSAGE,
          { principalRole: uuObject.principal, cause: e }
        );
      }

      if (principal && principal.name) {
        uuObject.principalName = principal.name;
        uuObject.principalState = principal.state;
      }
    }

    // HDS 5
    return {
      ...uuObject,
      artifactEnvironment,
      profileList: authResult.getIdentityProfiles(),
      uuAppErrorMap
    };
  }
}

module.exports = new UpdateAbl();
