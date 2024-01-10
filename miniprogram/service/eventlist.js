const events = [{
  type: 'feed',
  event: "喂奶",
  icon: "../../images/breast.svg",
}, {
  event: "换尿布",
  type: "shit",
  icon: "../../images/nbs.svg",
}, {
  event: "辅食",
  type: "food",
  icon: "../../images/food.svg",
}, {
  event: "睡觉觉",
  type: "sleep",
  icon: "../../images/sleep.svg",
}, {
  event: "活动",
  type: "activity",
icon: "../../images/activity.svg",
}, {
  event: '身高体重',
  type: "growth",
  icon: "../../images/growth.svg",
}, {
  event: '其它',
  type: "other",
  icon: "../../images/star.svg",
}];

function getEventList() {
  return events;
}

function isFeedWithBottle(feedType) {
  return (feedType=='breast_feed_with_bottle' ||  feedType=='formula_feed_with_bottle')
}
function isFeed(type) {
  return type=="feed"
}
function isFeedWithBreast(feedType) {
  return (feedType=='breast_feed_by_self')
}

function getEventTitle(type) {
  let index = events.findIndex((e) => type == e.type);
  if (index != -1) {
    return events[index].event;
  }
  return '';
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
  isFeedWithBottle,
  isFeedWithBreast,
  isFeed,
  getEventTitle,
}