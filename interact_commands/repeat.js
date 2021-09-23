const { check_bot_location } = require('../util/util.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
  .setName('repeat')
  .setDescription('Repeats the current audio queue item.'),
	async execute(interaction) {

    if (!check_bot_location(interaction, 'same-voice')) {
      return await interaction.reply({ content:'We need to be in the same voice channel', ephemeral: true});
    }

    const server = interaction.client.servers.get(interaction.guildId);

    let looping = '';

    if (!server.looping) {
      server.looping = true;
      looping = 'ENABLED';
    } else if (server.looping) {
      server.looping =  false;
      looping = 'DISABLED';
    }

    const embed = new MessageEmbed()
      .setColor('AQUA')
      .setDescription(`Looping: ${looping}.`);
    await interaction.reply({ embeds: [embed] });

	}
};
