const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('choose')
        .setDescription('Chooses from a set of options.')
        .addStringOption(option =>
            option.setName('options')
                .setDescription('The set of options to choose from, separated by " | ".')
                .setRequired(true)),

    async execute(interaction) {
        let choices = interaction.options.getString('options');
        const choiceArray = choices.split(" | ");

        choices = "";
        choiceArray.forEach(choice => {
            choices += ` ${choice},`;
        })

        choices = choices.substring(1, choices.length - 1);

        const embed = new MessageEmbed()
            .setColor('#FFA500')
            .setAuthor({ name: `${interaction.member.displayName} chose...`, iconURL: interaction.member.displayAvatarURL() })
            .setTitle(`${choiceArray[Math.floor(Math.random() * choiceArray.length)]}`)
            .setFooter({ text: `The choices were: ${choices}`})

        await interaction.reply({ embeds: [embed] });
    },
};
