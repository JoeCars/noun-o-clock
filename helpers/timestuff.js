function timeDiffCalc(dateFuture, dateNow) {
    let diff = Math.abs(dateFuture - dateNow) / 1000;
 
    //calc and subtract days
    const days = Math.floor(diff / 86400);
    diff -= days * 86400;
    
    //calc and subtract hours
    const hours = Math.floor(diff / 3600) % 24;
    diff -= hours * 3600;
 
    //calc and subtract minutes
    const minutes = Math.floor(diff / 60) % 60;
    diff -= minutes * 60;
 
    //calc seconds
    const seconds = Math.floor(diff);
 
    return {"days":days, "hours":hours, "minutes":minutes, "seconds":seconds};
}


function formatDate(date){
    var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString("en-US", options);
}


function formatDateCountdown (date) {

    const tDiff = timeDiffCalc(date, Date.now());

    const hours = tDiff.hours.toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false});
    const minutes = tDiff.minutes.toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false});
    const seconds = tDiff.seconds.toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false});
    
    return hours + ":" + minutes + ":" + seconds;
}
  
module.exports.timeDiffCalc = function(dateFuture, dateNow) {
    return timeDiffCalc(dateFuture, dateNow);
}

module.exports.formatDate = function(date) {
    return formatDate(date);
}

module.exports.formatDateCountdown = function(date) {
    return formatDateCountdown(date);
}