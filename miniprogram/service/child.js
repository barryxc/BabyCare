const {
  callServer
} = require("./server");


async function removeChild(childId) {
  return callServer({
    type: "deleteChild",
    childId,
  });
}

async function addChild(child) {
  return callServer({
    type: "addChild",
    child: child
  })
}

async function modifyChildInfo(child) {
  return callServer({
    type: "modifyChildInfo",
    childId: child.childId,
    child
  })
}

module.exports = {
  removeChild,
  addChild,
  modifyChildInfo,
}