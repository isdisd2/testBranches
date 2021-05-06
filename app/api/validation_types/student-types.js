/* eslint-disable */
const studentCreateDtoInType = shape({
  personalCardId: id().isRequired(),
  address: shape({
    address1: uu5String(128),
    address2: uu5String(128),
    city: uu5String(32),
    zipCode: string(32),
  }),
  contactInfo: shape({
    email: string(/^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/),
    phone: string(1, 32)
  }),
  relatedPersonList: array(
    shape({
      personalCardId: id().isRequired(),
      relationType: string(255),
      isLegalGuardian: boolean().isRequired()
    }),
  ).isRequired()
});


const studentLoadDtoInType = shape({
  id: id(),
  personalCardId: id().isRequired("id"),
});

const studentUpdateDtoInType = shape({
  id: id(),
  personalCardId: id().isRequired("id"),
  personalIdNumber: string(32),
  nickname: uu5String(255),
  evaluation: uu5String(1000),
  address: shape({
    address1: uu5String(128),
    address2: uu5String(128),
    city: uu5String(32),
    zipCode: string(32),
  }),
  contactInfo: shape({
    email: string(/^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/),
    phone: string(1, 32)
  })
});

const studentUpdateByRelatedPersonDtoInType = shape({
  id: id(),
  personalCardId: id().isRequired("id"),
  nickname: uu5String(255),
  personalIdNumber: string(32),
  healthConditions: uu5String(1000),
  address: shape({
    address1: uu5String(128),
    address2: uu5String(128),
    city: uu5String(32),
    zipCode: string(32)
  }),
  contactInfo: shape({
    email: string(/^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/),
    phone: string(1, 32)
  })
});

const studentSetEvaluationDtoInType = shape({
  id: id(),
  personalCardId: id().isRequired("id"),
  evaluation: uu5String(1000).isRequired()
});

const studentSetNicknameDtoInType = shape({
  id: id(),
  personalCardId: id().isRequired("id"),
  nickname: uu5String(32).isRequired()
});

const studentGetDtoInType = shape({
  id: id(),
  personalCardId: id().isRequired("id"),
});

const studentSetStateDtoInType = shape({
  id: id(),
  personalCardId: id().isRequired("id"),
  state: oneOf(["prepared", "active", "warning", "problem", "passive"]).isRequired(),
  setStateReason: uu5String(5000),
  stateData: shape({ progress: shape({ weight: integer(), current: integer() }) }, true, 10000)
});

const studentSetFinalStateDtoInType = shape({
  id: id(),
  personalCardId: id().isRequired("id"),
  desc: uu5String(5000),
  stateData: shape({ progress: shape({ weight: integer(), current: integer() }) }, true, 10000)
});

const studentListDtoInType = shape({
  pageInfo: shape({
    pageIndex: integer(),
    pageSize: integer()
  }),
  filterMap: shape({
    classId: id(),
    subjectId: id()
  })
});

const studentAddRelatedPersonsDtoInType = shape({
  id: id(),
  personalCardId: id().isRequired("id"),
  relatedPersonList: array(
    shape({
      personalCardId: id().isRequired(),
      note: uu5String(1000),
      relationType: uu5String(255).isRequired(),
      isLegalGuardian: boolean().isRequired()
    }),
  ).isRequired()
});

const studentListByRelatedPersonDtoInType = shape({
  relatedPersonId: id().isRequired(),
  pageInfo: shape({
    pageIndex: integer(),
    pageSize: integer()
  })
});

const studentRemoveRelatedPersonDtoInType = shape({
  id: id(),
  personalCardId: id().isRequired("id"),
  relatedPersonId: id().isRequired()
});

const studentUpdateNoteDtoInType = shape({
  id: id(),
  relatedPersonId: id().isRequired(),
  note: uu5String(1000)
});

const studentUpdateRelationTypeDtoInType = shape({
  id: id(),
  relatedPersonId: id().isRequired(),
  relationType: uu5String(255)
});

const studentSetRelatedPersonDtoInType = shape({
  id: id(),
  personalCardId: id().isRequired("id"),
  relatedPerson: shape({
      personalCardId: id().isRequired(),
      isLegalGuardian: boolean().isRequired()
    }).isRequired()
});



