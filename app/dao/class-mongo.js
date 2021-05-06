"use strict";
const { UuObjectDao } = require("uu_appg01_server").ObjectStore;
const { DbConnection } = require("uu_appg01_datastore");
const { ObjectId } = require("mongodb");

class ClassMongo extends UuObjectDao {
  async createSchema() {
    await super.createIndex({ awid: 1, code: 1 }, { unique: true });
    await super.createIndex({ awid: 1, schoolYearId: 1 });
    await super.createIndex({ awid: 1, "studentList.id": 1 });
  }

  async create(uuObject) {
    return await super.insertOne(uuObject);
  }

  async updateByCode({ awid, code, ...uuObject }) {
    return await super.findOneAndUpdate({ awid, code }, uuObject, "NONE");
  }

  async get(awid, id) {
    let filter = {
      awid: awid,
      id: id,
    };
    return await super.findOne(filter);
  }

  async getByCode(awid, code) {
    return await super.findOne({ awid, code });
  }

  // fixme: we do not have a way to tell what is a current class
  // B: we cant with this way, because teacher is cast into classRole, which is unique for every class
  async getTeacherCurrentClass(awid, classTeacherId) {
    return await super.find({ awid, classTeacherId });
  }

  async getTeacherClassesList(awid, listOfRolesId) {
    let filter = {
      awid,
      classTeacher: { $in: listOfRolesId },
    };
    return await super.find(filter);
  }

  // fixme: we do not have a way to ensure that student is only active in one class
  async getStudentCurrentClass(awid, studentId) {
    return await super.findOne({ awid, studentList: { $elemMatch: { id: studentId, state: "active" } } });
  }

  async list(awid, pageInfo) {
    return await super.find({ awid }, pageInfo);
  }

  async listById(awid, listById) {
    let listOfObjectIds = listById.map((id) => ObjectId(id));
    let filter = {
      awid,
      id: { $in: listOfObjectIds },
    };
    return await super.find(filter);
  }

  async listByStudentId(awid, studentId, pageInfo) {
    return await super.find({ awid, "studentList.id": studentId }, pageInfo);
  }

  async listBySchoolYearId(awid, schoolYearId, pageInfo) {
    return await super.find({ awid, schoolYearId }, pageInfo);
  }

  async update(uuObject) {
    let filter = {
      awid: uuObject.awid,
      id: uuObject.id,
    };
    return await super.findOneAndUpdate(filter, uuObject, "NONE");
  }

  async updateStudentClassNumber(filter, studentId, studentNumber) {
    return await super.findOneAndUpdate(
      { ...filter, "studentList.id": studentId },
      { $set: { "studentList.$.number": studentNumber } },
      "NONE"
    );
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
      .collection("class")
      .updateMany(
        { "studentList.id": studentId },
        { $set: set },
        { arrayFilters: [{ "elem.id": studentId }], multi: true }
      );
  }

  async addNextYearClass(filter, nextYearClassMap) {
    const { id, nextYearClass } = nextYearClassMap;
    return await super.findOneAndUpdate(filter, { $set: { ["nextYearClassMap." + id]: nextYearClass } }, "NONE");
  }

  async addStudents(filter, studentsToAdd) {
    return await super.findOneAndUpdate(filter, { $push: { studentList: { $each: studentsToAdd } } }, "NONE");
  }

  async removeStudent(filter, studentToRemoveId) {
    return await super.findOneAndUpdate(
      { ...filter, "studentList.id": studentToRemoveId },
      { $set: { "studentList.$.state": "former" } },
      "NONE"
    );
  }

  async delete(awid, id) {
    return await super.deleteOne({ awid, id });
  }

  async deleteByCode(awid, code) {
    return await super.deleteOne({ awid, code });
  }
}

module.exports = ClassMongo;
