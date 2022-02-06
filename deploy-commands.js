const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const clientId = process.env.DISCORD_CLIENT_ID;
const token = process.env.DISCORD_TOKEN;


const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
   const command = require(`./commands/${file}`);
   commands.push(command.data.toJSON());
}

const rest = new REST({ version: '9' }).setToken(token);

// Used for testing - guild commands are recommended for development
// const guildId = process.env.DISCORD_GUILD_ID;
// rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
//    .then(() => console.log('Successfully registered application commands.'))
//    .catch(console.error);


//used to register global application commands - 1 hour cache
rest.put(Routes.applicationCommands(clientId), { body: commands })
   .then(() => console.log('Successfully registered application commands.'))
   .catch(console.error);
