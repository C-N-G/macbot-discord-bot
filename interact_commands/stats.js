const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('stats')
		.setDescription('Shows information about bot statistics.'),
	async execute(interaction) {

    const client = interaction.client;
    const embed = new MessageEmbed()
      .setColor('AQUA')
      .setDescription(`Currently listening to:\n - ${client.guilds.cache.size} Guilds\n - ${client.channels.cache.size} Channels\n - ${client.users.cache.size} Users`);
    await interaction.reply({ embeds: [embed] });

	}
}; 