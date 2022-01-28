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
                .addStringOption(option =>
                    option.setName('type')
                        .setDescription('The weapon type to list from.')
                        .setRequired(false)
                        .addChoice('rifle', 'rifle')
                        .addChoice('smg', 'smg')
                        .addChoice('marksman', 'marksman')
                        .addChoice('shotgun', 'shotgun')
                        .addChoice('pistol', 'pistol')
                        .addChoice('lmg', 'lmg')
                        .addChoice('explosive', 'explosive')
                        .addChoice('melee', 'melee')))
        .addSubcommand(subcommand =>
            subcommand
                .setName('types')
                .setDescription('List all weapon types.'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('characters')
                .setDescription('List characters.')),

	async execute(interaction) {

        if (interaction.options.getSubcommand() === 'weapons') {

            const type = interaction.options.getString('type');

            jsonString = fs.readFileSync('./items/weapons.json');
            let weapons = JSON.parse(jsonString);

            if(type != undefined) {
                weapons = weapons.filter(a => a.type === type);
            }

            let output = `\`\`\`json\nList of All ${type.toUpperCase()} Weapons\n\n` + `id`.padEnd(10) + `| name\n` + "-".repeat(30) + "\n";
            weapons.forEach(element => output += (element.id).padEnd(10,' ') + '| ' + element.name + '\n')
            output += `\`\`\``

            await interaction.reply(output);
        }

        else if (interaction.options.getSubcommand() === 'types' || interaction.options.getSubcommand() === 'characters') {

            let jsonString = fs.readFileSync('./items/types.json');
            const types = JSON.parse(jsonString);

            let output = `\`\`\`json\nList of All Weapon Type Ids\n\n` + `id\n` + "-".repeat(15) + "\n";
            types.forEach(element => output += (element.id).padEnd(10,' ') + '\n')
            output += `\`\`\``

            await interaction.reply(output);
        }

    }
};

