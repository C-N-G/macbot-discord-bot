const { Collection } = require('discord.js');
module.exports = {
	name: 'messageCreate',
	async execute(message) {
    const client = message.client;

    if (!message.content.startsWith(client.prefix) || message.author.bot) return;

    return message.reply('text commands have been temporarily disabled, please use slash commands instead');

    const args = message.content.slice(client.prefix.length).split(/ +/);
    const commandName = args.shift().toLowerCase();
  
    const command = client.commands.get(commandName)
        || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
  
    if (!command) return;

    if (command.guildOnly && message.channel.type !== 'GUILD_TEXT') {
      return message.reply('I can\'t execute that command inside DMs!');
    }
  
    if (command.args && !args.length) {
      let reply = 'You did not provide any arguments';
  
      if (command.usage) {
        reply += `\nThe proper usage would be: \`${client.prefix}${command.name} ${command.usage}\``;
      }
  
      return message.reply(reply);
    }
  
    if (!client.cooldowns.has(command.name)) {
      client.cooldowns.set(command.name, new Collection());
    }
  
    const now = Date.now();
    const timestamps = client.cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown || 3) * 1000;
  
    if (timestamps.has(message.author.id)) {
      const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
  
      if (now < expirationTime) {
        const timeLeft = (expirationTime - now) / 1000;
        return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
      }
    }
  
    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
  
    try {
      command.execute(message, args);
    } catch (error) {
      console.error(error);
      message.reply('there was an error trying to execute that command!');
    }
    
	},
};