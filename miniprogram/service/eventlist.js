const events = [{
  type: 1,
  event: "母乳",
  icon: "../../images/breast.svg",
}, {
  event: "便便",
  type: 2,
  icon: "../../images/shit.svg",
}, {
  event: "尿布",
  type: 3,
  icon: "../../images/nbs.svg",
}, {
  event: "喂养",
  type: 4,
  icon: "../../images/formula.svg",
}, {
  event: "睡觉",
  type: 5,
  icon: "../../images/sleep.svg",
}, {
  event: "活动",
  type: 6,
  icon: "../../images/wake.svg",
}, {
  event: "疫苗",
  type: 7,
  icon: "../../images/ym.svg",
}, {
  event: "发烧",
  type: 8,
  icon: "../../images/cold.svg",
}, {
  event: "身高",
  type: 9,
  icon: "../../images/height.svg",
}, {
  event: "体重",
  type: 10,
  icon: "../../images/weight.svg",
}, {
  event: '日记',
  type: 11,
  icon: "../../images/note.svg",
}];

function getEventList() {
  return events;
}

function getIcon(type) {
  let icon;
  events.forEach((e) => {
    if (e.type == type) {
      icon = e.icon;
    }
  });
  return icon;
}

module.exports = {
  getEventList,
  getIcon,
}