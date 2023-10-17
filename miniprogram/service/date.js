const dayjs = require("dayjs");

function getDateTime() {
  return dayjs().format("YYYY-MM-DD HH:mm:ss");
}

function getToday() {
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


function diffMinutes(start, end) {
  return dayjs(end).diff(start, "minute");
}

function diffHour(start, end) {
  return dayjs(end).diff(start, "hour");
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


function afterXMinutes(interval) {
  return dayjs().add(interval, 'minute').format('YYYY-MM-DD HH:mm:ss')
}

function format(ts, format) {
  if (format) {
    return dayjs(ts).format(format);
  }
  return dayjs(ts).format('YYYY-MM-DD HH:mm');
}

function formatDiff(start, end, format) {
  // 将毫秒数转换为Day.js的duration对象
  let timeDiff = Math.abs(end - start);
  // 计算小时和分钟
  var hours = Math.floor(timeDiff / (1000 * 60 * 60));
  var minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
  // 格式化小时和分钟为 HH:mm 的形式
  var formattedDiff = dayjs().hour(hours).minute(minutes).format(format);
  return formattedDiff;
}


function formatMillis(milliseconds, format) {
  var totalSeconds = Math.floor(milliseconds / 1000);
  var hours = Math.floor(totalSeconds / 3600);
  var minutes = Math.floor((totalSeconds % 3600) / 60);
  var seconds = totalSeconds % 60;

  if (!format) {
    format = 'HH:mm:ss';
  }
  var formattedTime = dayjs().hour(hours).minute(minutes).second(seconds).format(format);
  return formattedTime;
}


//一个小时前
function oneHourAgo() {
  return dayjs().subtract(10, 'minute').valueOf();
}

//分钟前
function minutesAgo(minutes) {
  return dayjs().subtract(minutes, 'minute').valueOf();
}

module.exports = {
  getDateTime,
  getToday,
  getShortTime,
  getHour,
  getMinute,
  weekDay,
  diffDays,
  addDay,
  getRecentDate,
  dateInMonth,
  afterXMinutes,
  format,
  diffMinutes,
  diffHour,
  formatDiff,
  formatMillis,
  oneHourAgo,
  minutesAgo
}