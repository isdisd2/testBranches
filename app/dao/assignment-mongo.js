"use strict";
const { UuObjectDao } = require("uu_appg01_server").ObjectStore;

class AssignmentMongo extends UuObjectDao {
  async createSchema() {
    await super.createIndex({ awid: 1, code: 1 }, { unique: true });
    await super.createIndex({ awid: 1, subjectId: 1 });
  }

  async create(uuObject) {
    return await super.insertOne(uuObject);
  }

  async get(awid, id) {
    let filter = {
      awid: awid,
      _id: id,
    };
    return await super.findOne(filter);
  }

  async getByCode(awid, code) {
    return await super.findOne({ awid, code });
  }

  async list(filter, pageInfo) {
    if (filter.uuIdentity) {
      const studentMapKey = "studentMap." + filter.uuIdentity;
      filter[[studentMapKey]] = { $exists: true};
      delete filter.uuIdentity;
    }

    return await super.find(filter, pageInfo);
  }

  async update(uuObject) {
    let filter = {
      awid: uuObject.awid,
      id: uuObject.id,
    };
    return await super.findOneAndUpdate(filter, uuObject, "NONE");
  }

  async delete(awid, id) {
    return await super.deleteOne({ awid, id });
  }

  async addStudents(filter, studentMap) {
    return await super.findOneAndUpdate(filter, { $set: { studentMap } }, "NONE");
  }

  async removeStudent(filter, studentUuIdentity) {
    const studentMapKey = "studentMap." + studentUuIdentity;
    return await super.findOneAndUpdate(filter, { $unset: { [studentMapKey]: "" } }, "NONE");
  }
}

module.exports = AssignmentMongo;
