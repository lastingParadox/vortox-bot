const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const mongoose = require('mongoose');
const { characterSchema } = require("../../models/characters");
const { VortoxColor } = require("../../utilities/enums");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reset')
        .setDescription('Resets the hp of the specified character.')
        .addStringOption(option =>
            option.setName('char_id')
                .setDescription('The id of the character to be reset. (Or \'all\')')
                .setRequired(true)),
    category: "Tabletop",

    async execute(interaction) {
        const id = interaction.options.getString('char_id').toLowerCase();
        const Character = mongoose.model('Character', characterSchema);

        const embed = new EmbedBuilder().setTitle('Resetting')

        if (id === "all") {
            await Character.find({ guildId: interaction.guildId }).then(characters => {
                for (let character of characters) {
                    character.game.hp = character.game.maxHp;
                    character.save();
                }
                embed.setColor(VortoxColor.DEFAULT)
                    .setDescription('All characters were reset!')
                    .setFooter({
                        iconURL: interaction.member.displayAvatarURL(),
                        text: `${interaction.member.displayName} reset all characters.`
                    });
            });
        }
        else {
            try {
                await Character.findOne({ id: id }).then(character => {
                    character.game.hp = character.game.maxHp;
                    character.save();
                    embed.setColor(VortoxColor.DEFAULT)
                        .setTitle(`Resetting ${character.name}`)
                        .setDescription(`${character.name} was reset!\n${character.name} now has \`(${character.game.hp}/${character.game.maxHp})\` hp.`)
                        .setFooter({
                            iconURL: interaction.member.displayAvatarURL(),
                            text: `${interaction.member.displayName} reset ${character.name}.`
                        });
                })
            } catch (err) {
                embed.setDescription(`Character \`${id}\` was not found!`);
                return interaction.reply({ embeds: [embed] });
            }

        }

        await interaction.reply({ embeds: [embed] });
    },
};