const mediaPlayer = require('../util/mediaPlayer.js');
const { check_bot_location } = require('../util/util.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
  .setName('stop')
  .setDescription('Stops the audio source and empties the playlist.'),
	async execute(interaction) {

    if (!interaction.client.servers.get(interaction.guildId)) {
      return interaction.reply('The queue is already empty.');
    }

    const server = interaction.client.servers.get(interaction.guildId);

    if (!server.queue || !server.queue.length) {
      return interaction.reply('The queue is already empty.');
    }

    if (!check_bot_location(interaction, 'same-voice')) {
      return await interaction.reply({ content:'We need to be in the same voice channel', ephemeral: true});
    }

    if (server.looping) {
      server.looping = false;
    }
    const size = server.queue.length;
    server.queue = [];
    mediaPlayer.play_next_item(interaction);
    const embed = new MessageEmbed()
      .setColor('AQUA')
      .setDescription(`Emptied ${size} item(s) from the queue.`);
    await interaction.reply({ embeds: [embed] });

	}
};
