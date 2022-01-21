require('dotenv').config();

const fs = require('fs');
const { Client, Collection, Intents } = require('discord.js');
const token = process.env.DISCORD_TOKEN;
const client = new Client({ intents: []});

// Login to Discord with your client's token
client.login(token);

client.on('ready', () => {
   client.user.setStatus('available')
   client.user.setPresence({
       game: {
           name: 'Oh Hi There',
           type: "STREAMING",
           url: "https://nouns.wtf"
       }
   });
});