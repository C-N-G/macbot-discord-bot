const { check_bot_location } = require('../util/util.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { getVoiceConnection } = require('@discordjs/voice');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('leave')
		.setDescription('Forces the bot to leave the channel.'),
	async execute(interaction) {

    if (!check_bot_location(interaction, 'same-voice')) {
      return await interaction.reply({ content:'We need to be in the same voice channel', ephemeral: true});
    }

    const connection = getVoiceConnection(interaction.guild.id);
    if (!connection) return await interaction.reply('I am not in a voice channel!');
    connection.destroy();
    await interaction.reply(':thumbsup:');
	},
};