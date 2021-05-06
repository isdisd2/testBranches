"use strict";
// template: uuCommand
// templateVersion: 0.1.0
// documentation:
//@@viewOn:revision
// coded: Branislav Dolny (13-2838-1), 12/2/2021
//@@viewOff:revision

//@@viewOn:imports
const InstanceChecker = require("../components/instance-checker");
const { Config } = require("uu_appg01_server").Utils;
//@@viewOff:imports

//@@viewOn:constants
const Errors = require("../api/errors/sub-app-helper-error.js");
const AcceptedTrustedSubAppsProfiles = ["Authorities", "Executives", "StandardUsers", "Auditors"];
//@@viewOff:constants

//@@viewOn:component
const TrustedSubAppAuthorization = {
  checkTrustedProfile(userProfiles) {
    let isAuthorized = false;
    let isThere = userProfiles.find((profile) => AcceptedTrustedSubAppsProfiles.includes(profile));
    if (isThere !== undefined) isAuthorized = true;
    return isAuthorized;
  },

  async checkSubApp(uri, session, profileList, uuAppErrorMap = {}) {
    // HDS 1
    // 1.1, 1.1.A
    if (this.checkTrustedProfile(profileList)) {
      // 1.1.A.1
      return { authorized: true, uuAppErrorMap };
    }

    // 2
    const appProductName = session.getClientIdentity().getProduct();
    if (!appProductName) {
      // 2.1
      throw new Errors.TrustedSubAppAuthorization.UserIsNotAuthorized({ cause: "missing appKey" });
    }

    // HDS 3
    const awid = uri.getAwid();
    // 3.1,
    let trustedSubAppList = [];
    // 3.1.1

    const uuSchoolKit = await InstanceChecker.ensureInstance(
      awid,
      Errors.TrustedSubAppAuthorization.UuSchoolKitIsNotInCorrectState,
      uuAppErrorMap
    );

    // 3.1.2
    if (!uuSchoolKit.trustedSubAppList) {
      // 3.1.2.1
      const trustedSubAppFromDeploymentConfig = Config.get("trustedSubApp");
      if (!trustedSubAppFromDeploymentConfig) {
        // 3.1.2.1.1
        throw new Errors.TrustedSubAppAuthorization.AppHasNotSetTrustedSubApps({ uuAppErrorMap });
      }
      trustedSubAppList = trustedSubAppFromDeploymentConfig;
    } else {
      trustedSubAppList = uuSchoolKit.trustedSubAppList;
    }

    // HDS 4

    if (!trustedSubAppList.includes(appProductName)) {
      // 4.1
      throw new Errors.TrustedSubAppAuthorization.UserIsNotAuthorized({ cause: "untrustworthy application" });
    }

    return {
      authorized: true,
      uuAppErrorMap,
    };
  },
};
//@@viewOff:component

//@@viewOn:exports
module.exports = TrustedSubAppAuthorization;
//@@viewOff:exports
