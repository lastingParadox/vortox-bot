const { SlashCommandBuilder } = require('@discordjs/builders');
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
                        .setDescription('The weapon\'s attribute to be edited.')
                        .setRequired(true)
                        .addChoice('id', 'id')
                        .addChoice('name', 'name')
                        .addChoice('type', 'type')
                        .addChoice('damage', 'damage')
                        .addChoice('description', 'description'))
                .addStringOption(option =>
                    option.setName('edit')
                        .setDescription('The change to be given to the attribute.')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('type')
                .setDescription('Edit a pre-existing weapon type.')
                .addStringOption(option => 
                    option.setName('id')
                        .setDescription('The weapon type\'s id to be edited.')
                        .setRequired(true))
                .addStringOption(option => 
                    option.setName('attribute')
                        .setDescription('The weapon\'s attribute to be edited.')
                        .setRequired(true)
                        .addChoice('id', 'id')
                        .addChoice('missrate', 'missrate'))
                .addStringOption(option =>
                    option.setName('edit')
                        .setDescription('The change to be given to the attribute.')
                        .setRequired(true))),

	async execute(interaction) {

        const embed = new MessageEmbed()
            .setColor('#FFA500')
            .setTimestamp();

        const id = interaction.options.getString('id');
        const attribute = interaction.options.getString('attribute');
        const edit = interaction.options.getString('edit');

        if (interaction.options.getSubcommand() === 'weapon') {

            const jsonString = fs.readFileSync('./items/weapons.json');
            const weapons = JSON.parse(jsonString);

            const index = weapons.findIndex(e => e.id === id);

            if (index === -1) {
                embed.setColor('#FF0000');
                embed.setDescription(`Weapon id \`${id}\` not found!`);
                await interaction.reply({ embeds: [embed] });
                return;
            }

            weapons[index][attribute] = edit;

            fs.writeFile('./items/weapons.json', JSON.stringify(weapons, null, 2), err => {
                if (err) {
                    console.log('Error writing to weapons.json.', err);
                    embed.setColor('#FF0000');
                    embed.setTitle(`Editing Weapon ${id} Failed!`);
                    embed.setDescription(`Failed to edit \`${id}!\` (Check the console.)`);
                }
                else {
                    console.log("weapons.json successfully written to!");
                }
            });

            embed.setTitle(`Editing ${id} Succeeded!`);
            embed.setDescription(`Successfully changed \`${id}\`'s \`${attribute}\` to \`${edit}\`!`)
        }

        else if (interaction.options.getSubcommand() === 'type') {

            const jsonString = fs.readFileSync('./items/types.json');
            const types = JSON.parse(jsonString);

            const index = types.findIndex(e => e.id === id);

            if (index === -1) {
                embed.setColor('#FF0000');
                embed.setDescription(`Weapon id \`${id}\` not found!`);
                await interaction.reply({ embeds: [embed] });
                return;
            }

            types[index][attribute] = edit;

            fs.writeFile('./items/types.json', JSON.stringify(weapons, null, 2), err => {
                if (err) {
                    console.log('Error writing to types.json.', err);
                    embed.setColor('#FF0000');
                    embed.setTitle(`Editing Type ${id} Failed!`);
                    embed.setDescription(`Failed to edit \`${id}!\` (Check the console.)`);
                }
                else {
                    console.log("types.json successfully written to!");
                }
            });

            embed.setTitle(`Editing ${id} Succeeded!`);
            embed.setDescription(`Successfully changed \`${id}\`'s \`${attribute}\` to \`${edit}\`!`)
        }

		await interaction.reply({ embeds: [embed] });
	},
};
