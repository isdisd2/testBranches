const { Validator } = require("uu_appg01_server").Validation;
const { DaoFactory } = require("uu_appg01_server").ObjectStore;
const { UriBuilder } = require("uu_appg01_server").Uri;
const crypto = require("crypto");
const { AppClient } = require("uu_appg01_server-client");
const { ValidationHelper } = require("uu_appg01_server").AppServer;
const { Schemas, SchoolKit } = require("../common-constants");
const AppClientTokenHelper = require("../helpers/app-client-token-helper.js");
const InstanceChecker = require("../../components/instance-checker");

const Errors = require("../../api/errors/assignment-error.js");
const Warnings = require("../../api/warnings/assignment-warnings");

const TYPE_CODE = "uu-schoolkit-schoolg01/assignment";

const STATES = Object.freeze({
  initial: "initial",
  prepared: "prepared",
  active: "active",
  warning: "warning",
  problem: "problem",
  passive: "passive",
  closed: "closed",
});

class AddTaskAbl {
  constructor() {
    this.validator = Validator.load();
    this.states = STATES;
    this.typeCode = TYPE_CODE;
    this.dao = DaoFactory.getDao(Schemas.ASSIGNMENT);
    this.subjectDao = DaoFactory.getDao(Schemas.SUBJECT);
  }

  /**
   * Cmd add task to assignment
   * @param uri
   * @param dtoIn
   * @param profileList
   * @param session
   * @param uuAppErrorMap
   * @returns {Promise<void>}
   */

  async addTask(uri, dtoIn, profileList, session, uuAppErrorMap = {}) {
    const awid = uri.getAwid();

    // HDS 1 - check schoolkit state
    let allowedStates = SchoolKit.NonFinalStatesWithoutPassive;
    let uuSchoolKit = await InstanceChecker.ensureInstanceAndState(awid, Errors.Create, allowedStates, uuAppErrorMap);

    // HDS 2 - check dtoIn
    let validationResult = this.validator.validate("addTaskDtoInType", dtoIn);
    uuAppErrorMap = ValidationHelper.processValidationResult(
      dtoIn,
      validationResult,
      Warnings.createAssignmenUnsupportedKeys.code,
      Errors.AddTask.InvalidDtoIn
    );

    // HDS 3 - check if assignment exists
    const uuAsignment = await this.dao.get(awid, dtoIn.id);
    if (!uuAsignment) {
      throw new Errors.AddTask.AssignmentNotFound({ uuAppErrorMap }, { id: dtoIn.id });
    }

    // HDS 3 - check subject existence and get subject teacher
    const uuSubject = await this.subjectDao.get(awid, uuAsignment.subjectId);
    if (!uuSubject) {
      throw new Errors.Create.SubjectNotFound({ uuAppErrorMap }, { id: dtoIn.subjectId });
    }

    // HDS 3 - chceck cast existence
    let callOpts;
    try {
      callOpts = await AppClientTokenHelper.createToken(uri, uuSchoolKit.btBaseUri, session);
    } catch (e) {
      throw new Errors.AddTask.CallVerifyMyCastExistenceFailed({ uuAppErrorMap }, e);
    }
    if (!profileList.includes("Authorities") && !profileList.includes("Executives")) {
      const roleGroupIfcList = [{ id: uuSubject.subjectTeacher }];

      let verifyMyCastExistenceDtoOut = {};
      try {
        verifyMyCastExistenceDtoOut = await UuBtHelper.verifyMyCastExistence(
          uuSchoolKit.btBaseUri,
          { roleGroupIfcList: roleGroupIfcList },
          callOpts
        );
      } catch (e) {
        throw new Errors.AddTask.CallVerifyMyCastExistenceFailed({ uuAppErrorMap }, e);
      }

      // 6.4
      if (verifyMyCastExistenceDtoOut.roleGroupIfcList.length === 0) {
        throw new Errors.AddTask.UserNotAuthorized({ uuAppErrorMap });
      }
    }

    // HDS 4 - check if uri of course is valid
    let source = UriBuilder.parse(dtoIn.source);
    let course = {};

    let ckUri = source.getGateway() + "/" + source.getProduct() + "/" + source.getAwid() + "/loadCourseStructure";

    try {
      course = await AppClient.get(ckUri, {}, { session });
    } catch (e) {
      throw e;
    }

    if (!course) throw new Errors.UpdateTask.CourseNotFound({ uuAppErrorMap }, { courseUri: ckUri });

    /*
    course - study lesson
    book - learn
    =============
    name of course / name of book
    =============
    course - from the course
    book - from the book
A
     */

    console.log(course);

    let name = "";
    if (dtoIn.type === "course") name += "Study lesson ";
    else if (dtoIn.type === "book") name += "Learn from ";

    if (dtoIn.lessonName) name += dtoIn.lessonName;

    //HDS 4 - prepare task
    let code = crypto.randomBytes(16).toString("hex");
    let uuTask = {
      name: name,
      type: dtoIn.type,
      uri: dtoIn.source,
      baseUri: source.getGateway() + "/" + source.getProduct() + "/" + source.getAwid(),
      activityCode: source.getParameters().code,
      mandatory: dtoIn.mandatory,
      points: dtoIn.points,
      store: dtoIn.store,
      data: { pointsStrategy: dtoIn.pointsStrategy },
    };

    let task = {};
    task.taskMap = uuAsignment.taskMap || {};
    task.taskMap[code] = uuTask;

    task.awid = awid;
    task.id = dtoIn.id;

    //HDS 5 - dao create
    let dtoOut = {};

    try {
      dtoOut = await this.dao.update(task);
    } catch (e) {
      throw new Errors.AddTask.AddTaskDaoFailed({ uuAppErrorMap }, { cause: e });
    }

    return { ...dtoOut, uuAppErrorMap };
  }
}

module.exports = new AddTaskAbl();
