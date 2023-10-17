const {
  callServer
} = require("./server");

async function updateRecord(childId, record) {
  return callServer({
    type: 'updateRecord',
    childId,
    record,
  });
}

async function queryRecord(date, childId) {
  return callServer({
    type: 'selectRecord',
    date,
    childId,
  });
}

async function insertRecord(childId, record) {
  return callServer({
    record,
    childId,
    type: 'insertOrReplaceRecord'
  });
}

function deteleRecord(childId, recordId) {
  return callServer({
    childId,
    recordId,
    type: 'deleteRecord'
  })
}

module.exports = {
  updateRecord,
  queryRecord,
  insertRecord,
  deteleRecord,
}