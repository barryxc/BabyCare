const dayjs = require("dayjs");

function getDateTime() {
  return dayjs().format("YYYY-MM-DD HH:mm:ss");
}

function getDate() {
  return dayjs().format("YYYY-MM-DD");
}

function getTime() {
  return dayjs().format("HH:mm:ss");
}

function getShortTime() {
  return dayjs().format("HH:mm");
}

function getHour(time) {
  return dayjs(time).format('HH');
}

function getMinute(time) {
  return dayjs(time).format('mm');
}

const mapWeekOfDay = {
  0: '日',
  1: '一',
  2: '二',
  3: '三',
  4: '四',
  5: '五',
  6: '六',
}

function weekDay(day, format) {
  return mapWeekOfDay[dayjs(day, format).day()];
}

function diffDays(date) {
  return dayjs().diff(date, "day");
}

function addDay(date, diff) {
  return dayjs(date).add(diff, 'day').format("YYYY-MM-DD");
}

function getRecentDate(diff) {
  return dayjs().add(diff, 'day').format("YYYY-MM-DD");
}

function dateInMonth(date) {
  return dayjs(date).date();
}


function afterXMinutes(interval){
  return dayjs().add(interval,'minute').format('YYYY-MM-DD HH:mm:ss')
}

module.exports = {
  getDateTime,
  getDate,
  getShortTime,
  getHour,
  getMinute,
  weekDay,
  diffDays,
  addDay,
  getRecentDate,
  dateInMonth,
  afterXMinutes
}