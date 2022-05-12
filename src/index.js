const { Client, Intents, Collection } = require('discord.js');
const { token, workingDir} = require('./config.json');
const fs = require('fs');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_PRESENCES, Intents.FLAGS.GUILD_VOICE_STATES] });

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

	//Getting the bot src directory.
    const config = JSON.parse(fs.readFileSync(process.cwd() + `\\config.json`));

	config.workingDir = process.cwd() + `\\`;

	fs.writeFile(process.cwd() + `\\config.json`, JSON.stringify(config, null, 2), err => {
		if (err) {
			console.log('Error writing to config.json.', err);
		}
	});

	//Logging in the bot to the Discord service
	await client.login(token);

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
		"your balls"
	]

	let index = Math.floor(Math.random() * list.length);
	const episodeList = JSON.parse(fs.readFileSync(workingDir + `items\\episodes.json`));


	if (episodeList.episodeThread === "") client.user.setActivity(list[index], {type: 'WATCHING'});
	else client.user.setActivity("Final Frontier", {type: 'PLAYING'});

	setInterval(() => {
		index = Math.floor(Math.random() * list.length);
		if (episodeList.episodeThread === "") client.user.setActivity(list[index], {type: 'WATCHING'});
		else client.user.setActivity("Final Frontier", {type: 'PLAYING'});
	}, 300000);

})();