const { SlashCommandBuilder } = require('@discordjs/builders');

const mongoose = require("mongoose");
const {characterSchema} = require("../../models/characters");
const {weaponSchema} = require("../../models/weapons");
const {typeSchema} = require("../../models/types");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('list')
		.setDescription('Displays all values from a specific list.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('weapons')
                .setDescription('List weapons.')
                .addStringOption(option =>
                    option.setName('type')
                        .setDescription('The weapon type to list from.')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('types')
                .setDescription('List all weapon types.'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('characters')
                .setDescription('List all characters.')),
    category: "Tabletop",

	async execute(interaction) {
        if (interaction.options.getSubcommand() === 'weapons') {
            let type = interaction.options.getString('type');

            const Weapon = mongoose.model('Weapon', weaponSchema);
            let weapons;
            let output;

            if(type !== null) {
                weapons = await Weapon.find({ type: type });
                output = `\`\`\`json\nList of All ${type.toUpperCase()} Weapons\n\n` + `id`.padEnd(20) + `| name`.padEnd(32) + `| type\n` + "-".repeat(70) + "\n";
            }
            else {
                weapons = await Weapon.find();
                output = `\`\`\`json\nList of All Weapons\n\n` + `id`.padEnd(20) + `| name`.padEnd(32) + `| type\n` + "-".repeat(70) + "\n";
            }

            weapons.forEach(element => output += (element.id).padEnd(20,' ') + '| ' + (element.name).padEnd(30, ' ') + '| ' + element.type + '\n');
            output += `\`\`\``;

            await interaction.reply(output);
        }

        else if (interaction.options.getSubcommand() === 'types') {

            const Type = mongoose.model("Types", typeSchema);
            let types = await Type.find();

            let output = `\`\`\`json\nList of All Weapon Type IDs\n\n` + `id\n` + "-".repeat(20) + "\n";

            types.forEach(element => output += (element.id).padEnd(20,' ') + '\n');
            output += `\`\`\``;

            await interaction.reply(output);
        }

        else if (interaction.options.getSubcommand() === 'characters') {

            const Character = mongoose.model("Character", characterSchema)
            let characters = await Character.find();

            let output = `\`\`\`json\nList of All Characters\n\n` + `id`.padEnd(20) + `| name\n` + "-".repeat(30) + "\n";
            characters.forEach(element => output += (element.id).padEnd(20,' ') + '| ' + element.name + '\n');
            output += `\`\`\``;

            await interaction.reply(output);
        }

    }
};

