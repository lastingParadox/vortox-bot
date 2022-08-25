require('dotenv').config();

const { Client, Partials, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const mongoose = require('mongoose')

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.MessageContent
	],
	partials: [
		Partials.Channel,
		Partials.User,
		Partials.GuildMember,
		Partials.Reaction
	]
});

client.commands = new Collection();

const functions = fs.readdirSync("./functions/").filter(file => file.endsWith(".js"));
const eventFiles = fs.readdirSync("./events/").filter(file => file.endsWith(".js"));
const commandFolders = fs.readdirSync("./commands");

(async () => {
	for (const file of functions) {
		require(`./functions/${file}`)(client);
	}

	client.handleEvents(eventFiles, "./events");
	client.handleCommands(commandFolders, "./commands");

	//Logging in the bot to the mongoDB service
	await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
	//Logging in the bot to the Discord service
	await client.login(process.env.CLIENT_TOKEN);

})();
