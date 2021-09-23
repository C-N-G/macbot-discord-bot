const mediaPlayer = require('../util/mediaPlayer.js');
const { check_bot_location, convert_time, get_time_from_text } = require('../util/util.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
  .setName('seek')
  .setDescription('Seeks through the current audio source.')
  .addStringOption(option => 
    option.setName('input')
      .setDescription('Time to seek to.') 
      .setRequired(true)),
	async execute(interaction) {

    // return message.channel.send('This command has been temporarily disabled');

    await interaction.deferReply();

    async function seek(seekTime) {
      mediaPlayer.play(interaction, seekTime);

      await interaction.editReply(`Seeking [${convert_time(seekTime)}]`);
    }

    function cacheSeek() {
      if (server.queue[0].cached) {
        clearInterval(server.seekCache);
        seek(input);
      }
    }

    if (!check_bot_location(interaction, 'same-voice')) {
      return await interaction.editReply({ content:'We need to be in the same voice channel', ephemeral: true});
    }

    const server = interaction.client.servers.get(interaction.guild.id);

    if (!server.queue || !server.queue.length) {
      return await interaction.editReply('The queue is empty, try playing a song!');
    }

    let input = interaction.options.getString('input');

    if (!get_time_from_text(input) && isNaN(input)) {
      return await interaction.editReply('Please input the total number of seconds you wish to seek or hh:mm:ss');
    } else if (
      parseInt(input) > parseInt(server.queue[0].timeLength) ||
      get_time_from_text(input) > parseInt(server.queue[0].timeLength)
      ) {
      return await interaction.editReply(`Please input a number within ${server.queue[0].timeLength} seconds or ${convert_time(server.queue[0].timeLength)}`);
    }

    if (get_time_from_text(input)) input = get_time_from_text(input);

    input = Math.floor(input);

    server.seekTime = input;

    if (server.seekCache) {
      clearInterval(server.seekCache);
    }

    if (server.playing_cached) {
      server.ffmpeg.kill();
      return seek(input);
    }
    
    if (server.queue[0].cached) {
      seek(input);
    } else if (server.queue[0].timeLength > 5400) {
      return await interaction.editReply('That item is too long to cache and therefore cannot be seeked through');
    } else {
      server.seekCache = setInterval(cacheSeek, 500);
      return await interaction.editReply(`Seeking [${convert_time(input)}] (item is still caching)`);
    }

	}
};
