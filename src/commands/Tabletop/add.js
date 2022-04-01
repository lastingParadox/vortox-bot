const { SlashCommandBuilder } = require('@discordjs/builders');
const { DiceRoller } = require('dice-roller-parser');
const roller = new DiceRoller();
const { MessageEmbed } = require('discord.js');
const fs = require('fs');
const { workingDir } = require('../../config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('add')
		.setDescription('Adds a weapon or weapon type to the list.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('weapon')
                .setDescription('Adds a weapon to the list.')
                .addStringOption(option =>
                    option.setName('id')
                        .setDescription('The weapon\'s id to be used in commands.')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('type')
                        .setDescription('The weapon\'s weapon type.')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('damage')
                        .setDescription('The weapon\'s damage roll.')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('type')
                .setDescription('Adds a weapon type to the list.')
                .addStringOption(option =>
                    option.setName('id')
                        .setDescription('The weapon type\'s id to be used in commands.')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('missrate')
                        .setDescription('The type\'s miss rate, in percentage.')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('character')
                .setDescription('Adds a character to the list.')
                .addStringOption(option =>
                    option.setName('id')
                        .setDescription('The character\'s id to the used in commands.')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('hp')
                        .setDescription('The character\'s hp, between 1 and 50.'))),

	async execute(interaction) {

        const id = interaction.options.getString('id');

        const embed = new MessageEmbed()
                .setColor('#FFA500')
                .setTimestamp();

        let jsonString = fs.readFileSync(workingDir + `items\\types.json`);
        const types = JSON.parse(jsonString);

        jsonString = fs.readFileSync(workingDir + `items\\weapons.json`);
        const weapons = JSON.parse(jsonString);

        jsonString = fs.readFileSync(workingDir + `items\\characters.json`);
        const characters = JSON.parse(jsonString);

        if (interaction.options.getSubcommand() === 'weapon') {

            const type = interaction.options.getString('type');
            const damage = interaction.options.getString('damage');

            try {
                roller.roll(damage)
            } catch (err) {
                embed.setColor('#FF0000');
                embed.setTitle(`Adding Weapon ${id} Failed!`);
                embed.setDescription(`Damage \`${damage}\` is a syntax error!`);
                await interaction.reply({ embeds: [embed] });
                return;
            }

            if (types.find(e => e.id === type) === undefined) {
                embed.setColor('#FF0000');
                embed.setTitle(`Adding Weapon ${id} Failed!`);
                embed.setDescription(`Weapon type \`${type}\` doesn't exist!`);
                await interaction.reply({ embeds: [embed] });
                return;
            }

            if (weapons.find(e => e.id === id) !== undefined) {
                embed.setColor('#FF0000');
                embed.setTitle(`Adding Weapon ${id} Failed!`);
                embed.setDescription(`Weapon id \`${id}\` already exists!\nTry the \`edit\` command!`);
                await interaction.reply({ embeds: [embed] });
                return;
            }

            const temp = {
                "id": id,
                "name": id,
                "type": type,
                "damage": damage,
                "description": "Description Unavailable."
            };

            weapons.push(temp);

            fs.writeFile(workingDir + `items\\weapons.json`, JSON.stringify(weapons, null, 2), err => {
                if (err) {
                    console.log('Error writing to weapons.json.', err);
                    embed.setColor('#FF0000');
                    embed.setTitle(`Adding Weapon ${id} Failed!`);
                    embed.setDescription(`Failed to add \`${id}!\` (Check the console.)`);
                    interaction.reply({ embeds: [embed] });

                }
                else {
                    console.log("weapons.json successfully written to!");
                }
            });

            embed.setTitle(`Adding Weapon ${id} Succeeded!`);
            embed.setDescription(`Successfully added \`${id}\` with damage roll \`${damage}\` to the weapon list!`);

            await interaction.reply({ embeds: [embed] });
        }

        else if (interaction.options.getSubcommand() === 'type') {
            const missrate = interaction.options.getString('missrate');

            const temp = {
                "id": id,
                "missrate": missrate
            };

            if (types.find(e => e.id === id) !== undefined) {
                embed.setColor('#FF0000');
                embed.setTitle(`Adding Weapon Type ${id} Failed!`);
                embed.setDescription(`Weapon type id \`${id}\` already exists!\nTry the \`edit\` command!`);
                await interaction.reply({ embeds: [embed] });
                return;
            }

            types.push(temp);

            fs.writeFile(workingDir + `items\\types.json`, JSON.stringify(types, null, 2), err => {
                if (err) {
                    console.log('Error writing to types.json.', err);
                    embed.setColor('#FF0000');
                    embed.setTitle(`Adding Weapon Type ${id} Failed!`);
                    embed.setDescription(`Failed to add \`${id}!\` (Check the console.)`);
                    interaction.reply({ embeds: [embed] });

                }
                else {
                    console.log("types.json successfully written to!");
                }

            });

            embed.setTitle(`Adding Weapon Type ${id} Succeeded!`);
            embed.setDescription(`Successfully added \`${id}\` with miss rate \`${missrate}%\` to the weapon types list!`);

            await interaction.reply({ embeds: [embed] });
        }

        else if (interaction.options.getSubcommand() === 'character') {
            let hp = interaction.options.getString('hp');
            if (hp === undefined) {
                hp = 30;
            }

            const character = {"id":id, "name": id, "description": "Description Unavailable.", "hp": hp, "ff2": false, "ff3": false, "ff4": false, "other": false, "quotes":{"ff2": [], "ff3": [], "ff4": [], "other": []}}

            if (characters.find(e => e.id === id.toLowerCase()) !== undefined) {
                embed.setColor('#FF0000');
                embed.setTitle(`Adding Character ${id} Failed!`);
                embed.setDescription(`Character \`${id}\` already exists!\nTry the \`edit\` command!`);
                await interaction.reply({ embeds: [embed] });
                return;
            }

            characters.push(character);

            fs.writeFile(workingDir + `items\\characters.json`, JSON.stringify(characters, null, 2), err => {
                if (err) {
                    console.log('Error writing to characters.json.', err);
                    embed.setColor('#FF0000');
                    embed.setTitle(`Adding Character ${id} Failed!`);
                    embed.setDescription(`Failed to add \`${id}!\` (Check the console.)`);
                    interaction.reply({ embeds: [embed] });

                }
                else {
                    console.log("characters.json successfully written to!");
                }

            });

            embed.setTitle(`Adding Character ${id} Succeeded!`);
            embed.setDescription(`Successfully added \`${id}\` with \`${hp}\` hp to the characters list!`);

            await interaction.reply({ embeds: [embed] });
        }
	},
};
