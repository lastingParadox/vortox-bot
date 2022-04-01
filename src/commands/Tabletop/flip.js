const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { workingDir } = require('../../config.json');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('flip')
        .setDescription('Flips a coin!'),

    async execute(interaction) {

        const choice = Math.floor(Math.random() * 2);

        let flip = ""

        if (choice === 0) {
            flip = "Heads";
        }
        else {
            flip = "Tails";
        }

        const embed = new MessageEmbed()
            .setColor('#FFA500')
            .setAuthor({ name: `${interaction.member.displayName} flips a coin and it lands on...`, iconURL: interaction.member.displayAvatarURL() })
            .setTitle(`${flip}`)

        await interaction.reply({ embeds: [embed] });
    },
};
