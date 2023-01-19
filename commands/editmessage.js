const { SlashCommandBuilder } = require('@discordjs/builders');
const { Message, MessageAttachment, MessageEmbed, Permissions} = require('discord.js');
const mongoDB = require(`../helpers/mongodb.js`);

module.exports = {
	data: new SlashCommandBuilder()
		.setName('editmessage')
		.setDescription("Edit the Noun O'Clock message")
    .addStringOption(option =>
      option.setName('message')
        .setDescription("Your Noun O'Clock message")),
		
	async execute(interaction) {

		if (interaction.member.permissions.has("ADMINISTRATOR")){

      const message = interaction.options.getString('message');
      // TODO: Proper sanitization on message
      const result = await mongoDB.setNounOClockMessage(interaction.guild.id, interaction.guild.name, message);
			//await mongoDB.setGuildChannel(interaction.guild.id, interaction.guild.name, channel.id, channel.name);

      if (result) {
        await interaction.reply({
          content: "Changed Noun O'Clock message to: " + message,
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: "Message not changed - must use /config command first",
          ephemeral: true,
        });
      }
		} else {

			await interaction.reply({ content: 'Only Administrators can use this command - geeeeet outta here.', ephemeral: true });

		}

	},
};


// @todo - integrate Discord ApplicationCommandPermissions rather than role checking logic here
		

//Opensea Link, Owner, previous auction info. Integrate Open Sea API
//const msgAttach = new MessageAttachment(`https://noun.pics/${nounNum}.png`);