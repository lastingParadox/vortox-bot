const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('list')
		.setDescription('Displays all values from a specific list.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('weapons')
                .setDescription('List weapons.')
                .addStringOption(option => {
                    option.setName('type')
                        .setDescription('The weapon type to list from.')
                        .setRequired(false)
                        //let choices;
                        //let readTypes = fs.readFileSync(process.cwd() + `\\items\\types.json`);
                        //choices = JSON.parse(readTypes);

                        //for (let type of choices) {
                        //    option.addChoice(type.id, type.id);
                        //}
                        return option
                    }))
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

            const jsonString = fs.readFileSync(process.cwd() + `\\items\\weapons.json`);
            let weapons = JSON.parse(jsonString);
            let output;

            if(type !== null) {
                weapons = weapons.filter(a => a.type === type);
                output = `\`\`\`json\nList of All ${type.toUpperCase()} Weapons\n\n` + `id`.padEnd(20) + `| name`.padEnd(32) + `| type\n` + "-".repeat(70) + "\n";
            }
            else {
                output = `\`\`\`json\nList of All Weapons\n\n` + `id`.padEnd(20) + `| name`.padEnd(32) + `| type\n` + "-".repeat(70) + "\n";
            }

            weapons.forEach(element => output += (element.id).padEnd(20,' ') + '| ' + (element.name).padEnd(30, ' ') + '| ' + element.type + '\n');
            output += `\`\`\``;

            await interaction.reply(output);
        }

        else if (interaction.options.getSubcommand() === 'types') {

            let jsonString = fs.readFileSync(process.cwd() + `\\items\\types.json`);
            const types = JSON.parse(jsonString);

            let output = `\`\`\`json\nList of All Weapon Type IDs\n\n` + `id\n` + "-".repeat(20) + "\n";
            types.forEach(element => output += (element.id).padEnd(20,' ') + '\n');
            output += `\`\`\``;

            await interaction.reply(output);
        }

        else if (interaction.options.getSubcommand() === 'characters') {
            let jsonString = fs.readFileSync(process.cwd() + `\\items\\characters.json`);
            const characters = JSON.parse(jsonString);

            let output = `\`\`\`json\nList of All Characters\n\n` + `id`.padEnd(20) + `| name\n` + "-".repeat(30) + "\n";
            characters.forEach(element => output += (element.id).padEnd(20,' ') + '| ' + element.name + '\n');
            output += `\`\`\``;

            await interaction.reply(output);
        }

    }
};

