"use strict";
// template: uuCommand
// templateVersion: 0.1.0
// documentation:
//@@viewOn:revision
// coded: Branislav Dolny (13-2838-1), 4/1/2020
//@@viewOff:revision

//@@viewOn:imports
const { DaoFactory } = require("uu_appg01_server").ObjectStore;
const { Schemas } = require("../abl/common-constants");
//@@viewOff:imports

//@@viewOn:constants
const ROLES = {
  teacher: "Teacher",
  student: "Student",
  relatedPerson: "RelatedPerson",
};
//@@viewOff:constants

//@@viewOn:component

class UserRolesChecker {
  constructor() {
    this.relatedPersonDao = DaoFactory.getDao(Schemas.RELATED_PERSON);
    this.studentDao = DaoFactory.getDao(Schemas.STUDENT);
    this.teacherDao = DaoFactory.getDao(Schemas.TEACHER);
  }

  async checkUserRoles(awid, uuIdentity, errors, uuAppErrorMap = {}) {
    const promises = [
      this.checkIsStudent(awid, uuIdentity),
      this.checkIsRelatedPerson(awid, uuIdentity),
      this.checkIsTeacher(awid, uuIdentity),
    ];

    let userRoles = [];
    try {
      userRoles = await Promise.all(promises);
    } catch (e) {
      throw new errors.UuSchoolKitDaoLoadFailed({ uuAppErrorMap });
    }

    return { userRoles, uuAppErrorMap };
  }

  async checkIsStudent(awid, uuIdentity) {
    const Student = await this.studentDao.getByUuIdentity(awid, uuIdentity);
    if (Student) {
      return { Student };
    }
    return {};
  }

  async checkIsTeacher(awid, uuIdentity) {
    const Teacher = await this.teacherDao.getByUuIdentity(awid, uuIdentity);
    if (Teacher && Teacher.state !== "closed") {
      return { Teacher };
    }
    return {};
  }

  async checkIsRelatedPerson(awid, uuIdentity) {
    const RelatedPerson = await this.relatedPersonDao.getByUuIdentity(awid, uuIdentity);
    if (RelatedPerson) {
      return { RelatedPerson };
    }
    return {};
  }
}

const userRolesChecker = new UserRolesChecker();
Object.freeze(userRolesChecker);
//@@viewOff:component

//@@viewOn:exports
module.exports = userRolesChecker;
//@@viewOff:exports
