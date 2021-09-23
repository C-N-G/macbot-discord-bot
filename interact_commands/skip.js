const mediaPlayer = require('../util/mediaPlayer.js');
const { check_bot_location } = require('../util/util.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
  .setName('skip')
  .setDescription('Skips the current audio source'),
	async execute(interaction) {

    if (!interaction.client.servers.get(interaction.guildId)) {
      return interaction.reply('The queue is empty, try playing a song!');
    }

    const server = interaction.client.servers.get(interaction.guildId);

    if (!server.queue || !server.queue.length) {
      return interaction.reply('The queue is empty, try playing a song!');
    }

    if (!check_bot_location(interaction, 'same-voice')) {
      return await interaction.reply({ content:'We need to be in the same voice channel', ephemeral: true});
    }

    if (server.looping) {
      server.looping = false;
    }
    mediaPlayer.play_next_item(interaction);
    await interaction.reply(':thumbsup:');

	}
};
