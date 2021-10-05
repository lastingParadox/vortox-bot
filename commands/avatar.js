const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Get the avatar URL of the selected user, or your own avatar.')
        .addUserOption(option => option.setName('target').setDescription('The user\'s avatar to show')),

    async execute(interaction) {
        const user = interaction.options.getUser('target');
        let embed = new MessageEmbed();

        if (user) {
            embed = new MessageEmbed()
                .setColor('RANDOM')
                .setTitle(`${user.username}'s Avatar`)
                .setURL(`${user.displayAvatarURL({ dynamic: true })}`)
                .setImage(`${user.displayAvatarURL({ dynamic: true })}`);
        }
        else {
            embed = new MessageEmbed()
                .setColor('RANDOM')
                .setTitle(`${interaction.user.username}'s Avatar`)
                .setURL(`${interaction.user.displayAvatarURL({ dynamic: true })}`)
                .setImage(`${interaction.user.displayAvatarURL({ dynamic: true })}`);
        }

        await interaction.reply({ embeds: [embed] });
    },
};