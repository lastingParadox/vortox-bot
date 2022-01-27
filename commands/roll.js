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

	async execute(interaction) {
        const dice = interaction.options.getString('dice');

        const roll = diceRoller.rollValue(dice);

        const embed = new MessageEmbed()
            .setColor('#FFA500')
            .setTitle(`Rolling ${dice}`)
            .setDescription(`You rolled a \`${roll}\`!`)
            .setTimestamp();

		await interaction.reply({ embeds: [embed] });
	},
};
