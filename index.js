const _nerman = import('nerman');
require('dotenv').config();
const fs = require('fs');

const { Client, Collection, Intents, MessageEmbed } = require('discord.js');
const token = process.env.DISCORD_TOKEN;
const client = new Client({intents: [Intents.FLAGS.GUILDS]});
const TimeStuff = require('./helpers/timestuff.js');
const mongoDB = require(`./helpers/mongodb.js`);

let Nouns = null;
let fomo = false;
const interval = 4100;

client.login(token);

client.on('ready', async () => {

  console.log("Noun-O-Clock Bot Ready");

  const nerman = await _nerman;
  Nouns = new nerman.Nouns(process.env.JSON_RPC_API_URL);

  Nouns.on("AuctionCreated", async (auction) => {
    fomo = false;

    console.log("AuctionCreated " + auction.id + " " + auction.startTime + " " + auction.endTime);
    
  });

  Nouns.on("AuctionBid", (data) => {

    console.log("AuctionBid " + data.id + " " + data.bidder.id + " " + data.amount + " " + data.extended);
    
  });

  Nouns.on("AuctionSettled", (data) => {

    console.log("AuctionSettled | id:" + data.id + ", winnerId:" + data.winner.id + ", amount: " + data.amount);
    
  });

  Nouns.on("AuctionEnd", async (data) =>{ // CHANGE EVENT TO AUCTION END

    fomo = true;
    console.log("Auction End - waiting for settlement");
    
  });


   updateBot();

   setInterval(() => {
     updateBot();
  }, interval); 
  
}); 


/**
 * Updates the bot Activity to display either a countdown, or a Noun O'Clock message
 */

async function updateBot() {
    if(Nouns.cache.auction) {

      const endDate = new Date(Nouns.cache.auction.endTime * 1000);

      const count = TimeStuff.formatDateCountdown(endDate);

      if(fomo) {
        client.user.setActivity("🔥 fomonouns.wtf 🔥", { type: "PLAYING" });
    
      } else {
    
        client.user.setActivity(count, { type: "WATCHING" });
    
      }

      console.log("Auction " + Nouns.cache.auction.nounId + ": end: " + count + " fomo: " + fomo);
    }

}

async function sendMessageToAllDiscords(message) {

  const guilds = await mongoDB.getAllGuilds();
  
  guilds.forEach(async function(guild) {

    client.channels.cache.get(guild.channel_id).send(message);

  })
}

async function sendNOCMessageToAllDiscords() {

  // Is latest bid the winner? Do I need to check timestamp / block? I don't think so...
  // Could implement latestSold nounId
  let nounId = Nouns.cache.auction.nounId;
  let bid = await Nouns.NounsAuctionHouse.getLatestBidData(nounId);
  const now = new Date();
  const endTimeHours = (Nouns.cache.auction.endTime * 1000 - now.getTime())/(60*60*1000);

  if( endTimeHours > 0.3 ){
    nounId = (nounId % 10 == 1) ? nounId - 2 : nounId - 1;
    bid = await Nouns.NounsAuctionHouse.getLatestBidData(nounId);
  }

  const saleAmount = bid.amount;
  const saleWallet = bid.address;
  const saleWalletTitle = (bid.ens != null) ? bid.ens :  (bid.address.slice(0, 4)+"..."+bid.address.slice(-4));
  const nounLink = "https://nouns.wtf/noun/"+nounId;
  const nounImage = "https://noun.pics/"+nounId+".png";
  const saleWalletLink = "https://etherscan.io/address/"+saleWallet;
  const bidLink = "https://etherscan.io/block/"+bid.block;
  
  

  //   bid : { id, block, date, amount, address, ens: string }

  const name = (bid.ens != null) ? bid.ens :  bid.address;
    console.log("Noun " + bid.id + " sold for " + bid.amount + " ETH to " + name + " on " + bid.date.toLocaleString() )

  const guilds = await mongoDB.getAllGuilds();
  
  guilds.forEach(async function(guild) {

    const channel = client.channels.cache.get(guild.channel_id);

    // const Discord = require('discord.js');
    let embed = new MessageEmbed()
    .setDescription("Sold for "+saleAmount+' ETH to **['+saleWalletTitle+']('+saleWalletLink+')**\n\n'+ guild.message)
    .setTitle("Noun "+nounId+" Sold! Its Noun O'Clock!")
    .setImage(nounImage)
    channel.send({embeds: [embed]})

    // image of Noun, sale price, buyer

    // const message = "SOLD! Noun " + 0 + " goes to test.eth for 50 ETH!\n\n" + guild.message;
    // client.channels.cache.get(guild.channel_id).send({content: message ,files: ['https://noun.pics/0.png']});

  })
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