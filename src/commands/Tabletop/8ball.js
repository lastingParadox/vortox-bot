const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
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

        let ball = fs.readFileSync(process.cwd() + `\\items\\8ball.json`);
        const responses = JSON.parse(ball);

        let totalChoices = 0;
        for (const element of responses) {
            totalChoices += element.responses.length;
        }

        let randomNum = Math.floor(Math.random() * totalChoices);
        let response;
        for (const element of responses) {
            randomNum -= element.responses.length;

            if (randomNum <= 0) {
                response = Math.floor(Math.random() * responses[responses.indexOf(element)]['responses'].length);
                response = responses[responses.indexOf(element)]['responses'][response];
                break;
            }
        }

        const embed = new MessageEmbed()
            .setColor('#FFA500')
            .setTitle(`8ball Response`)
            .setDescription(`${response}`)
            .setFooter({ text: `${interaction.member.displayName} asked: "${question}"`})

        await interaction.reply({ embeds: [embed] });
    },
};