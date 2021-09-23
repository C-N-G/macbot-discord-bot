const fs = require('fs');
const { Client, Collection, Intents } = require('discord.js');
const { prefix, token } = require('./config.json');

const client = new Client({ intents: [
  Intents.FLAGS.GUILDS, 
  Intents.FLAGS.GUILD_MESSAGES, 
  Intents.FLAGS.GUILD_MESSAGE_REACTIONS, 
  Intents.FLAGS.GUILD_VOICE_STATES, 
  Intents.FLAGS.DIRECT_MESSAGES, 
  Intents.FLAGS.DIRECT_MESSAGE_REACTIONS
] });

client.prefix = prefix;
client.commands = new Collection();

client.interactCommands = new Collection();

client.cooldowns = new Collection();

client.servers = new Collection(); // for music bot functions

client.chessGames = new Collection(); // for chess matches

client.people = new Collection(); // for individual user interactions

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

const interactCommandFiles = fs.readdirSync('./interact_commands').filter(file => file.endsWith('.js'));
for (const file of interactCommandFiles) {
  const command = require(`./interact_commands/${file}`);
  client.interactCommands.set(command.data.name, command);
}

const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
	const event = require(`./events/${file}`);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

client.login(token);
