"use strict";
// template: uuCommand
// templateVersion: 0.1.0
// documentation:
//@@viewOn:revision
// coded: Branislav Dolny (13-2838-1), 21/12/2020
//@@viewOff:revision

//@@viewOn:imports
const { UriBuilder } = require("uu_appg01_server").Uri;
const AppClient = require("uu_appg01_server").AppClient;
const AppClientTokenHelper = require("../abl/helpers/app-client-token-helper");
const ActivityLsi = require("./activity-lsi");
//@@viewOff:imports

//@@viewOn:constants
const TYPES = Object.freeze({
  info: "info",
  doIt: "doIt",
});

const ACTIVITY = Object.freeze({
  create: "uuArtifactIfc/activity/create",
});

const dateFunctions = Object.freeze({
  getNextDay: function () {
    return new Date(new Date().valueOf() + 24 * 60 * 60 * 1000).toISOString();
  },
});

//@@viewOff:constants

//@@viewOn:component
function fillUuAppErrorMap(dtoOut, uuAppErrorMap) {
  const {
    data: { uuAppErrorMap: externalMap },
  } = dtoOut;

  if (!externalMap) {
    return uuAppErrorMap;
  }

  delete dtoOut.data.uuAppErrorMap;

  return {
    ...uuAppErrorMap,
    ...externalMap,
  };
}

async function executeRequest(method, uri, dtoIn, options, uuAppErrorMap = {}) {
  let dtoOut = null;

  dtoOut = await AppClient[method](uri, dtoIn, options);

  fillUuAppErrorMap(dtoOut, uuAppErrorMap);

  return dtoOut;
}

function post(uri, dtoIn, options, uuAppErrorMap = {}) {
  return executeRequest("post", uri, dtoIn, options, uuAppErrorMap);
}

class Activity {
  constructor() {
    this.types = TYPES;
    this.activity = ACTIVITY;
  }

  static async create(dtoIn, session, btBaseUri, uri, callOpts = null, uuAppErrorMap = {}) {
    const ucUri = this.getRequestUri(btBaseUri, ACTIVITY.create);
    if (!callOpts) {
      callOpts = await AppClientTokenHelper.createToken(uri, btBaseUri, session);
    }
    const dtoOut = await post(ucUri, dtoIn, callOpts, uuAppErrorMap);

    return dtoOut;
  }

  static getRequestUri(btBaseUri, usecase) {
    return UriBuilder.parse(btBaseUri).setUseCase(usecase).clearParameters().toUri();
  }

  static createLsiContent(lsiObjectName, lsiSectionName) {
    const lsiObject = ActivityLsi[lsiObjectName][lsiSectionName];
    let lsiString = "<uu5string/><UU5.Bricks.Lsi>";
    for (let lsi in lsiObject) {
      lsiString += `<UU5.Bricks.Lsi.Item language="${lsi}">${lsiObject[lsi]} </UU5.Bricks.Lsi.Item>`;
    }
    lsiString += "</UU5.Bricks.Lsi>";
    return lsiString;
  }
}
//@@viewOff:component

//@@viewOn:exports
module.exports = { Activity, TYPES, dateFunctions };
//@@viewOff:exportsGorila123
