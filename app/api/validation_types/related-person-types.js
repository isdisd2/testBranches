/* eslint-disable */

const relatedPersonCreateDtoInType = shape({
  personalCardId: id().isRequired(),
});

const relatedPersonGetDtoInType = shape({
  id: id(),
  personalCardId: id().isRequired("id"),
});

const relatedPersonLoadDtoInType = shape({
  id: id(),
  personalCardId: id().isRequired("id"),
});

const relatedPersonListDtoInType = shape({
  pageInfo: shape({
    pageIndex: integer(),
    pageSize: integer()
  })
});

const relatedPersonSetStateDtoInType = shape({
  id: id(),
  personalCardId: id().isRequired("id"),
  state: oneOf(["active", "warning", "problem", "passive"]).isRequired(),
  setStateReason: uu5String(5000),
  stateData: shape({ progress: shape({ weight: integer(), current: integer() }) }, true, 10000)
});

const relatedPersonSetFinalStateDtoInType = shape({
  id: id(),
  personalCardId: id().isRequired("id"),
  desc: uu5String(5000),
  stateData: shape({ progress: shape({ weight: integer(), current: integer() }) }, true, 10000)
});

const relatedPersonUpdateDtoInType = shape({
  id: id(),
  personalCardId: id().isRequired("id"),
  birthDate: date(),
  address: shape({
    address1: uu5String(128),
    address2: uu5String(128),
    city: uu5String(32),
    zipCode: string(32),
  }),
  contactInfo: shape({
    email: string(/^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/),
    phone: string(10)
  })
});

const relatedPersonUpdateByRelatedPersonDtoInType = shape({
  id: id(),
  personalCardId: id().isRequired("id"),
  birthDate: date(),
  address: shape({
    address1: uu5String(128),
    address2: uu5String(128),
    city: uu5String(32),
    zipCode: string(32),
  }),
  contactInfo: shape({
    email: string(/^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/),
    phone: string(10)
  })
});
