const { SlashCommandBuilder } = require('@discordjs/builders');
const { Message, MessageAttachment, MessageEmbed, Permissions} = require('discord.js');
const mongoDB = require(`../helpers/mongodb.js`);

module.exports = {
	data: new SlashCommandBuilder()
		.setName('config')
		.setDescription("Specify channel for announcements")
		.addChannelOption(option => option.setName('channel').setDescription('Select a channel')),
		
	async execute(interaction) {

		if (interaction.member.permissions.has("ADMINISTRATOR")){
			const channel = interaction.options.getChannel('channel');
			await mongoDB.setGuildChannel(interaction.guild.id, channel.id);
			
			await interaction.reply({
				content: "posting in #" + channel.name,
				ephemeral: true,
			});
		} else {
			await interaction.reply({ content: 'Your are NOT allowed to be here.', ephemeral: true });
		}

	},
};


// @todo - integrate Discord ApplicationCommandPermissions rather than role checking logic here
		

//Opensea Link, Owner, previous auction info. Integrate Open Sea API
//const msgAttach = new MessageAttachment(`https://noun.pics/${nounNum}.png`);