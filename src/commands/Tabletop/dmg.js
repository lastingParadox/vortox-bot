const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const fs = require('fs');
const { workingDir } = require('../../config.json');
const { DiceRoller } = require('dice-roller-parser');
const diceRoller = new DiceRoller();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('dmg')
		.setDescription('Rolls for the damage of a weapon.')
        .addStringOption(option =>
            option.setName('id')
                .setDescription('The weapon\'s id.')
                .setRequired(true)),

	async execute(interaction) {
        const id = interaction.options.getString('id');

        const weaponString = fs.readFileSync(workingDir + `items\\weapons.json`);
        const typeString = fs.readFileSync(workingDir + `items\\types.json`);

        const weaponslist = JSON.parse(weaponString);
        const typeslist = JSON.parse(typeString);
        
        const embed = new MessageEmbed()
            .setColor('#FFA500')
            .setTitle(`Rolling for ${id} Damage`)
            .setTimestamp();

        const weapon = weaponslist.find(e => e.id === id);

        if (weapon === undefined) {
            embed.setColor('#FF0000');
            embed.setDescription(`Weapon id \`${id}\` not found!`);
            await interaction.reply({ embeds: [embed] });
            return;
        }

        const type = typeslist.find(e => e.id === weapon.type);

        if (type === undefined) {
            embed.setColor('#FF0000');
            embed.setDescription(`Weapon type \`${weapon.type}\` not found!`);
            await interaction.reply({ embeds: [embed] });
        }
        else {
            const accuracy = Math.floor(Math.random() * 100) + 1;
            const name = weapon.name.charAt(0).toUpperCase() + weapon.name.slice(1);

            if(accuracy <= type.missrate) {
                embed.setTitle(`${name} Attack Missed!`);
                embed.setDescription(`Rolling for ${name} accuracy...\nRolled a ${accuracy}!\nThe attack misses!`)
                embed.setColor('#E34234');
                await interaction.reply({ embeds: [embed] });
            }
            else {
                const damage = diceRoller.rollValue(weapon.damage);
                embed.setTitle(`${name} did \`${damage}\` Damage!`);
                embed.setDescription(`Rolling for ${name} accuracy...\nRolled a ${accuracy}!\nThe attack hits for \`${damage}\` damage!`)
                embed.setColor('#50C878');
                await interaction.reply({ embeds: [embed] });
            }
        }
	},
};
