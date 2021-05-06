"use strict";
// template: uuCommand
// templateVersion: 0.1.0
// documentation: https://uuapp.plus4u.net/uu-bookkit-maing01/ce07c990d31f4917b5b4d75a3a99c2c9/book/page?code=47281063
//@@viewOn:revision
// coded: Vladimír Neckář (12-2695-1), 07/10/2020
//@@viewOff:revision

//@@viewOn:imports
const { DaoFactory } = require("uu_appg01_server").ObjectStore;
const { Schemas } = require("../abl/common-constants");
//@@viewOff:imports

//@@viewOn:constants
//@@viewOff:constants

//@@viewOn:component
class InstanceChecker {
  constructor() {
    this.dao = DaoFactory.getDao(Schemas.SCHOOLKIT);
  }

  /**
   * Loads schoolkit instance, check its existence and verifies proper state.
   * @param awid
   * @param errors
   * @param uuAppErrorMap
   * @param allowedStates array of allowed states
   * @returns {Promise<void>}
   */
  async ensureInstanceAndState(awid, errors, allowedStates, uuAppErrorMap = {}) {
    // HDS 1
    let uuSchoolKit = await this.ensureInstance(awid, errors, uuAppErrorMap);

    // HDS 2
    if (!allowedStates.has(uuSchoolKit.state)) {
      // 2.1.A
      throw new errors.UuSchoolKitIsNotInCorrectState(
        { uuAppErrorMap },
        {
          awid,
          state: uuSchoolKit.state,
          expectedState: Array.from(allowedStates)
        }
      );
    }

    return uuSchoolKit;
  }

  /**
   * Loads uuSchoolKit instance and check its existence
   * @param awid
   * @param errors
   * @param uuAppErrorMap
   * @returns {Promise<void>}
   */
  async ensureInstance(awid, errors, uuAppErrorMap) {
    // HDS 1
    let uuSchoolKit = await this.dao.getByAwid(awid);

    // HDS 2
    if (!uuSchoolKit) {
      // 2.1.A
      throw new errors.UuSchoolKitDoesNotExist({ uuAppErrorMap }, { awid });
    }

    return uuSchoolKit;
  }
}
//@@viewOff:component

//@@viewOn:exports
module.exports = new InstanceChecker();
//@@viewOff:exports
