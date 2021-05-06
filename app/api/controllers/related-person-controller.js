"use strict";
const RelatedPersonAbl = require("../../abl/related-person-abl.js");

class RelatedPersonController {
  create(ucEnv) {
    return RelatedPersonAbl.create(ucEnv.getUri(), ucEnv.getDtoIn(), ucEnv.getSession());
  }

  get(ucEnv) {
    return RelatedPersonAbl.get(ucEnv.getUri(), ucEnv.getDtoIn());
  }

  load(ucEnv) {
    return RelatedPersonAbl.load(
      ucEnv.getUri(),
      ucEnv.getDtoIn(),
      ucEnv.getSession(),
      ucEnv.getAuthorizationResult().getIdentityProfiles()
    );
  }

  list(ucEnv) {
    return RelatedPersonAbl.list(ucEnv.getUri(), ucEnv.getDtoIn(), ucEnv.getSession());
  }

  update(ucEnv) {
    return RelatedPersonAbl.update(ucEnv.getUri(), ucEnv.getDtoIn(), ucEnv.getSession());
  }

  updateByRelatedPerson(ucEnv) {
    return RelatedPersonAbl.updateByRelatedPerson(ucEnv.getUri(), ucEnv.getDtoIn(), ucEnv.getSession());
  }

  setState(ucEnv) {
    return RelatedPersonAbl.setState(ucEnv.getUri(), ucEnv.getDtoIn(), ucEnv.getSession());
  }

  setFinalState(ucEnv) {
    return RelatedPersonAbl.setFinalState(ucEnv.getUri(), ucEnv.getDtoIn(), ucEnv.getSession());
  }
}

module.exports = new RelatedPersonController();
