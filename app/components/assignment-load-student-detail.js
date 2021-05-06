"use strict";
// template: uuCommand
// templateVersion: 0.1.0
// documentation:
//@@viewOn:revision
// coded: Branislav Dolny (13-2838-1), 31/03/2021
//@@viewOff:revision

//@@viewOn:imports
//@@viewOff:imports

//@@viewOn:constants
const DEFAULT_PAGE_INFO = {
  pageIndex: 0,
  pageSize: 1000,
};
//@@viewOff:constants

//@@viewOn:component
let StudentDetail = {
  /**
   * verifies object proper state.
   * @param uuObject
   * @param studentDao
   * @returns uuObject
   */
  async loadDetails(uuObject, studentDao) {
    if (uuObject.studentMap) {
      const studentListIdArray = [];
      for (let student in uuObject.studentMap) {
        studentListIdArray.push(uuObject.studentMap[student].id);
      }

      const studentsDetails = await studentDao.listByIds(uuObject.awid, studentListIdArray, DEFAULT_PAGE_INFO);
      if (studentsDetails && studentsDetails.itemList) {
        studentsDetails.itemList.forEach((student) => {
          uuObject.studentMap[student.uuIdentity].studentDetail = student;
        });
      }
    }
    return uuObject;
  },
};

//@@viewOff:component

//@@viewOn:exports
module.exports = StudentDetail;
//@@viewOff:exports
