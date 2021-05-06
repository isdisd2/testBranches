"use strict";
const { UuObjectDao } = require("uu_appg01_server").ObjectStore;

class SchoolYearMongo extends UuObjectDao {
  async createSchema() {
    await super.createIndex({ awid: 1, _id: 1 }, { unique: true });
    await super.createIndex({ awid: 1, code: 1 }, { unique: true });
  }

  async create(uuObject) {
    return await super.insertOne(uuObject);
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

  async list(awid, pageInfo) {
    return await super.find({ awid }, pageInfo);
  }

  async update(uuObject) {
    let filter = {
      awid: uuObject.awid,
      id: uuObject.id,
    };
    return await super.findOneAndUpdate(filter, uuObject, "NONE");
  }

  async updateByCode({ awid, code, ...uuObject }) {
    return await super.findOneAndUpdate({ awid, code }, uuObject, "NONE");
  }

  async delete(uuObject) {
    let filter = {
      awid: uuObject.awid,
      id: uuObject.id,
    };
    return await super.deleteOne(filter);
  }

  async deleteByCode(awid, code) {
    return await super.deleteOne({ awid, code });
  }
}

module.exports = SchoolYearMongo;
