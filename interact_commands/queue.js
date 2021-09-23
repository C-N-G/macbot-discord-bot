const util = require('../util/util.js');
const { MessageEmbed }  = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
  .setName('queue')
  .setDescription('Shows the current audio queue.'),
	async execute(interaction) {
    
    if (!interaction.client.servers.get(interaction.guildId)) {
      return await interaction.reply('The queue is empty, try playing a song!');
    }

    const server = interaction.client.servers.get(interaction.guild.id);

    if (!server.queue || !server.queue.length) {
      return await interaction.reply('The queue is empty, try playing a song!');
    }

    let currentTime = Math.floor(server.playing._state.resource.playbackDuration / 1000);
    if (server.seekTime) {
      currentTime += parseInt(server.seekTime);
    }
    currentTime = util.convert_time(currentTime);
    const queue = server.queue;
    let msg = queue.map((ele, index) => `${index+1}: **[${util.convert_time(ele.timeLength)}]** [${ele.title}](${ele.link}) - <@${ele.userId}>`);
    msg[0] = `1: **[${currentTime}/${util.convert_time(queue[0].timeLength)}]** [${queue[0].title}](${queue[0].link}) - <@${queue[0].userId}>`;
    msg = msg.join('\n');
    const embed = new MessageEmbed()
      .setColor('AQUA')
      .setTitle('Queue')
      .setDescription(msg);
    await interaction.reply({ embeds: [embed]});
	}
};
