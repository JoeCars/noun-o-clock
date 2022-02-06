require('dotenv').config();
const fs = require('fs');

const { Client, Collection, Intents } = require('discord.js');
const token = process.env.DISCORD_TOKEN;
const client = new Client({intents: [Intents.FLAGS.GUILDS]});
const TimeStuff = require('./helpers/timestuff.js');
const NounsDAO = require('./helpers/nounsdao.js');
const mongoDB = require(`./helpers/mongodb.js`);

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

  await getLatestAuctionData();
  updateAuctionState();
  await shareAuctionData();
  await updateBot();
  logTick();

}



/**
 * Gets the latest Nouns Auction data. If auctionState = 1 this uses doesn't run, 
 * and cached values will be used.
 */
async function getLatestAuctionData() {

  if (auctionState != 1) {

    const data = await NounsDAO.getLatestAuctions();

    if(auctionState == 0 || auctionState == 5) {
      nounID = data.auctions[0].id;
      console.log("setting nounID to " + data.auctions[0].id);
    }

    console.log(JSON.stringify(data));

    curAuctionData = JSON.parse(JSON.stringify(data.auctions));
    curAuctionData[0].endDate = new Date(parseInt(data.auctions[0].endTime) * 1000);
    curAuctionData[1].endDate = new Date(parseInt(data.auctions[1].endTime) * 1000);

  }

}



/**
 * Updates the global auctionState variable.
 */
function updateAuctionState() {

  switch (auctionState) {
    case -1: 

      auctionState = 0; // getting Auction Data
      break;
      
    case 0: 
    
      auctionState = 1; // move to auction state 1 - counting down from 24:00 to 0:05 - data cached
      break;

    case 1:  
    
      const tDiff = TimeStuff.timeDiffCalc(curAuctionData[0].endDate,Date.now());
      if(tDiff.hours < 1 && tDiff.minutes < 5 ) {
        auctionState = 2; // less than 5 minutes left - constant polling
      }
      break;

    case 2: 
    
      if (curAuctionData[0].endDate.getTime() + 5000 < new Date().getTime()) {
        auctionState = 3; // It's Noun O'Clock!
      }
      break;

    case 3: 
    
      auctionState = 4; // Noun O'Clock announced, waiting for settlement
      break;

    case 4: 
    
      console.log("nounID " + nounID + "curAuctionData[0].id " + curAuctionData[0].id);
      if(curAuctionData[0].id != nounID) {

        console.log("NEW MINT - Changing to state 5");
        auctionState = 5; // Noun Minted, sharing to social

      }
      break;

    case 5: 
    
      auctionState = 0; // getting Auction Data

      break;
    }
}


/**
 * Shares the latest auction Data - currently sharing to Discord only.
 */

async function shareAuctionData() {

  let discordMessages = [];

  switch (auctionState) {

    // case 0: discordMessages.push("NOUN o CLOCK bot BOOTING UP");

    //   break;

    case 3:

      discordMessages.push("It's Noun O'Clock! Help choose the next Noun with https://fomonouns.wtf/");
      break;
     
    case 5:

      //if the current Noun ends with 1, the previous one was also released to Nouners. For 5 years.
      if((curAuctionData[0].id % 10 == 1) && (curAuctionData[0].id < 1825)) {

        //discordMessages.push("New Nounder Noun: "+ curAuctionData[1].id);
        console.log("New Nounder Noun: "+ curAuctionData[1].id);

      }

      //discordMessages.push("New Noun: "+ curAuctionData[0].id);
      console.log("New Noun: "+ curAuctionData[0].id);
      break;
    }

    let guilds = await mongoDB.getAllGuilds();
    guilds.forEach(async function(guild) {

      discordMessages.forEach(async function(message) {
        
        console.log("POSTING TO DISCORD: " + message);
        client.channels.cache.get(guild.channel_id).send(message);
  
      })

    })
    

}


/**
 * Updates the bot Activity to display either a countdown, or a Noun O'Clock message
 */

async function updateBot() {

  if(auctionState > 0){

    const count = TimeStuff.formatDateCountdown(curAuctionData[0].endDate);

    if(auctionState == 3 || auctionState == 4) {
  
      client.user.setActivity("🔥 fomonouns.wtf 🔥", { type: "PLAYING" });
  
    } else {
  
      client.user.setActivity(count, { type: "WATCHING" });
  
    }

  }

}



/**
 * Logs key data from each tick to console. For debugging purposes only.
 */
function logTick () {

  const count = TimeStuff.formatDateCountdown(curAuctionData[0].endDate);

  // const settled = (curAuctionData[0].settled) ? "settled" : "not settled";

  console.log(curAuctionData[0].id + " | " + count + " | "+ auctionStateDescriptors[auctionState]);

}




client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
   const command = require(`./commands/${file}`);
   client.commands.set(command.data.name, command);
}



client.on('interactionCreate', async interaction => {
   if (!interaction.isCommand()) return;

   const command = client.commands.get(interaction.commandName);
   
   if (!command) return;

   try {
      await command.execute(interaction);
   } catch (error) {
      console.error(error);
      return interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
   }
});


if(process.env.DISCORD_DEPLOY_COMMANDS == "true") {
  require('./deploy-commands.js');
  console.log("hello");
}