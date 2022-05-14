const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { DiceRoller } = require('dice-roller-parser');
const diceRoller = new DiceRoller();

const mongoose = require("mongoose");
const { characterSchema } = require('../../models/characters')


module.exports = {
	data: new SlashCommandBuilder()
		.setName('heal')
		.setDescription('Heals a character.')
        .addStringOption(option =>
            option.setName('characterid')
                .setDescription('The character to be healed.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('roll')
                .setDescription('The amount of healing to give. Can be static.')
                .setRequired(true)),
    category: "Tabletop",

	async execute(interaction) {
        const weaponId = interaction.options.getString('weaponid');
        const characterId = interaction.options.getString('characterid');
        const roll = interaction.options.getString('roll')

        const Character = mongoose.model('Character', characterSchema);
        let character;

        const embed = new MessageEmbed()
            .setColor('#FF0000')
            .setTitle(`Healing \`${characterId}\` Failed`)

        try {
            character = await Character.findOne({ id: characterId });
            if (!character) throw new Error(`No document with id matching ${characterId} found.`);
        } catch (err) {
            console.log(err);
            embed.setDescription(`\`${characterId}\` does not exist!`)
            interaction.reply({ embeds: [embed] });
            return;
        }

        const healing = diceRoller.rollValue(roll);
        character.hp += healing;

        embed.setTitle(`Healing for \`${character.name}\`!`);
        embed.setDescription(`${character.name} is healed for \`${healing}\` hp!\n` +
            `${character.name} now has \`(${character.hp}/${character.maxHp})\` hp.`);

        character.save();

        embed.setColor('#50C878');
        await interaction.reply({ embeds: [embed] });
	},
};
