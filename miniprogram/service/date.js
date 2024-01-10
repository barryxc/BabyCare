const dayjs = require("dayjs");

//当前的日期时间
function currentDateTime() {
  return dayjs().format("YYYY-MM-DD HH:mm:ss");
}

//当前的日期
function currentDate() {
  return dayjs().format("YYYY-MM-DD");
}

//当前的时间
function currentTime() {
  return dayjs().format("HH:mm:ss");
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

//转换当前日期为星期
function weekDay(day, format) {
  return mapWeekOfDay[dayjs(day, format).day()];
}

//获取日期的差值
function diffDays(start, end) {
  return dayjs(end).diff(start, "day");
}

//计算小时的差值
function diffHour(start, end) {
  return dayjs(end).diff(start, "hour");
}

//计算分钟的差值
function diffMinutes(start, end) {
  return dayjs(end).diff(start, "minute");
}

//计算分钟的差值
function diffSeconds(start, end) {
  return dayjs(end).diff(start, "second");
}

//几天后
function daysAfter(diff) {
  return dayjs().add(diff, 'day').format("YYYY-MM-DD");
}

//几分钟后
function afterMinutes(interval) {
  return dayjs().add(interval, 'minute').format('YYYY-MM-DD HH:mm:ss')
}

//一个小时前
function oneHourAgo() {
  return dayjs().subtract(1, 'hour').valueOf();
}

//几分钟前
function minutesAgo(minutes) {
  return dayjs().subtract(minutes, 'minute').valueOf();
}

//获取当前日期在当前月的第几天
function dateInMonth(date) {
  return dayjs(date).date();
}

//获取当前的月份
function monthOfDate(date) {
  return dayjs(date).month() + 1;
}

//uts时间戳格式化
function format(ts, format) {
  if (format) {
    return dayjs(ts).format(format);
  }
  return dayjs(ts).format('YYYY-MM-DD HH:mm');
}

//时间差值格式化
function differFormat(milliseconds, long) {
  let obj = getHourMinuteSecond(milliseconds);
  if (long) {
    return `${padTime(obj.hours)}:${padTime(obj.minutes)}:${padTime(obj.seconds)}`
  }
  return `${padTime(obj.hours)}:${padTime(obj.minutes)}`
}

//格式化为中文
function fomartTimeChinese(milliseconds, long) {
  let obj = getHourMinuteSecond(milliseconds);
  if (long) {
    return `${obj.hours?obj.hours+"小时":''} ${obj.minutes?obj.minutes+"分钟":''} ${obj.seconds?obj.seconds+"秒":''}`;
  }
  return `${obj.hours?obj.hours+"小时":''} ${obj.minutes?obj.minutes+"分钟":''}`;
}

//补零
function padTime(time) {
  if (!time) {
    return "00";
  }
  let timeStr = time.toString().padStart(2, '0');
  return timeStr;
}

//把时间差转为小时分钟秒
function getHourMinuteSecond(milliseconds) {
  var totalSeconds = Math.floor(milliseconds / 1000);
  var hours = Math.floor(totalSeconds / 3600);
  var minutes = Math.floor((totalSeconds % 3600) / 60);
  var seconds = totalSeconds % 60;

  return {
    hours,
    minutes,
    seconds,
  };
}

function parseTime(timeString) {
  // 解析时间字符串
  const parts = timeString.split(':');
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  const seconds = parseInt(parts[2], 10);

  // 将时间转换为毫秒
  const millis = (hours * 60 * 60 * 1000) + (minutes * 60 * 1000) + (seconds * 1000);
  return millis;
}


module.exports = {
  currentDateTime,
  currentDate,
  weekDay,
  diffDays,
  daysAfter,
  dateInMonth,
  afterMinutes,
  format,
  diffMinutes,
  diffHour,
  differFormat,
  fomartTimeChinese,
  oneHourAgo,
  minutesAgo,
  getHourMinuteSecond,
  diffSeconds,
  monthOfDate,
  parseTime
}