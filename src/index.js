const { Client, Intents, Collection } = require('discord.js');
const { token } = require('./config.json');
const fs = require('fs');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

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
})();