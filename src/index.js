require('dotenv').config();

const { Client, Intents, Collection } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_PRESENCES, Intents.FLAGS.GUILD_VOICE_STATES] });
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

	const list = [
		"orbin' it up",
		"Project 4 soon!",
		"Garrick, more like garlic",
		"marbilization",
		"An onion, wow.",
		"No one out-zizzas the Butt.",
		"the world is your oyster!",
		"always. kid. to me.",
		"i'm all ears.",
		"u-uh... you're a star!",
		"plot interference",
		"your balls",
		"uh-oh stinky"
	]

	let index = Math.floor(Math.random() * list.length);
	const episodeList = JSON.parse(fs.readFileSync(process.cwd() + `\\items\\episodes.json`));

	if (episodeList.episodeThread === "") client.user.setActivity(list[index], {type: 'WATCHING'});
	else client.user.setActivity("Final Frontier", {type: 'PLAYING'});

	setInterval(() => {
		index = Math.floor(Math.random() * list.length);
		if (episodeList.episodeThread === "") client.user.setActivity(list[index], {type: 'WATCHING'});
		else client.user.setActivity("Final Frontier", {type: 'PLAYING'});
	}, 300000);

})();