const { SlashCommandBuilder } = require('@discordjs/builders');
const { DiceRoller } = require('dice-roller-parser');
const roller = new DiceRoller();
const { MessageEmbed } = require('discord.js');
const fs = require('fs');
const { workingDir} = require('../../config.json');
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
                        .setDescription('The weapon\'s id to be used in commands. (20 char MAX)')
                        .setRequired(true))
                .addStringOption(option => {
                    option.setName('type')
                        .setDescription('The weapon\'s weapon type.')
                        .setRequired(true)
                        //let choices;
                        //let readTypes = fs.readFileSync(workingDir + `items\\types.json`);
                        //choices = JSON.parse(readTypes);

                        //for (let type of choices) {
                        //option.addChoice(type.id, type.id);
                        //}
                        return option;
                        })
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
                        .setDescription('The weapon type\'s id to be used in commands. (20 char MAX)')
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
                        .setDescription('The character\'s id to the used in commands. (20 char MAX)')
                        .setRequired(true))
                .addIntegerOption(option =>
                    option.setName('hp')
                        .setDescription('The character\'s hp, between 1 and 50.'))),

	async execute(interaction) {

        const id = interaction.options.getString('id').toLowerCase();

        let addType = interaction.options.getSubcommand();
        addType = addType.charAt(0).toUpperCase() + addType.substring(1);

        const embed = new MessageEmbed()
                .setColor('#FF0000')
                .setTitle(`Adding ${addType} ${id} Failed!`);

        if (id.length > 20) {
            embed.setDescription(`ID ${id} is over 20 characters!`);
            await interaction.reply({ embeds: [embed] });
            return;
        }

        let jsonString = fs.readFileSync(workingDir + `items\\${addType}s.json`);
        const objects = JSON.parse(jsonString);
        let temp;

        if (addType === 'Weapon') {
            const type = interaction.options.getString('type');
            const damage = interaction.options.getString('damage');

            try {
                roller.roll(damage);
            } catch (err) {
                embed.setDescription(`Damage \`${damage}\` is not in a proper dice format!`);
                await interaction.reply({ embeds: [embed] });
                return;
            }

            temp = {"id": id, "name": id, "type": type, "damage": damage, "description": "Description Unavailable."};

            embed.setDescription(`Successfully added \`${id}\` with damage roll \`${damage}\` to the weapon list!`);

        }

        else if (addType === 'Type') {
            const missrate = interaction.options.getString('missrate');

            temp = {"id": id, "missrate": missrate};

            embed.setDescription(`Successfully added \`${id}\` with miss rate \`${missrate}%\` to the weapon types list!`);
        }

        else if (addType === 'Character') {
            let hp = interaction.options.getInteger('hp');
            if (hp === null) {
                hp = 30;
            }

            temp = {"id": id, "name": (id.charAt(0).toUpperCase() + id.slice(1)), "description": "Description Unavailable.", "hp": hp, "maxhp": hp, "image": "", "color": "#FFA500", "quotes":{"ff2": [], "ff3": [], "ff4": [], "other": []}}

            embed.setDescription(`Successfully added \`${id}\` with \`${hp}\` hp to the characters list!`);
        }

        if (objects.find(e => e.id === id) !== undefined) {
            embed.setTitle(`Adding ${addType} ${id} Failed!`);
            embed.setDescription(`${addType} ID \`${id}\` already exists!\nTry the \`edit\` command!`);
            await interaction.reply({ embeds: [embed] });
            return;
        }

        objects.push(temp);

        fs.writeFile(workingDir + `items\\${addType}s.json`, JSON.stringify(objects, null, 2), err => {
            if (err) {
                console.log(`Error writing to ${addType.toLowerCase()}s.json.`, err);
                embed.setTitle(`Adding ${id} Failed!`);
                embed.setDescription(`Failed to add \`${id}!\` (Check the console.)`);
                interaction.reply({ embeds: [embed] });
                return;
            }
            else {
                console.log(`${addType.toLowerCase()}s.json successfully written to!`);
            }
        });

        embed.setColor('#FFA500');
        embed.setTitle(`Adding ${id} Succeeded!`);

        await interaction.reply({ embeds: [embed] });

	},
};
