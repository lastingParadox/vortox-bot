const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { DiceRoller } = require('dice-roller-parser');
const diceRoller = new DiceRoller();

const mongoose = require("mongoose");
const { characterSchema } = require('../../models/characters')
const { weaponSchema } = require('../../models/weapons')
const { typeSchema } = require('../../models/types')


module.exports = {
	data: new SlashCommandBuilder()
		.setName('dmg')
		.setDescription('Rolls for damage.')
        .addStringOption(option =>
            option.setName('weaponid')
                .setDescription('The weapon\'s id.')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('characterid')
                .setDescription('The character to be damaged.')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('roll')
                .setDescription('The amount of damage to deal if a weapon isn\'t used. Can be static.')
                .setRequired(false)),
    category: "Tabletop",

	async execute(interaction) {
        const weaponId = interaction.options.getString('weaponid');
        const characterId = interaction.options.getString('characterid');
        const roll = interaction.options.getString('roll')

        const Character = mongoose.model('Character', characterSchema);
        const Weapon = mongoose.model('Weapon', weaponSchema);

        let character;
        let weapon;

        const embed = new MessageEmbed()
            .setColor('#FF0000')
            .setTitle(`Rolling for Damage Failed!`);

        if (characterId !== null) {
            try {
                character = await Character.findOne({ id: characterId, guildId: interaction.guildId });
                if (!character) throw new Error(`No document with id matching ${characterId} found.`);
            } catch (err) {
                console.log(err);
                embed.setDescription(`\`${characterId}\` does not exist!`)
                interaction.reply({ embeds: [embed] });
                return;
            }
        }

        if (weaponId !== null) {
            try {
                weapon = await Weapon.findOne({ id: weaponId, guildId: interaction.guildId });
                if (!weapon) throw new Error(`No document with id matching ${weaponId} found.`);
            } catch (err) {
                console.log(err);
                embed.setDescription(`\`${weaponId}\` does not exist!`)
                interaction.reply({ embeds: [embed] });
                return;
            }
        }

        if (weaponId !== null) {

            const Type = mongoose.model('Type', typeSchema);
            const type = await Type.findOne({ id: weapon.type, guildId: interaction.guildId })

            const accuracy = Math.floor(Math.random() * 100) + 1;

            if(accuracy <= type.missRate) {
                embed.setTitle(`${weapon.name} Attack Missed!`)
                    .setDescription(`Rolling for ${weapon.name} accuracy...\nRolled a ${accuracy}!\nThe attack misses!`)
                    .setColor('#E34234');
                await interaction.reply({ embeds: [embed] });
                return;
            }

            const damage = diceRoller.rollValue(weapon.damage);

            embed.setTitle(`${weapon.name} did \`${damage}\` Damage!`)
                 .setDescription(`Rolling for ${weapon.name} accuracy...\nRolled a ${accuracy}!\nThe attack hits for \`${damage}\` damage!`)

            if (characterId !== null) {

                character.hp -= damage;

                embed.setTitle(`${weapon.name} did \`${damage}\` Damage to \`${character.name}\`!`)
                     .setDescription(`Rolling for ${weapon.name} accuracy...\n` +
                    `Rolled a ${accuracy}!\n` +
                    `The attack hits for \`${damage}\` damage!\n` +
                    `${character.name} now has \`(${character.hp}/${character.maxHp})\` hp.`);

                character.save();
            }

        }
        else if (characterId !== null && roll !== null) {
            let damage;

            try {
                damage = diceRoller.rollValue(roll)
            }
            catch (SyntaxError) {
                embed.setDescription(`Invalid dice format!`);
                await interaction.reply({ embeds: [embed] });
                return;
            }

            character.hp -= damage;

            embed.setTitle(`Damage to \`${character.name}\`!`)
                 .setDescription(`${character.name} is hit for \`${damage}\` damage!\n` +
                     `${character.name} now has \`(${character.hp}/${character.maxHp})\` hp.`);

            character.save();
        }
        else {
            embed.setTitle("Unable to Roll Damage!")
                 .setDescription("Please include one of the following combinations:\n-A weaponID\n-A weaponID and a characterID\n-A characterID and a roll value")
            await interaction.reply({ embeds: [embed] });
            return;
        }

        embed.setColor('#50C878');
        await interaction.reply({ embeds: [embed] });
	},
};
