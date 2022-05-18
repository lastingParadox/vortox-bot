const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { DiceRoller } = require('dice-roller-parser');
const diceRoller = new DiceRoller();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('roll')
		.setDescription('Rolls dice.')
        .addStringOption(option =>
            option.setName('dice')
                .setDescription('The dice to be rolled. Uses standard DnD dice roll formatting.')
                .setRequired(true)),
	category: "Tabletop",

	async execute(interaction) {
        const dice = interaction.options.getString('dice');

		const embed = new MessageEmbed()
			.setColor('#FFA500')
			.setTitle(`Rolling ${dice}`);

        let roll;

		try {
			roll = diceRoller.rollValue(dice)
			embed.setDescription(`You rolled a \`${roll}\`!`);
		}
		catch (SyntaxError) {
			embed.setColor('#FF0000')
				 .setDescription(`Invalid dice format!`);
		}

		await interaction.reply({ embeds: [embed] });
	},
};
