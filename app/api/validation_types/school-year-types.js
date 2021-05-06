/* eslint-disable */

const schoolYearCreateDtoInType = shape({
  code: code(),
  name: uu5String(64).isRequired(),
  desc: uu5String(1000),
  startDate: date().isRequired(),
  endDate: date().isRequired(),
  previousSchoolYearId: id()
});

const schoolYearGetDtoInType = shape({
  id: id(),
  code: code().isRequired("id")
});

const schoolYearLoadDtoInType = shape({
  id: id(),
  code: code().isRequired("id")
});

const schoolYearListDtoInType = shape({
  pageInfo: shape({
    pageIndex: integer(),
    pageSize: integer()
  })
});

const schoolYearUpdateDtoInType = shape({
  id: id(),
  code: code().isRequired("id"),
  name: uu5String(64).isRequired(),
  desc: uu5String(1000),
  startDate: date(),
  endDate: date()
});

const schoolYearSetStateDtoInType = shape({
  id: id(),
  code: code().isRequired("id"),
  state: oneOf(["active", "warning", "problem", "passive"]).isRequired(),
  setStateReason: uu5String(5000),
  stateData: shape({ progress: shape({ weight: integer(), current: integer() }) }, true, 10000)
});

const schoolYearSetFinalStateDtoInType = shape({
  id: id(),
  code: code().isRequired("id"),
  desc: uu5String(5000),
  stateData: shape({ progress: shape({ weight: integer(), current: integer() }) }, true, 10000)
});

const schoolYearDeleteDtoInType = shape({
  id: id(),
  code: code().isRequired("id"),
});
