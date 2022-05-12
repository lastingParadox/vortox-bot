const { SlashCommandBuilder } = require('@discordjs/builders');
const { DiceRoller } = require('dice-roller-parser');
const roller = new DiceRoller();
const { MessageEmbed } = require('discord.js');
const fs = require('fs');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('edit')
		.setDescription('Adds a weapon to the list.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('weapon')
                .setDescription('Edit a pre-existing weapon.')
                .addStringOption(option => 
                    option.setName('id')
                        .setDescription('The weapon\'s id to be edited.')
                        .setRequired(true))
                .addStringOption(option => 
                    option.setName('attribute')
                        .setDescription('The weapon\'s attribute to be edited. (id is 20 char MAX and name is 30 char MAX)')
                        .setRequired(true)
                        .addChoice('id', 'id')
                        .addChoice('name', 'name')
                        .addChoice('type', 'type')
                        .addChoice('damage', 'damage')
                        .addChoice('description', 'description'))
                .addStringOption(option =>
                    option.setName('edit')
                        .setDescription('The change to be given to the weapon\'s attribute.')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('type')
                .setDescription('Edit a pre-existing weapon type.')
                .addStringOption(option => {
                    option.setName('id')
                        .setDescription('The weapon type\'s id to be edited.')
                        .setRequired(true)
                        //let choices;
                        //let readTypes = fs.readFileSync(process.cwd() + `\\items\\types.json`);
                        //choices = JSON.parse(readTypes);

                        //for (let type of choices) {
                        //    option.addChoice(type.id, type.id);
                        //}
                        return option;
                        })
                .addStringOption(option => 
                    option.setName('attribute')
                        .setDescription('The weapon type\'s attribute to be edited. (id is 20 char MAX)')
                        .setRequired(true)
                        .addChoice('id', 'id')
                        .addChoice('missrate', 'missrate'))
                .addStringOption(option =>
                    option.setName('edit')
                        .setDescription('The change to be given to the type\'s attribute.')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
                subcommand
                    .setName('character')
                    .setDescription('Edit a pre-existing character.')
                    .addStringOption(option => {
                        option.setName('id')
                            .setDescription('The character\'s id to be edited.')
                            .setRequired(true)
                        let choices;
                        let readChars = fs.readFileSync(process.cwd() + `\\items\\characters.json`);
                        choices = JSON.parse(readChars);

                        for (let type of choices) {
                            option.addChoice(type.id, type.id);
                        }
                        return option;
                    })
                    .addStringOption(option =>
                        option.setName('attribute')
                            .setDescription('The character\'s attribute to be edited. (id is 20 char MAX and name is 30 char MAX)')
                            .setRequired(true)
                            .addChoice('id', 'id')
                            .addChoice('name', 'name')
                            .addChoice('description', 'description')
                            .addChoice('hp', 'hp')
                            .addChoice('maxhp', 'maxhp')
                            .addChoice('image', 'image')
                            .addChoice('color', 'color'))
                    .addStringOption(option =>
                        option.setName('edit')
                            .setDescription('The change to be given to the character\'s attribute.')
                            .setRequired(true))),

	async execute(interaction) {

        const id = interaction.options.getString('id');
        const attribute = interaction.options.getString('attribute');
        const edit = interaction.options.getString('edit');

        const embed = new MessageEmbed()
            .setColor('#FF0000')
            .setTitle(`Editing \`${id}\` Failed!`);

        if (attribute === 'id' && edit.length > 20) {
            embed.setDescription(`ID \`${edit}\` is over 20 characters!`);
            await interaction.reply({ embeds: [embed] });
            return;
        }
        else if (attribute === 'name' && edit.length > 30) {
            embed.setDescription(`Name \`${edit}\` is over 30 characters!`);
            await interaction.reply({ embeds: [embed] });
            return;
        }

        if (attribute === "damage") {
            try {
                roller.roll(edit)
            } catch (err) {
                embed.setDescription(`Damage \`${edit}\` is not in a proper dice format!`);
                await interaction.reply({ embeds: [embed] });
                return;
            }
        }

        const fileString = interaction.options.getSubcommand() + `s.json`;
        const list = JSON.parse( fs.readFileSync(process.cwd() + `\\items\\` + fileString) );
        const object = list.find(e => e.id === id);

        if (object === undefined) {
            embed.setDescription(interaction.options.getSubcommand().charAt(0).toUpperCase() + interaction.options.getSubcommand().slice(1) + ` ID \`${id}\` not found!`);
            await interaction.reply({ embeds: [embed] });
            return;
        }

        object[attribute] = edit;

        fs.writeFile(process.cwd() + `\\items\\` + fileString, JSON.stringify(list, null, 2), err => {
            if (err) {
                console.log(`Error writing to ${fileString}`, err);
                embed.setDescription(`Failed to edit \`${id}!\` (Check the console.)`);
            }
            else {
                console.log(`${fileString} successfully written to!`);
            }
        });

        embed.setColor('#FFA500')
             .setTitle(`Editing \`${id}\` Succeeded!`)
             .setDescription(`Successfully changed \`${id}\`'s \`${attribute}\` to \`${edit}\``);

		await interaction.reply({ embeds: [embed] });
	},
};
