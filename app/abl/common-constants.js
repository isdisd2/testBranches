"use strict";
// template: uuCommand CommonConstants
// templateVersion: 0.1.0
// documentation: https://uuapp.plus4u.net/uu-bookkit-maing01/ce07c990d31f4917b5b4d75a3a99c2c9/book/page?code=20338184
//@@viewOn:revision
// coded: Anna Háblová (16-1071-1), 12/08/2020
//@@viewOff:revision

//@@viewOn:constants
const INITIAL_STATE = "initial";
const CANCELLED_STATE = "cancelled";
const FINAL = "final";
const ALTERNATIVE_FINAL = "alternativeFinal";

const ACTIVE = "active";
const ALTERNATIVE_ACTIVE = "alternativeActive";
const PREPARED = "prepared";
const PROBLEM = "problem";
const PASSIVE = "passive";

const FINAL_STATES = [CANCELLED_STATE, FINAL, ALTERNATIVE_FINAL];
const ACTIVE_STATES = [ACTIVE, ALTERNATIVE_ACTIVE, PREPARED, PROBLEM, PASSIVE];

const Profiles = {
  AUTHORITIES: "Authorities",
  EXECUTIVES: "Executives",
  AUDITORS: "Auditors",
  STANDARD_USERS: "StandardUsers"
};

// FIXME too many constants in one file, this should be a file for just common constants (so probably just schemas)
const CommonConstants = {
  Schemas: {
    SCHOOLKIT: "schoolkitMain",
    SCHOOL_YEAR: "schoolYear",
    CLASS: "class",
    SUBJECT: "subject",
    TEACHER: "teacher",
    RELATED_PERSON: "relatedPerson",
    STUDENT: "student",
    ASSIGNMENT: "assignment"
  },

  SchoolKit: {
    States: {
      INITIAL: "initial",
      ACTIVE: "active",
      PASSIVE: "passive",
      WARNING: "warning",
      PROBLEM: "problem",
      CLOSED: "closed"
    },
    get NonFinalStatesWithoutPassive() {
      return new Set([this.States.INITIAL, this.States.ACTIVE, this.States.WARNING, this.States.PROBLEM]);
    },
    get NonFinalStatesWithPassive() {
      return new Set([
        this.States.INITIAL,
        this.States.ACTIVE,
        this.States.WARNING,
        this.States.PROBLEM,
        this.States.PASSIVE
      ]);
    }
  },

  Class: {
    States: {
      INITIAL: "initial",
      ACTIVE: "active",
      PREPARED: "prepared",
      PASSIVE: "passive",
      WARNING: "warning",
      PROBLEM: "problem",
      CLOSED: "closed"
    },
    get ClosedState() {
      return new Set([this.States.CLOSED]);
    },
    get NonFinalStatesWithoutPassive() {
      return new Set([
        this.States.INITIAL,
        this.States.ACTIVE,
        this.States.PREPARED,
        this.States.WARNING,
        this.States.PROBLEM
      ]);
    },
    get NonFinalStatesWithPassive() {
      return new Set([
        this.States.INITIAL,
        this.States.ACTIVE,
        this.States.PREPARED,
        this.States.WARNING,
        this.States.PROBLEM,
        this.States.PASSIVE
      ]);
    }
  },

  SchoolYear: {
    States: {
      INITIAL: "initial",
      ACTIVE: "active",
      PASSIVE: "passive",
      WARNING: "warning",
      PROBLEM: "problem",
      CLOSED: "closed"
    },
    get NonFinalStatesWithoutPassive() {
      return new Set([this.States.INITIAL, this.States.ACTIVE, this.States.WARNING, this.States.PROBLEM]);
    },
    get NonFinalStatesWithPassive() {
      return new Set([
        this.States.INITIAL,
        this.States.ACTIVE,
        this.States.WARNING,
        this.States.PROBLEM,
        this.States.PASSIVE
      ]);
    }
  },

  RelatedPerson: {
    States: {
      INITIAL: "initial",
      ACTIVE: "active",
      PASSIVE: "passive",
      WARNING: "warning",
      PROBLEM: "problem",
      CLOSED: "closed"
    },
    get NonFinalStatesWithoutPassive() {
      return new Set([this.States.INITIAL, this.States.ACTIVE, this.States.WARNING, this.States.PROBLEM]);
    },
    get NonFinalStatesWithPassive() {
      return new Set([
        this.States.INITIAL,
        this.States.ACTIVE,
        this.States.WARNING,
        this.States.PROBLEM,
        this.States.PASSIVE
      ]);
    }
  },

  Student: {
    States: {
      INITIAL: "initial",
      ACTIVE: "active",
      PREPARED: "prepared",
      PASSIVE: "passive",
      WARNING: "warning",
      PROBLEM: "problem",
      FORMER: "former",
      CLOSED: "closed"
    },
    get NonFinalStatesWithoutPassive() {
      return new Set([
        this.States.INITIAL,
        this.States.ACTIVE,
        this.States.PREPARED,
        this.States.WARNING,
        this.States.PROBLEM
      ]);
    },
    get NonFinalStatesWithPassive() {
      return new Set([
        this.States.INITIAL,
        this.States.ACTIVE,
        this.States.PREPARED,
        this.States.WARNING,
        this.States.PROBLEM,
        this.States.PASSIVE
      ]);
    }
  },

  Subject: {
    States: {
      INITIAL: "initial",
      ACTIVE: "active",
      PREPARED: "prepared",
      PASSIVE: "passive",
      WARNING: "warning",
      PROBLEM: "problem",
      CLOSED: "closed"
    },
    get NonFinalStatesWithoutPassive() {
      return new Set([
        this.States.INITIAL,
        this.States.ACTIVE,
        this.States.PREPARED,
        this.States.WARNING,
        this.States.PROBLEM
      ]);
    },
    get NonFinalStatesWithPassive() {
      return new Set([
        this.States.INITIAL,
        this.States.ACTIVE,
        this.States.PREPARED,
        this.States.WARNING,
        this.States.PROBLEM,
        this.States.PASSIVE
      ]);
    }
  },
  Teacher: {
    States: {
      INITIAL: "initial",
      ACTIVE: "active",
      PASSIVE: "passive",
      WARNING: "warning",
      PROBLEM: "problem",
      CLOSED: "closed"
    },
    get NonFinalStatesWithoutPassive() {
      return new Set([this.States.INITIAL, this.States.ACTIVE, this.States.WARNING, this.States.PROBLEM]);
    },
    get NonFinalStatesWithPassive() {
      return new Set([
        this.States.INITIAL,
        this.States.ACTIVE,
        this.States.WARNING,
        this.States.PROBLEM,
        this.States.PASSIVE
      ]);
    }
  }

  // Profiles,
  //
  // StateList: {
  //   INITIAL: INITIAL_STATE,
  //   ACTIVE: ACTIVE,
  //   ALTERNATIVE_ACTIVE: ALTERNATIVE_ACTIVE,
  //
  //   PROBLEM: PROBLEM,
  //   PASSIVE: PASSIVE,
  //   CANCELLED: CANCELLED_STATE,
  //   FINAL: FINAL,
  //   ALTERNATIVE_FINAL: ALTERNATIVE_FINAL,
  //   FINAL_LIST: FINAL_STATES,
  //   ACTIVE_LIST: ACTIVE_STATES,
  // },
  //
  // AwscProfilesForRead: [Profiles.AUTHORITIES, Profiles.EXECUTIVES, Profiles.AUDITORS],
  //
  // AwscProfilesForUpdate: [Profiles.AUTHORITIES, Profiles.EXECUTIVES],
  //
  // AwscProfilesForSetState: [Profiles.AUTHORITIES, Profiles.EXECUTIVES],
  //
  // AwscProfilesForDelete: [Profiles.AUTHORITIES],
};
//@@viewOff:constants

//@@viewOn:exports
module.exports = CommonConstants;
//@@viewOff:exports
