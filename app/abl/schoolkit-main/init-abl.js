"use strict";
const { Validator } = require("uu_appg01_server").Validation;
const { DaoFactory } = require("uu_appg01_server").ObjectStore;
const { AppClientTokenService } = require("uu_appg01_server").Workspace;
const { ValidationHelper } = require("uu_appg01_server").AppServer;
const { UriBuilder } = require("uu_appg01_server").Uri;
const { Config } = require("uu_appg01_server").Utils;
const AppClientTokenHelper = require("../helpers/app-client-token-helper.js");
const UuBtHelper = require("../helpers/uu-bt-helper.js");
const ScriptEngineHelper = require("../helpers/scripts-helpers");
const { Schemas, SchoolKit } = require("../common-constants");
const crypto = require("crypto");
const { Activity, TYPES: activityTypes, dateFunctions } = require("../../components/activity");
const ConsoleUriHelper = require("../../components/console-uri-helper");

const Errors = require("../../api/errors/schoolkit-main-error.js");
const Warnings = require("../../api/warnings/schoolkit-main-warnings");

const UUALLFROMTERRITORY = "uuAllFromTerritory";
const TYPECODE = "uu-schoolkit-schoolg01";

class InitAbl {
  constructor() {
    this.validator = Validator.load();
    this.dao = DaoFactory.getDao(Schemas.SCHOOLKIT);
  }

  async init(uri, dtoIn, session, uuAppErrorMap = {}) {
    // HDS 1
    const awid = uri.getAwid();

    // 1.1, 1.2, 1.3
    let validationResult = this.validator.validate("schoolKitInitDtoInType", dtoIn);
    uuAppErrorMap = ValidationHelper.processValidationResult(
      dtoIn,
      validationResult,
      Warnings.InitUnsupportedKeys.CODE,
      // 1.3.1
      Errors.Init.InvalidDtoIn
    );

    // HDS 2
    // 2.1
    // 2.1.1
    let isUriInvalid = false;
    let locationId, uuBtUri;
    try {
      let parsedLocationUri = UriBuilder.parse(dtoIn.locationUri);
      locationId = parsedLocationUri.getParameters() && parsedLocationUri.getParameters().id;
      uuBtUri = parsedLocationUri.setUseCase("").clearParameters().toString();
      // 2.1.2
    } catch (e) {
      isUriInvalid = e;
    }
    if (isUriInvalid || !locationId) {
      throw new Errors.Init.InvalidLocationUri({ uuAppErrorMap });
    }

    // HDS 3
    let uuObject = await this.dao.getByAwid(awid);

    // HDS 4, 4.1,  4.1.A
    if (!uuObject) {
      // 4.1.A.1, 4.1.A.1.A, 4.1.A.1.A.1
      if (!dtoIn.code) dtoIn.code = crypto.randomBytes(16).toString("hex");
    } else {
      // 4.1.B, 4.1.B.1
      dtoIn.code = uuObject.code;
    }

    // HDS 5
    let schemaCreateResults = Object.values(Schemas).map(async (schema) => {
      try {
        return await DaoFactory.getDao(schema).createSchema();
      } catch (e) {
        // 5.1
        throw new Errors.Init.SchemaDaoCreateSchemaFailed({ uuAppErrorMap }, { schema }, e);
      }
    });
    await Promise.all(schemaCreateResults);

    // HDS 6, 6.1
    try {
      // 6.1.A
      await AppClientTokenService.initKeys(awid);
    } catch (e) {
      // 6.1.B
      throw new Errors.Init.FailedToInitializeKeys({ uuAppErrorMap }, e);
    }

    // HDS 7
    let callOpts = {};
    try {
      callOpts = await AppClientTokenHelper.createToken(uri, uuBtUri, session);
    } catch (e) {
      //7.1
      throw new Errors.Init.AppClientTokenCreateFailed({ uuAppErrorMap }, e);
    }

    // HDS 8
    const metaModel = await UuBtHelper.uuAppMetaModel.get(uuBtUri, callOpts);
    if (!metaModel || !Object.keys(metaModel).length) {
      //8.1
      throw new Errors.Init.MetaModelDoesNotExist({ uuAppErrorMap });
    }

    // HDS 9,  9.1
    let uuAwsc;

    // 9.1.A
    if (uuObject && uuObject.artifactId) {
      // 9.1.A.1,  9.1.A.1.1, 9.1.A.1.2., 9.1.A.1.2.A.
      try {
        uuAwsc = await UuBtHelper.uuAwsc.get(uuBtUri, { id: uuObject.artifactId }, callOpts);
      } catch (e) {
        //9.1.A.1.2.B, 9.1.A.1.2.B.1.
        throw new Errors.Init.GetAwscFailed({ uuAppErrorMap }, e);
      }
    } else {
      // 9.1.B, 9.1.B.1
      //9.1.B.1.2.
      if (!dtoIn.permissionMatrix) {
        dtoIn.permissionMatrix = metaModel.defaultPermissionMatrix;
      }

      const dtoInUuAwsc = {
        name: dtoIn.name,
        typeCode: TYPECODE,
        desc: dtoIn.desc,
        permissionMatrix: dtoIn.permissionMatrix,
        location: locationId,
      };
      // 9.1.B.1.3., 9.1.B.1.3.A.
      try {
        uuAwsc = await UuBtHelper.uuAwsc.create(uuBtUri, dtoInUuAwsc, callOpts);
      } catch (e) {
        //9.1.B.1.3.B., 9.1.B.1.3.B.1.
        throw new Errors.Init.CreateAwscFailed({ uuAppErrorMap }, e);
      }
    }

    // Related Apps
    let relatedApplications = [];
    if (dtoIn.appMap && dtoIn.appMap.length > 0) {
      let appMap = new Set(dtoIn.appMap);
      relatedApplications = [...appMap];
    }

    // HDS 10, 10.1, 10.1.A
    if (uuObject) {
      // 10.1.A.1, 10.1.A.1.A
      try {
        await this.dao.remove(uuObject);
      } catch (e) {
        // 10.1.A.1.B., 10.1.A.1.B.1.
        throw new Errors.Init.UuSchoolKitDeleteDaoFailed({ uuAppErrorMap }, e);
      }
    }
    // HDS 10.2, 10.2.1
    const uuSchoolKitObject = {
      awid,
      state: SchoolKit.States.ACTIVE,
      name: dtoIn.name,
      principal: dtoIn.principal,
      desc: dtoIn.desc,
      code: dtoIn.code,
      btBaseUri: uuBtUri,
      bemBaseUri: dtoIn.bemBaseUri,
      artifactId: uuAwsc.id,
      consoleUri: dtoIn.consoleUri,
      consoleCode: dtoIn.consoleCode,
      scriptEngineUri: dtoIn.scriptEngineUri,
      unit: locationId,
      appMap: relatedApplications,
    };
    //10.2.2. , 10.2.2.A.
    try {
      uuObject = await this.dao.create(uuSchoolKitObject);
    } catch (e) {
      // 10.2.2.B., 10.2.2.B.1.
      throw new Errors.Init.UuSchoolKitCreateDaoFailed({ uuAppErrorMap }, e);
    }

    // HDS 11
    let workspaceData;
    // 11.1., 11.1.A.
    try {
      workspaceData = await UuBtHelper.uuAwsc.getAppWorkspace(awid);
    } catch (e) {
      // 11.1.B., 11.1.B.1.
      throw new Errors.Init.SysGetAppWorkspaceFailed({ uuAppErrorMap }, { appUri: uri.toString() });
    }

    // HDS  12.1, 11.1.A
    if (workspaceData && workspaceData.authorizationStrategy !== "artifact") {
      //11.1.A.1.
      const appBaseUri = uri.getBaseUri();
      const artifactUri = UriBuilder.parse(uuBtUri)
        .setUseCase("uuArtifact")
        .setParameters({ id: uuAwsc.id })
        .toString();
      // 11.1.A.1.1, 11.1.A.1.1.A.
      try {
        await UuBtHelper.uuAwsc.connectArtifact(appBaseUri, artifactUri, session);
      } catch (e) {
        //11.1.A.1.1.B.
        throw new Errors.Init.ConnectAwscFailed({ uuAppErrorMap }, { awscId: uuAwsc.id, e });
      }
    }

    // HDS 12, 12.1
    const setArtifactPermissionsDtoIn = {
      id: uuAwsc.id,
      explicitPermissionList: [
        null,
        null,
        {
          roleGroupIfcCode: UUALLFROMTERRITORY,
        },
      ],
      permissionMatrix: [
        "10000000-00000000-00000000-00001000",
        "01100000-00000000-00000000-00000000",
        "00000000-00000000-00000000-00000000",
        "00000000-00000000-00000000-00000010",
      ],
    };
    // 12.2, 12.2.A
    try {
      await UuBtHelper.uuArtifactIfc.setPermissions(uuBtUri, setArtifactPermissionsDtoIn, callOpts);

      // 12.2.B
    } catch (e) {
      // 12.2.B.1
      throw new Errors.Init.SetAwscPermissionsFailed({ uuAppErrorMap }, { awscId: uuAwsc.id, e });
    }

    // HDS 13

    let consoleUri = ConsoleUriHelper.get(dtoIn);
    // 13.1
    const scriptDtoIn = {
      scriptUri: Config.get("uuScriptUri"),
      consoleUri,
      scriptDtoIn: {
        locationUri: dtoIn.locationUri,
        uuSchoolKitBaseUri: uri.getBaseUri().toString(),
      },
    };

    // 13.2., 13.2.A
    try {
      await ScriptEngineHelper.uuSchoolKitFolderCreate(dtoIn.scriptEngineUri, scriptDtoIn, session);
    } catch (e) {
      // 13.2.B, 13.2.B.1.
      throw new Errors.Init.ScriptOperationFailed(
        { uuAppErrorMap },
        {
          awscId: uuAwsc.id,
          appUri: uri.toString(),
          scriptEngineUri: dtoIn.scriptEngineUri,
          consoleUri: dtoIn.consoleUri,
          consoleCode: dtoIn.consoleCode,
          cause: e.message,
        }
      );
    }

    const activityDtoIn = {
      id: uuObject.artifactId,
      submitterCode: session.getIdentity().getUuIdentity(),
      solverList: [
        {
          solverCode: session.getIdentity().getUuIdentity(),
        },
      ],
      type: activityTypes.info,
      name: Activity.createLsiContent("school", "name"),
      desc: Activity.createLsiContent("school", "desc"),
      endTime: dateFunctions.getNextDay(),
    };
    let activityResult;
    try {
      activityResult = await Activity.create(activityDtoIn, session, uuBtUri, uri, callOpts, uuAppErrorMap);
    } catch (e) {
      ValidationHelper.addWarning(
        uuAppErrorMap,
        Warnings.createFailedToCreateActivity.code,
        Warnings.createFailedToCreateActivity.message,
        { cause: e }
      );
    }

    // HDS 14
    return {
      ...uuObject,
      activityResult,
      uuAppErrorMap,
    };
  }
}

module.exports = new InitAbl();
