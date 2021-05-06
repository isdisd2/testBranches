/* eslint-disable */

const teacherCreateDtoInType = shape({
  personalCardId: id(),
  uuIdentity: uuIdentity().isRequired("personalCardId"),
  room: uu5String(64),
  desc: uu5String(1000)
});

const teacherGetDtoInType = shape({
  id: id(),
  personalCardId: id().isRequired("id")
});

const teacherLoadDtoInType = shape({
  id: id(),
  personalCardId: id().isRequired("id")
});

const teacherUpdateDtoInType = shape({
  id: id(),
  personalCardId: id().isRequired("id"),
  room: uu5String(64),
  address: shape({
    address1:uu5String(128),
    address2:uu5String(128),
    city:uu5String(32),
    zipCode:string(32),
  }),
  desc: uu5String(1000),
  nickname: uu5String(64),
  birthDate: date(),
  contactInfo: shape({
    email: string(/^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/),
    phone: string(1, 30)
  }),
});

const teacherSetStateDtoInType = shape({
  id: id(),
  personalCardId: id().isRequired("id"),
  state: oneOf(["active", "warning", "problem", "passive"]).isRequired(),
  setStateReason: uu5String(5000),
  stateData: shape({ progress: shape({ weight: integer(), current: integer() }) }, true, 10000)
});

const teacherSetFinalStateDtoInType = shape({
  id: id(),
  personalCardId: id().isRequired("id"),
  desc: uu5String(5000),
  stateData: shape({ progress: shape({ weight: integer(), current: integer() }) }, true, 10000)
});

const teacherListDtoInType = shape({
  pageInfo: shape({
    pageIndex: integer(),
    pageSize: integer()
  })
});
