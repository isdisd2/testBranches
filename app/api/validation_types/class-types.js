/* eslint-disable */

const classCreateDtoInType = shape({
  code: code().isRequired(),
  name: uu5String(64).isRequired(),
  desc: uu5String(1000),
  schoolYearId: id().isRequired(),
  grade: number().isRequired(),
  classTeacherId: string(),
  previousYearClassMap: shape({}, (mongoId(), true))
});

const classUpdateDtoInType = shape({
  id: id(),
  code: code().isRequired("id"),
  name: uu5String(64).isRequired(),
  desc: uu5String(1000),
  place: uu5String(128),
  grade: number().isRequired(),
  previousYearClassMap: shape({}, (mongoId(), true))
});

const classUpdateByClassTeacherDtoInType = shape({
  id: id(),
  code: code().isRequired("id"),
  name: uu5String(64),
  place: uu5String(128),
  previousYearClassMap: shape({}, (mongoId(), true))
});

const classAddStudentsDtoInType = shape({
  id: id(),
  code: code().isRequired("id"),
  studentList: array(
    shape({
      id: id().isRequired(),
      number: number().isRequired()
    })
  ).isRequired()
});

const classRemoveStudentDtoInType = shape({
  id: id(),
  code: code().isRequired("id"),
  studentId: id().isRequired()
});

const classListBySchoolYearDtoInType = shape({
  schoolYearId: mongoId().isRequired(),
  pageInfo: shape({
    pageIndex: integer(),
    pageSize: integer()
  })
});

const classListByTeacherDtoInType = shape({
  teacherId: id().isRequired(),
  pageInfo: shape({
    pageIndex: integer(),
    pageSize: integer()
  })
});

const classGetDtoInType = shape({
  id: id(),
  code: code().isRequired("id")
});

const classLoadDtoInType = shape({
  id: id(),
  code: code().isRequired("id")
});

const classDeleteDtoInType = shape({
  id: id(),
  code: code().isRequired("id")
});

const classSetStateDtoInType = shape({
  id: id(),
  code: code().isRequired("id"),
  state: oneOf(["active", "passive", "prepared", "warning", "problem"]).isRequired(),
  setStateReason: uu5String(5000),
  stateData: shape({ progress: shape({ weight: integer(), current: integer() }) }, true, 10000)
});

const classSetFinalStateDtoInType = shape({
  id: id(),
  code: code().isRequired("id"),
  setStateReason: uu5String(5000),
  stateData: shape({ progress: shape({ weight: integer(), current: integer() }) }, true, 10000)
});

const classListByStudentDtoInType = shape({
  studentId: mongoId().isRequired(),
  pageInfo: shape({
    pageIndex: integer(),
    pageSize: integer()
  })
});

const classUpdateNumberInClassDtoInType = shape({
  id: id(),
  code: code().isRequired("id"),
  studentId: id().isRequired(),
  number: number().isRequired()
})
