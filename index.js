require('dotenv').config();

const { Client, GatewayIntentBits, Collection } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildPresences, GatewayIntentBits.GuildVoiceStates] });
const fs = require('fs');
const mongoose = require('mongoose')

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

	const list = JSON.parse(fs.readFileSync(process.cwd() + `\\items\\status.json`));
	const episodeList = JSON.parse(fs.readFileSync(process.cwd() + `\\items\\episodes.json`));

	if (episodeList.episodeThread === "") client.user.setActivity(list[Math.floor(Math.random() * list.length)], {type: 'WATCHING'});
	else client.user.setActivity("Final Frontier", {type: 'PLAYING'});

	setInterval(() => {
		if (episodeList.episodeThread === "") client.user.setActivity(list[Math.floor(Math.random() * list.length)], {type: 'WATCHING'});
		else client.user.setActivity("Final Frontier", {type: 'PLAYING'});
	}, 300000);

})();