"use strict";
const Path = require("path");
const { Validator } = require("uu_appg01_server").Validation;
const { DaoFactory } = require("uu_appg01_server").ObjectStore;
const { ValidationHelper } = require("uu_appg01_server").AppServer;
const { UuAppWorkspace } = require("uu_appg01_server").Workspace;
const { LoggerFactory } = require("uu_appg01_server").Logging;
const { DbConnection } = require("uu_appg01_datastore");
const { Config } = require("uu_appg01_server").Utils;
const { Schemas } = require("./common-constants");

const Errors = require("../api/errors/migrate-error.js");

const logger = LoggerFactory.get("UuSchoolKit.Model.Migrate");

const WARNINGS = {
  migrateUnsupportedKeys: {
    code: `${Errors.Migrate.UC_CODE}unsupportedKeys`
  }
};

const AllSchemas = [
  Schemas.SCHOOL_YEAR,
  Schemas.CLASS,
  Schemas.SUBJECT,
  Schemas.TEACHER,
  Schemas.RELATED_PERSON,
  Schemas.STUDENT
];

class MigrateAbl {
  constructor() {
    this.validator = new Validator(Path.join(__dirname, "..", "api", "validation_types", "migrate-types.js"));
    this.schoolKitDao = DaoFactory.getDao(Schemas.SCHOOLKIT);
    this.schoolYearDao = DaoFactory.getDao(Schemas.SCHOOL_YEAR);
    this.subjectDao = DaoFactory.getDao(Schemas.SUBJECT);
    this.studentDao = DaoFactory.getDao(Schemas.STUDENT);
    this.teacherDao = DaoFactory.getDao(Schemas.TEACHER);
    this.relatedPersonDao = DaoFactory.getDao(Schemas.RELATED_PERSON);
    this.allSchemas = AllSchemas;
  }

  async migrate(awid, dtoIn) {
    let uuAppErrorMap = {};
    let dtoOut = {};

    let validationResult = this.validator.validate("migrateDtoInType", dtoIn);
    uuAppErrorMap = ValidationHelper.processValidationResult(
      dtoIn,
      validationResult,
      WARNINGS.migrateUnsupportedKeys.code,
      Errors.Migrate.InvalidDtoIn
    );

    await this._migrate0103(awid, dtoIn, dtoOut, uuAppErrorMap);

    return { dtoOut, uuAppErrorMap };
  }

  async _migrate0103(awid, dtoIn, dtoOut, uuAppErrorMap) {
    const map = Config.get("uuSubAppDataStoreMap");
    const uriMap = map["primary"];
    const db = await DbConnection.get(uriMap);

    let studentList = await this.studentDao.list(awid, {
      pageIndex: 0,
      pageSize: 10000000
    });

    if (!studentList && !studentList.itemList) {
      logger.info("No students found, exit!");
      return;
    }

    for (let student of studentList.itemList) {
      if (student.relatedPersonList) {
        for (let relatedPerson of student.relatedPersonList) {
          logger.info(`Student id: ${student.id} with related person: ${relatedPerson.id}`);

          let _relPerson = await db
            .collection("relatedPerson")
            .findOne({ awid }, { uuIdentity: relatedPerson.uuIdentity });
          if (!relatedPerson.name || !relatedPerson.surname) {
            logger.info(`Adding name and surname from: ${JSON.stringify(_relPerson)}`);
            relatedPerson.name = _relPerson.name;
            relatedPerson.surname = _relPerson.surname;
          } else {
            logger.info(`Relatid person: ${JSON.stringify(relatedPerson)} already contains name and surname.`);
          }
        }
      }
      try {
        await this.studentDao.update(student);
      } catch (e) {
        throw e;
      }
    }
    logger.info("Migrate 0.10.3 successfully completed!");
  }

  async updateIndexes() {
    let schemas = [
      Schemas.SCHOOL_YEAR,
      Schemas.CLASS,
      Schemas.SUBJECT,
      Schemas.TEACHER,
      Schemas.RELATED_PERSON,
      Schemas.STUDENT
    ];
    const map = Config.get("uuSubAppDataStoreMap");
    const uri = map["primary"];
    const db = await DbConnection.get(uri);

    const personalsSchemas = [Schemas.TEACHER, Schemas.RELATED_PERSON, Schemas.STUDENT];

    let deleteEmptyData = {};
    for (let schema of personalsSchemas) {
      deleteEmptyData[schema] = await db.collection(schema).deleteMany({ personalCardId: null });
    }

    let removedIndexes = {};
    for (let schema of schemas) {
      removedIndexes[schema] = await db.collection(schema).dropAllIndexes({});
      await DaoFactory.getDao(schema).createSchema();
    }

    return {
      deleteEmptyData: deleteEmptyData,
      removedIndexes: removedIndexes
    };
  }

  async dropAwid(ucEnv) {
    let uri = ucEnv.getUri();
    let awid = uri.getAwid();
    // awid = "18ab89efe2934efa964478151738364d";
    await UuAppWorkspace.clearCache();
    let dao = DaoFactory.getDao("sysAppWorkspace");
    let appWorkspace = await dao.getByAwid(awid);
    appWorkspace.artifactUri = undefined;
    appWorkspace.state = "closed";
    appWorkspace.authorizationStrategy = "uuIdentity";
    await dao.updateByAwid(awid, appWorkspace);

    let schemas = this.allSchemas;
    const map = Config.get("uuSubAppDataStoreMap");
    const uriMap = map["primary"];
    const db = await DbConnection.get(uriMap);

    let removedIndexes = {};
    for (let schema of schemas) {
      removedIndexes[schema] = await db.collection(schema).dropAllIndexes({});
      await DaoFactory.getDao(schema).createSchema();
    }
    await UuAppWorkspace.clearCache();
    await UuAppWorkspace.deleteAppWorkspace(uri, { awid: awid });
  }

  async deleteAwsc(ucEnv) {
    let uri = ucEnv.getUri();
    let awid = uri.getAwid();
    let session = ucEnv.getSession();
    let dtoIn = ucEnv.getDtoIn();
    let awscArtifactCode = dtoIn.awscArtifactCode;
    let btBaseUri = dtoIn.btBaseUri;

    let finManBaseUri = Uri.parse(ucEnv.getUri()).getBaseUri();

    const cmdUri = UriBuilder.parse(btBaseUri)
      .setUseCase("/uuAwsc/delete")
      .toString();

    let deleteAwscDtoIn = { code: awscArtifactCode };
    let appClientToken = await AppClientTokenService.createToken(finManBaseUri, cmdUri);
    let callOpts = AppClientTokenService.setToken({ session }, appClientToken);
    let dtoOut = await AppClient.post(cmdUri, deleteAwscDtoIn, callOpts);
    return dtoOut;
  }
}

module.exports = new MigrateAbl();
