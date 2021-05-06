"use strict";
const { UuObjectDao } = require("uu_appg01_server").ObjectStore;
const { ObjectId } = require("mongodb");

class StudentMongo extends UuObjectDao {
  async createSchema() {
    await super.createIndex({ awid: 1, personalCardId: 1 }, { unique: true });
    await super.createIndex({ awid: 1, uuIdentity: 1 }, { unique: true });
    await super.createIndex({ awid: 1, "relatedPersonList.id": 1 });
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

  async getByUuIdentity(awid, uuIdentity) {
    return await super.findOne({ awid, uuIdentity });
  }

  async getByPersonalCardId(awid, personalCardId) {
    return await super.findOne({ awid, personalCardId });
  }

  async list(awid, pageInfo) {
    return await super.find({ awid }, pageInfo);
  }

  async listStudentsWithClass(awid, pageInfo) {
    let match = { awid };

    return super.aggregate([
      { $match: match },
      {
        $addFields: { id: { $toString: "$_id" } },
      },
      {
        $lookup: {
          from: "class",
          let: { strId: "$id" },
          as: "classes",
          pipeline: [
            // match only semi-valid classes where there is the selected student at least one active student,
            // so that there will be less classes to process and filter afterwards
            { $match: { "studentList.state": "active", $expr: { $in: ["$$strId", "$studentList.id"] } } },

            {
              $project: {
                _id: 1,
                name: 1,
                state: 1,
                // filter those classes, where the student is listed as not active ($elemMatch does not work here)
                studentList: {
                  $filter: {
                    input: "$studentList",
                    as: "student",
                    cond: { $and: [{ $eq: ["$$student.state", "active"] }, { $eq: ["$$strId", "$$student.id"] }] },
                  },
                },
              },
            },
            // remove those documents where the studentList is empty
            { $match: { $expr: { $gt: [{ $size: "$studentList" }, 0] } } },

            // and then fix some fields, such as _id and not necessary studentList
            { $addFields: { id: { $toString: "$_id" } } },
            { $project: { _id: 0, studentList: 0 } },
          ],
        },
      },
      { $project: { _id: 0 } },
      {
        $facet: {
          itemList: [{ $skip: pageInfo.pageIndex * pageInfo.pageSize }, { $limit: pageInfo.pageSize }],
          pageInfo: [
            { $group: { _id: "0", total: { $sum: 1 } } },
            {
              $addFields: {
                pageIndex: pageInfo.pageIndex,
                pageSize: pageInfo.pageSize,
              },
            },
            { $project: { _id: 0 } },
          ],
        },
      },
    ]);
  }

  async listByRelatedPerson(awid, relatedPersonId, pageInfo) {
    return await super.find({ awid, "relatedPersonList.id": relatedPersonId }, pageInfo);
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

  async addRelatedPersons(data) {
    return await super.findOneAndUpdate(
      data.filter,
      { $push: { relatedPersonList: { $each: data.relatedPersonsToAdd } } },
      "NONE"
    );
  }

  async removeRelatedPerson(data) {
    return await super.findOneAndUpdate(
      data.filter,
      {
        $pull: { relatedPersonList: { id: data.relatedPerson } },
      },
      "NONE"
    );
  }

  async listByIds(awid, listById, pageInfo) {
    let listOfObjectIds = listById.map((id) => ObjectId(id));
    let filter = {
      awid,
      id: { $in: listOfObjectIds },
    };
    return await super.find(filter, pageInfo);
  }
}

module.exports = StudentMongo;
