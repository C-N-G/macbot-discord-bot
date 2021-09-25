const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
  .setName('restart')
  .setDescription('Restarts the bot.'),
	async execute(interaction) {

    if (interaction.member.id !== '150362891541938177') {
      return await interaction.reply(`Only <@150362891541938177> can use this command`);
    }

    await interaction.reply(':thumbsup:');

    process.exit();

	}
};
