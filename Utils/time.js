module.exports.toHHMMSS = (secs) => {
    var sec_num = parseInt(secs, 10)
    var hours   = Math.floor(sec_num / 3600)
    var minutes = Math.floor(sec_num / 60) % 60
    var seconds = sec_num % 60

    return [hours,minutes,seconds]
        .map(v => v < 10 ? "0" + v : v)
        .filter((v,i) => v !== "00" || i > 0)
        .join(":")
}
module.exports.getDayDiff = (timestamp0, timestamp1) => {
    return Math.round(require('../Utils/time.js').getDurationDiff(timestamp0, timestamp1));
}
 module.exports.getDurationDiff = (timestamp0, timestamp1) => {
    return Math.abs(timestamp0 - timestamp1) / (1000 * 60 * 60 * 24);
}
