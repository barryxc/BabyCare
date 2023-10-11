const events = [{
  type: 'feed',
  event: "母乳/奶粉",
  icon: "../../images/formula.svg",
}, {
  event: "便便/尿布",
  type: "shit",
  icon: "../../images/nbs.svg",
}, {
  event: "睡觉觉",
  type: "sleep",
  icon: "../../images/sleep.svg",
}, {
  event: "活动",
  type: "activity",
  icon: "../../images/activity.svg",
}, {
  event: "疫苗",
  type: "vac",
  icon: "../../images/ym.svg",
}, {
  event: "感冒/发烧",
  type: "cold",
  icon: "../../images/cold.svg",
}, {
  event: "记录身高",
  type: "height",
  icon: "../../images/height.svg",
}, {
  event: "记录体重",
  type: "weight",
  icon: "../../images/weight.svg",
}, {
  event: '成长日记',
  type: "diary",
  icon: "../../images/note.svg",
}];

function getEventList() {
  return events;
}

function isFeed(type) {
  return type == 'feed'
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
  isFeed,
}