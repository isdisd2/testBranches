/* eslint-disable */

const schoolKitInitDtoInType = shape({
  name: uu5String(64).isRequired(),
  code: code(),
  desc: uu5String(1000).isRequired(),
  locationUri: uri().isRequired(),
  consoleUri: uri().isRequired(),
  consoleCode: code().isRequired(),
  principal: string().isRequired(),
  scriptEngineUri: uri().isRequired(),
  bemBaseUri: uri().isRequired(),
  permissionMatrix: array(
    oneOf([
      string(/^[0+1]{32}$/),
      string(/^[0+1]{8}\-[0+1]{8}\-[0+1]{8}\-[0+1]{8}$/),
      integer()
    ]),1,32),
  appMap: array(shape({
    type: string(),
    uri: string()
  }))
});

const schoolKitUpdateDtoInType = shape({
  name: uu5String(64).isRequired(),
  desc: uu5String(1000),
  address: shape({
    address1: uu5String(128),
    address2: uu5String(128),
    city: uu5String(64),
    zipCode: string(32)
  }),
  principal: string(),
  establishedBy: string(64),
  btSchoolYearId: id(),
  btTeachersId: id(),
  btStudentsId: id(),
  consoleUri: uri(),
  consoleCode: code(),
  scriptEngineUri: uri(),
  btRelatedPersonId: id(),
  bemBaseUri: uri(),
  appMap: array(shape({
    type: string(),
    uri: string()
  }))
});

const uuSchoolKitSetStateDtoInType = shape({
  state: oneOf(["active", "passive", "warning", "problem"]).isRequired(),
  setStateReason: uu5String(5000),
  stateData: shape({ progress: shape({ weight: integer(), current: integer() }) }, true, 10000)
});
