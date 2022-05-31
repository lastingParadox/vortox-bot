require('dotenv').config();

const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');

module.exports = (client) => {
    client.handleCommands = async (commandFolders, path) => {
        client.commandArray = [];
        for (let folder of commandFolders) {
            const commandFiles = fs.readdirSync(`${path}/${folder}`).filter(file => file.endsWith('.js'));
            for (const file of commandFiles) {
                const command = require(`../commands/${folder}/${file}`);

                client.commands.set(command.data.name, command);
                client.commandArray.push(command.data.toJSON());
            }
        }

        const rest = new REST({ version: '9' }).setToken(process.env.CLIENT_TOKEN);

            try {
                console.log('Started refreshing application (/) commands.');

                await rest.put(
                    Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
                    {body: client.commandArray},
                );
                await console.log('Successfully reloaded application (/) commands in Burger Dictator.');

                await rest.put(
                    Routes.applicationGuildCommands(process.env.CLIENT_ID, "758501917617422428"),
                    {body: client.commandArray},
                );
                await console.log('Successfully reloaded application (/) commands in Squobe.');
            }
            catch (error) {
                console.error(error);
            }

    }
}