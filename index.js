require('dotenv').config();

const { Client, Intents } = require('discord.js');
const token = process.env.DISCORD_TOKEN;
const client = new Client({intents: [Intents.FLAGS.GUILDS]});
const TimeStuff = require('./helpers/timestuff.js');
const NounsDAO = require('./helpers/nounsdao.js');

let doonce = true;
let waitingForNounOClock = true;
const tAuctionUpdate = 4100;
let currentAuction = {
   id:0,
   settled:false,
   endTime:Date.now()
};


client.login(token);

client.on('ready', async () => {

   console.log("Noun-O-Clock Bot Ready");
   tick();

   setInterval(() => {
     tick();
  }, tAuctionUpdate); 

}); 





async function tick() {
  await updateAuctionData().catch((error) => console.error(error));
  updateBotActivity();
}




async function updateAuctionData() {

  let tDiff = TimeStuff.timeDiffCalc(currentAuction.endTime,Date.now());

  //update auction cache on init, and when there is less than 5 minutes left.
  if(doonce || (tDiff.hours < 1 && tDiff.minutes < 5 )){

    if(tDiff.hours < 1 && tDiff.minutes < 1 && tDiff.seconds < 1){

      if(waitingForNounOClock){
        console.log("Posting Noun-O-Clock Notification to Discord");
        client.channels.cache.get(process.env.DISCORD_CHANNEL_ID).send("It's Noun-O-Clock! Help choose the next Noun with https://fomonouns.wtf/")
        waitingForNounOClock = false;
      }
      console.log("Waiting for Auction Settlement");

    }  

    const data = await NounsDAO.getLatestAuctions();


    let index = 0;
    doonce = false;


    if(currentAuction.id != data.auctions[0].id) {
      waitingForNounOClock = true;
        //if the current Noun ends with 9, the next one released will be Nouner + additional
        if((currentAuction.id % 10 == 9) && (currentAuction.id < 1825)) {
          console.log("New Nounder Noun: "+ data.auctions[1].id);
        }

        console.log("New Noun: "+ data.auctions[0].id);

    }

    currentAuction = {
      id : data.auctions[0].id,
      settled : data.auctions[0].settled,
      endTime : new Date(parseInt(data.auctions[0].endTime) * 1000)
    }  

    logTick();

  }
}


function logTick () {
  const dateNow = new Date()
  const tDiff = TimeStuff.timeDiffCalc(currentAuction.endTime, Date.now());

  const hours = tDiff.hours.toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false});
  const minutes = tDiff.minutes.toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false});
  const seconds = tDiff.seconds.toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false});
  const settled = (currentAuction.settled) ? "settled" : "not settled";

  
  console.log(TimeStuff.formatDate(dateNow) + " - " +currentAuction.id +" - " + settled + " - " + hours + ":" + minutes + ":" + seconds);

}


async function updateBotActivity() {

   let tDiff = TimeStuff.timeDiffCalc(currentAuction.endTime, Date.now());


   let hours = tDiff.hours.toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false});
   let minutes = tDiff.minutes.toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false});
   let seconds = tDiff.seconds.toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false});

   client.user.setActivity(hours + ":" + minutes + ":" + seconds, { type: "WATCHING" });

}