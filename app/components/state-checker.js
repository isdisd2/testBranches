"use strict";
// template: uuCommand
// templateVersion: 0.1.0
// documentation:
//@@viewOn:revision
// coded: Vladimír Neckář (12-2695-1), 07/10/2020
//@@viewOff:revision

//@@viewOn:imports
//@@viewOff:imports

//@@viewOn:constants
//@@viewOff:constants

// FIXME to není úplně cool, podle mě by to mělo být specifický per entita a mělo by to umět i načítat.
// takže přístup ke konkrétnímu dau, na vstupu dáš id (nebo code), ono to načte a ověří stav
//@@viewOn:component
let StateChecker = {
  /**
   * verifies object proper state.
   * @param uuObject
   * @param error
   * @param uuAppErrorMap
   * @param states array of allowed states
   * @param errorParams if not specified, use default params
   * @returns uuObject
   */
  ensureState(uuObject, error, states, uuAppErrorMap = {}, errorParams) {
    let params = errorParams
      ? errorParams
      : {
          state: uuObject.state,
          expectedState: Array.from(states)
        };

    if (!states.has(uuObject.state)) {
      // 2.1.A
      throw new error({ uuAppErrorMap }, { params });
    }

    return uuObject;
  }
};

//@@viewOff:component

//@@viewOn:exports
module.exports = StateChecker;
//@@viewOff:exports
