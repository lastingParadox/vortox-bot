const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const mongoose = require('mongoose');
const {characterSchema} = require("../../models/characters");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reset')
        .setDescription('Resets the hp of the specified character.')
        .addStringOption(option =>
            option.setName('id')
                .setDescription('The id of the character to be reset. (Or \'all\')')
                .setRequired(true)),
    category: "Tabletop",

    async execute(interaction) {
        const id = interaction.options.getString('id');
        const Character = mongoose.model('Character', characterSchema)

        const embed = new MessageEmbed()
            .setColor('#FF0000')
            .setTitle(`Resetting`);

        if (id === "all") {
            await Character.find({ guildId: interaction.guildId }).then(characters => {
                characters.forEach(character => {
                    character.hp = character.maxHp;
                    character.save();
                });
                embed.setDescription('All characters were successfully reset!');
            });
        }
        else {
            try {
                await Character.find({ id: id, guildId: interaction.guildId }).then(character => {
                    character[0].hp = character[0].maxHp;
                    character[0].save();
                    embed.setDescription(`${character[0].name} was successfully reset!\n${character[0].name} now has \`(${character[0].hp}/${character[0].maxHp})\` hp.`)
                })
            } catch (err) {
                embed.setDescription(`Character \`${id}\` was not found!`);
                return interaction.reply({ embeds: [embed] });
            }

        }

        embed.setColor('#FFA500');

        await interaction.reply({ embeds: [embed] });
    },
};