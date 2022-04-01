const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { workingDir } = require('../../config.json');
const fs = require('fs');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('8ball')
		.setDescription('Shakes the 8ball!')
        .addStringOption(option =>
            option.setName('question')
                .setDescription('The question to be asked.')
                .setRequired(true)),

	async execute(interaction) {
        const question = interaction.options.getString('question');

        let ball = fs.readFileSync(workingDir + `items\\8ball.json`);
        const responses = JSON.parse(ball);

        const choice = Math.floor(Math.random() * responses.length);
        const response = Math.floor(Math.random() * responses[choice]['responses'].length);

        ball = responses[choice]['responses'][response];

        const embed = new MessageEmbed()
            .setColor('#FFA500')
            .setTitle(`8ball Response`)
            .setDescription(`${ball}`)
            .setFooter({ text: `${interaction.member.displayName} asked: "${question}"`})

		await interaction.reply({ embeds: [embed] });
	},
};
