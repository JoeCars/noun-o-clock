require('dotenv').config();

const { Client } = require('discord.js');
const token = process.env.DISCORD_TOKEN;
const client = new Client({intents: []});
const { request, gql } = require('graphql-request')
const timeStuff = require('./helpers/timestuff.js');

let doonce = true;

let currentAuction = {
   id:0,
   endTime:0,
};


async function updateAuctionData() {
  const endpoint = 'https://api.thegraph.com/subgraphs/name/nounsdao/nouns-subgraph'

  const query = gql`
    {
      auctions(orderBy: startTime, orderDirection: desc, first: 2) {
        id
        endTime
      }
    }
  `

  const data = await request(endpoint, query) 


  if(!doonce && (currentAuction.id != data.auctions[0].id)) {
    
    //await itsNounOClock();

    currentAuction = {
      id : data.auctions[1].id,
      endTime : data.auctions[1].endTime,
    }

  } else {
    doonce = false;

    currentAuction = {
      id : data.auctions[0].id,
      endTime : data.auctions[0].endTime,
    }

  }

}

async function itsNounOClock() {
  // Post something in Discord, include a link to FOMO
  
  //if(currentAuction.id <= 1825 currentAuction.id % 10 == 9) {

    // A Nounder Noun has just been released
    // data.auctions[1].id
    // get picture and post in Discord

  //} else {

  //}
}




// Login to Discord with your client's token
client.login(token);

client.on('ready', async () => {

   console.log("Noun-O-Clock Ready");

   await updateAuctionData().catch((error) => console.error(error));

   updateBotActivity();
   timeStuff.logTimeToNounOClock(currentAuction);

   setInterval(() => {

      timeStuff.logTimeToNounOClock(currentAuction);
      updateBotActivity();

  }, 60000); 

}); 


function updateBotActivity() {

   let endTime = new Date(parseInt(currentAuction.endTime) * 1000);
   let tDiff = timeStuff.timeDiffCalc(endTime, Date.now());


   let hours = tDiff.hours.toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false});
   let minutes = tDiff.minutes.toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false});

   client.user.setActivity(hours + ":" + minutes, { type: "WATCHING" });

}