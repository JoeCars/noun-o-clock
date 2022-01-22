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

function logTimeToNounOClock(currentAuction){
    let endTime = new Date(parseInt(currentAuction.endTime) * 1000);
    let curTime = Date.now();
  
    let tDiff = timeDiffCalc(endTime, curTime);
    console.log(JSON.stringify(tDiff));
  }

module.exports.timeDiffCalc = function(dateFuture, dateNow) {
    return timeDiffCalc(dateFuture, dateNow);
}

module.exports.logTimeToNounOClock = function(currentAuction) {
    return logTimeToNounOClock(currentAuction);
}