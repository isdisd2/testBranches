/* eslint-disable */

const subjectCreateDtoInType = shape({
  code: code().isRequired(),
  name: uu5String(64).isRequired(),
  desc: uu5String(1000),
  classId: id().isRequired(),
  subjectTeacherId: string(),
});

const subjectLoadDtoInType = shape({
  id: id(),
  code: code().isRequired("id")
});

const subjectGetDtoInType = shape({
  id: id(),
  code: code().isRequired("id")
});

const subjectListByTeacherDtoInType = shape({
  teacherId: id().isRequired(),
  pageInfo: shape({
    pageIndex: integer(),
    pageSize: integer()
  })
});

const subjectListByClassDtoInType = shape({
  classId: mongoId().isRequired(),
  pageInfo: shape({
    pageIndex: integer(),
    pageSize: integer()
  })
});

const subjectUpdateDtoInType = shape({
  id: id(),
  code: code().isRequired("id"),
  name: uu5String(64),
  desc: uu5String(1000),
  appMap: array(shape({
    type: string(),
    uri: string()
  }))
});

const subjectUpdateBySubjectTeacherDtoInType = shape({
  id: id(),
  code: code().isRequired("id"),
  name: uu5String(64),
  desc: uu5String(1000)
});

const subjectAddStudentsDtoInType = shape({
  id: id(),
  code: code().isRequired("id"),
  studentList: array( id() ).isRequired()
});


const subjectRemoveStudentDtoInType = shape({
  id: id(),
  code: code().isRequired("id"),
  studentId: id().isRequired()
});

const subjectSetStateDtoInType = shape({
  id: id(),
  code: code().isRequired("id"),
  state: oneOf(["active", "prepared", "warning", "problem", "passive"]).isRequired(),
  setStateReason: uu5String(5000),
  stateData: shape({ progress: shape({ weight: integer(), current: integer() }) }, true, 10000)
});

const subjectSetFinalStateDtoInType = shape({
  id: id(),
  code: code().isRequired("id"),
  desc: uu5String(5000),
  stateData: shape({ progress: shape({ weight: integer(), current: integer() }) }, true, 10000)
});

const subjectDeleteDtoInType = shape({
  id: id(),
  code: code().isRequired("id")
});

const subjectListByStudentDtoInType = shape({
  studentId: mongoId().isRequired(),
  pageInfo: shape({
    pageIndex: integer(),
    pageSize: integer()
  })
});

const subjectAddStudentCourseDtoInType = shape({
  id: id(),
  code: code().isRequired("id"),
  appUri: uri().isRequired(),
  studentList: array(shape({
    id: id().isRequired(),
    studentCourseId: id().isRequired(),
  }), 1, null).isRequired()
});

const subjectAddCourseDtoInType = shape({
  id: id(),
  code: code().isRequired("id"),
  appUri: uri().isRequired(),
});

const subjectRemoveCourseDtoInType = shape({
  id: id(),
  code: code().isRequired("id"),
  appUri: uri().isRequired()
})


const subjectRemoveStudentCourseDtoInType = shape({
  id: id(),
  appUri: uri().isRequired(),
  code: code().isRequired("id"),
  studentList: array(shape({
    id: id().isRequired(),
  }), 1, null).isRequired()
});
