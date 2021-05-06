"use strict";
const { UuObjectDao } = require("uu_appg01_server").ObjectStore;
const { DbConnection } = require("uu_appg01_datastore");

class SubjectMongo extends UuObjectDao {
  async createSchema() {
    await super.createIndex({ awid: 1, code: 1 }, { unique: true });
    await super.createIndex({ awid: 1, classId: 1 });
    await super.createIndex({ awid: 1, "studentList.id": 1 });
  }

  async create(uuObject) {
    return await super.insertOne(uuObject);
  }

  async get(awid, id) {
    let filter = {
      awid: awid,
      id: id
    };
    return await super.findOne(filter);
  }

  async getByCode(awid, code) {
    return await super.findOne({ awid, code });
  }

  async listByClassId(awid, classId, pageInfo) {
    return await super.find({ awid, classId }, pageInfo);
  }

  async listByStudentId(awid, studentId, pageInfo) {
    return await super.find({ awid, "studentList.id": studentId }, pageInfo);
  }

  async listBySubjectTeacher(awid, subjectTeacherId, pageInfo) {
    return await super.find({ awid, subjectTeacherId }, pageInfo);
  }

  async update(uuObject) {
    let filter = {
      awid: uuObject.awid,
      id: uuObject.id
    };
    return await super.findOneAndUpdate(filter, uuObject, "NONE");
  }

  async updateStudentRelation(studentId, attributesToUpdate) {
    let db = await DbConnection.get(this.customUri);
    let set = {};

    // todo: add and test other attributes when needed
    const { uuIdentity } = attributesToUpdate;
    if (uuIdentity) {
      set["studentList.$[elem].uuIdentity"] = uuIdentity;
    }

    return await db
      .collection("subject")
      .updateMany(
        { "studentList.id": studentId },
        { $set: set },
        { arrayFilters: [{ "elem.id": studentId }], multi: true }
      );
  }

  async addStudents(filter, studentsToAdd) {
    return await super.findOneAndUpdate(filter, { $push: { studentList: { $each: studentsToAdd } } }, "NONE");
  }

  async reactivateStudent(filter, studentToRemoveId) {
    return await super.findOneAndUpdate(
      { ...filter, "studentList.id": studentToRemoveId },
      { $set: { "studentList.$.state": "active" } },
      "NONE"
    );
  }

  async updateByCode({ awid, code, ...uuObject }) {
    return await super.findOneAndUpdate({ awid, code }, uuObject, "NONE");
  }

  async list(awid, pageInfo) {
    return await super.find({ awid }, pageInfo);
  }

  async delete(awid, id) {
    return await super.deleteOne({ awid, id });
  }

  async deleteByCode(awid, code) {
    return await super.deleteOne({ awid, code });
  }

  async getTeacherSubjectsList(awid, listOfRolesId) {
    let filter = {
      awid,
      subjectTeacher: { $in: listOfRolesId },
    };
    return await super.find(filter);
  }
}

module.exports = SubjectMongo;
