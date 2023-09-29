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

async function queryRecord(day, childId) {
  return callServer({
    type: 'selectRecord',
    day,
    childId,
  });
}

async function insertRecord(childId, record) {
  return callServer({
    record,
    childId,
    type: 'insertRecord'
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