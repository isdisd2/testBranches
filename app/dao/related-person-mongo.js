"use strict";
const { UuObjectDao } = require("uu_appg01_server").ObjectStore;
const { ObjectId } = require("mongodb");

class RelatedPersonMongo extends UuObjectDao {
  async createSchema() {
    await super.createIndex({ awid: 1, personalCardId: 1 }, { unique: true });
    await super.createIndex(
      { awid: 1, uuIdentity: 1 },
      { unique: true, partialFilterExpression: { uuIdentity: { $exists: true } } }
    );
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

  async getByPersonalCardId(awid, personalCardId) {
    return await super.findOne({ awid, personalCardId });
  }

  async getByUuIdentity(awid, uuIdentity) {
    return await super.findOne({ awid, uuIdentity });
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

  async listByUuIdentity(object, pageInfo) {
    let filter = {
      awid: object.awid,
      uuIdentity: { $in: object.arrayOfUuIdentity },
    };
    return await super.find(filter, pageInfo);
  }
  // TODO: listByUuIdentity

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
}

module.exports = RelatedPersonMongo;
