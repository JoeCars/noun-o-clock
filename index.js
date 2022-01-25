require('dotenv').config();

const { Client, Intents } = require('discord.js');
const token = process.env.DISCORD_TOKEN;
const client = new Client({intents: [Intents.FLAGS.GUILDS]});
const TimeStuff = require('./helpers/timestuff.js');
const NounsDAO = require('./helpers/nounsdao.js');

const auctionStateDescriptors = [
  `0 - Get Auction Data`,
  `1 - Counting Down`,
  `2 - < 5 min left`,
  `3 - Noun O'Clock!`,
  `4 - Waiting for Settlement`,
  `5 - New Noun Minted!`,
];

const tickInterval = 4100;
let curAuctionData = [];
let auctionState = -1;
let nounID = -1;



client.login(token);

client.on('ready', async () => {

   console.log("Noun-O-Clock Bot Ready");
   tick();

   setInterval(() => {
     tick();
  }, tickInterval); 

}); 

async function tick() {
  updateAuctionState();
  await updateAuctionData();
  await shareAuctionData();
  await updateBot();
  logTick();
}


function updateAuctionState() {

  switch (auctionState) {
    case -1: 

      // initializing
      auctionState++;
      break;
      
    case 0: 
    
      // getting Auction Data
      auctionState++;
      break;

    case 1:  
    
      // counting down from 24:00 to 0:05 - data cached
      const tDiff = TimeStuff.timeDiffCalc(curAuctionData[0].endDate,Date.now());
      if(tDiff.hours < 1 && tDiff.minutes < 5 ) {
        auctionState++;
      }
      break;

    case 2: 
    
      // less than 5 minutes left - constant polling
      if (endDate.getTime() < new Date().getTime()) {
        auctionState++;
      }
      break;

    case 3: 
    
      // It's Noun O'Clock! Run once.
      auctionState++;
      break;

    case 4: 
    
      // Waiting for Auction to settle
      if(curAuctionData[0].id != nounID) {
        auctionState++;
      }
      break;

    case 5: 
    
      // Noun minted, sharing to social! Run once
      auctionState = 0;

      break;
    }
}




async function updateAuctionData() {

  if (auctionState != 1) {

    const data = await NounsDAO.getLatestAuctions();

    curAuctionData = JSON.parse(JSON.stringify(data.auctions));
    curAuctionData[0].endDate = new Date(parseInt(data.auctions[0].endTime) * 1000);
    curAuctionData[1].endDate = new Date(parseInt(data.auctions[1].endTime) * 1000);

  }

}



async function shareAuctionData() {

  let discordMessage = null;

  switch (auctionState) {

    case 3:

      let message3 = "It's Noun O'Clock! Help choose the next Noun with https://fomonouns.wtf/";
      console.log("POSTING TO DISCORD: " + message3);
      client.channels.cache.get(process.env.DISCORD_CHANNEL_ID).send(message3);
      break;
     
    case 5:

      //if the current Noun ends with 1, the previous one was also released to Nouners. For 5 years.
      
      if((currentAuction[0].id % 10 == 1) && (currentAuction[0].id < 1825)) {

        let message5Nounder = "New Nounder Noun: "+ currentAuction[1].id;
        console.log("POSTING TO DISCORD: " + message5Nounder);
        client.channels.cache.get(process.env.DISCORD_CHANNEL_ID).send(message5Nounder);

      }

      let message5 = "New Noun: "+ currentAuction[0].id;
      console.log("POSTING TO DISCORD: " + message5);
      client.channels.cache.get(process.env.DISCORD_CHANNEL_ID).send(message5);
      break;
    }

}


async function updateBot() {

  if(auctionState > 0){

    const count = TimeStuff.formatDateCountdown(curAuctionData[0].endDate);

    if(auctionState == 3 || auctionState == 4) {
  
      client.user.setActivity("🔥fomonouns.wtf 🔥", { type: "PLAYING" });
  
    } else {
  
      client.user.setActivity(count, { type: "WATCHING" });
  
    }

  }

}

function logTick () {

  const count = TimeStuff.formatDateCountdown(curAuctionData[0].endDate);

  const settled = (curAuctionData[0].settled) ? "settled" : "not settled";

  console.log(curAuctionData[0].id + " | " + count + " - " + settled + " | "+ auctionStateDescriptors[auctionState]);

}
