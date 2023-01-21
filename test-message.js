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
const nermanDiscordID = '919783277726957599';
const nermanDiscordChannelId = '939984898268225609';//staging channel: 934488636035072020;

client.login(token);

client.on('ready', async () => {

  const nerman = await _nerman;
  Nouns = new nerman.Nouns(process.env.JSON_RPC_API_URL);

  isCacheReady(postToChannel)

});

function isCacheReady(callback){
  if(Nouns.cache.auction){
    console.log(Nouns.cache.auction);
    callback();
    return true;
  } else {
    setTimeout(async function(){
      isCacheReady(callback)
    },1000);
  }

}

const postToChannel = async function () {
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
  const nounImage = "https://noun.pics/"+nounId+".png";
  const saleWalletLink = "https://etherscan.io/address/"+saleWallet;
  
  const channel = client.channels.cache.get(nermanDiscordChannelId);
  
  let embed = new MessageEmbed()
  .setDescription('Winner: **['+saleWalletTitle+']('+saleWalletLink+')**\n\n**It\'s Noun O\'Clock!\n**'+ "Help choose the next Noun: **https://fomonouns.wtf/**")
  .setTitle("SOLD!"+saleAmount+" ETH for Noun "+nounId)
  .setImage(nounImage)
  channel.send({embeds: [embed]})
}