/* eslint-disable */
const createAssignmentDtoInType = shape({
  subjectId:id().isRequired(),
  subjectCode: code().isRequired("subjectId"),
  name: uu5String(64).isRequired(),
  desc: uu5String(1000),
  from: datetime().isRequired(),
  deadline: datetime().isRequired(),
  addSubjectStudents: boolean()
});

const loadAssignmentDtoInType = shape({
  id:id().isRequired(),
  code: code().isRequired("id"),
})

/* eslint-disable */
const addTaskDtoInType = shape({
  id: id().isRequired(),
  lessonName: string(),
  type: oneOf(["book","course"]),
  source: uri().isRequired(),
  mandatory: boolean().isRequired(),
  points: number().isRequired(),
  pointsStrategy: oneOf(["Proportionally", "Success only"]).isRequired(),
  store: oneOf(["First", "Last", "Best"]).isRequired()
})
const updateTaskDtoInType = shape({
  id: id().isRequired(),
  lessonName: string(),
  code: code().isRequired(),
  mandatory: boolean(),
  points: number(),
  pointsStrategy: oneOf(["Proportionally", "Success only"]),
  store: oneOf(["First", "Last", "Best"])
})
const getAssignmentDtoInType = shape({
  id:id().isRequired(),
  code: code().isRequired("id"),
})

const listAssignmentDtoInType = shape({
  pageInfo: shape({
    pageIndex: integer(),
    pageSize: integer()
  }),
  filterMap: shape({
    subjectId:id(),
    subjectTeacherId: id(),
    studentId: id()
  })
});

const updateAssignmentDtoInType = shape({
  id: id(),
  code: code().isRequired("id"),
  name: uu5String(64),
  desc: uu5String(1000),
  from: datetime(),
  deadline: datetime(),
})

const setFinalStateDtoInType = shape({
  id: id(),
  code: code().isRequired("id"),
  desc: uu5String(5000),
  stateData: shape({ progress: shape({ weight: integer(), current: integer() }) }, true, 10000)
});

const setStateDtoInType = shape({
  id: id(),
  code: code().isRequired("id"),
  state: oneOf(["prepared", "active", "beingEvaluated", "warning", "problem", "passive"]).isRequired(),
  setStateReason: uu5String(5000),
  stateData: shape({ progress: shape({ weight: integer(), current: integer() }) }, true, 10000)
});

const assignmentAddStudentsDtoInType = shape({
  id: id(),
  code: code().isRequired("id"),
  studentList: array( id() ).isRequired()
});

const assignmnetRemoveStudentDtoInType = shape({
  id: id(),
  code: code().isRequired("id"),
  studentId: id().isRequired()
});

const removeTaskDtoInType = shape({
  id: id().isRequired(),
  code: code().isRequired()
})

