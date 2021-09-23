const { SlashCommandBuilder } = require('@discordjs/builders');
const mediaPlayer = require('../util/mediaPlayer.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('Plays an audio source in your channel.')
    .addStringOption(option => 
      option.setName('input')
        .setDescription('The audio resource') 
        .setRequired(true)),
	async execute(interaction) {

    await interaction.deferReply();

    if (!interaction.member.voice.channelId) {
      return await interaction.editReply({ content: 'Please join a voice channel first!', ephemeral: true});
    }

    let input = interaction.options.getString('input');

    if (!input.startsWith('http')) {
      input = await mediaPlayer.search_youtube(input);
    }

    mediaPlayer.join_voice_channel(interaction);

    mediaPlayer.add_item_to_queue(interaction, input);

	},
};