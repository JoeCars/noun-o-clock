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

  
module.exports.timeDiffCalc = function(dateFuture, dateNow) {
    return timeDiffCalc(dateFuture, dateNow);
}

module.exports.formatDate = function(date) {
    return formatDate(date);
}