const { check_bot_location } = require('../util/util.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
  .setName('resume')
  .setDescription('Resumes the current audio sauce.'),
	async execute(interaction) {

    if (!check_bot_location(interaction, 'same-voice')) {
      return await interaction.reply({ content:'We need to be in the same voice channel', ephemeral: true});
    }

    const server = interaction.client.servers.get(interaction.guild.id);

    if (!server || 
      !server.playing || 
      server.playing.state.status !== 'paused') {
        return await interaction.reply(':thumbsdown:');
    }

    server.playing.unpause();
    await interaction.reply('Audio resumed.');
	}
};
