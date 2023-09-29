const dayjs = require("dayjs");

function getDateTime() {
  return dayjs().format("YYYY-MM-DD HH:mm:ss");
}

function getDay() {
  return dayjs().format("YYYY-MM-DD");
}

function getTime() {
  return dayjs().format("HH:mm:ss");
}

function getShortTime() {
  return dayjs().format("HH:mm");
}

function getHour(time){
  return dayjs(time).format('HH');
}
function getMinute(time){
  return dayjs(time).format('mm');
}

function weekDay(day,format) {
  return dayjs(day,format).day();
}

function diffDays(date){
  return dayjs().diff(date,"day");
}

function addDay(date,diff){
  return dayjs(date).add(diff,'day').format("YYYY-MM-DD");
}

module.exports = {
  getDate: getDateTime,
  getDay,
  getShortTime,
  getHour,
  getMinute,
  weekDay,
  diffDays,
  addDay,
}