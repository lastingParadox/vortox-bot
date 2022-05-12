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
                .setRequired(true))
        .addStringOption(option => {
            option.setName('character')
                .setDescription('The character to be damaged.')
                .setRequired(false)
                //let choices;
                //let readChars = fs.readFileSync(workingDir + `items\\characters.json`);
                //choices = JSON.parse(readChars);

                //for (let type of choices) {
                //    option.addChoice(type.id, type.id);
                //}
                return option;
                }),
    category: "Tabletop",

	async execute(interaction) {
        const id = interaction.options.getString('id');
        const characterid = interaction.options.getString('character');

        const weaponString = fs.readFileSync(workingDir + `items\\weapons.json`);
        const typeString = fs.readFileSync(workingDir + `items\\types.json`);
        const charString = fs.readFileSync(workingDir + `items\\characters.json`);

        const weaponslist = JSON.parse(weaponString);
        const typeslist = JSON.parse(typeString);
        const charlist = JSON.parse(charString);
        
        const embed = new MessageEmbed()
            .setColor('#FF0000')
            .setTitle(`Rolling for ${id} Damage`)

        const weapon = weaponslist.find(e => e.id === id.toLowerCase());

        if (weapon === undefined) {
            embed.setDescription(`Weapon id \`${id}\` not found!`);
            await interaction.reply({ embeds: [embed] });
            return;
        }

        const type = typeslist.find(e => e.id === weapon.type);

        if (type === undefined) {
            embed.setDescription(`Weapon type \`${weapon.type}\` not found!`);
            await interaction.reply({ embeds: [embed] });
            return;
        }

        const accuracy = Math.floor(Math.random() * 100) + 1;
        const name = weapon.name.charAt(0).toUpperCase() + weapon.name.slice(1);

        if(accuracy <= type.missrate) {
            embed.setTitle(`${name} Attack Missed!`);
            embed.setDescription(`Rolling for ${name} accuracy...\nRolled a ${accuracy}!\nThe attack misses!`)
            embed.setColor('#E34234');
            await interaction.reply({ embeds: [embed] });
            return;
        }

        const damage = diceRoller.rollValue(weapon.damage);

        if (characterid !== null) {
            const character = charlist.find(e => e.id === characterid.toLowerCase());
            if (character === undefined) {
                embed.setDescription(`Character id \`${characterid}\` not found!`);
                await interaction.reply({ embeds: [embed] });
                return;
            }
            else {
                character.hp -= damage;

                fs.writeFile(workingDir + `items\\characters.json`, JSON.stringify(charlist, null, 2), async err => {
                    if (err) {
                        console.log('Error writing to character.json.', err);
                        embed.setTitle(`Editing Character ${characterid} Failed!`);
                        embed.setDescription(`Failed to edit \`${characterid}!\` (Check the console.)`);
                        await interaction.reply({embeds: [embed]});
                        return;
                    } else {
                        console.log("characters.json successfully written to!");
                    }
                });

                embed.setTitle(`${name} did \`${damage}\` Damage to \`${character.name}\`!`);
                embed.setDescription(`Rolling for ${name} accuracy...\n` +
                                     `Rolled a ${accuracy}!\n` +
                                     `The attack hits for \`${damage}\` damage!\n` +
                                     `\`${character.name}\` now has \`${character.hp}\` ` +
                                     `(out of \`${character.maxhp}\`) hp!`);
                embed.setColor('#50C878');
                await interaction.reply({ embeds: [embed] });
                return;
            }
        }

        embed.setTitle(`${name} did \`${damage}\` Damage!`);
        embed.setDescription(`Rolling for ${name} accuracy...\nRolled a ${accuracy}!\nThe attack hits for \`${damage}\` damage!`)
        embed.setColor('#50C878');
        await interaction.reply({ embeds: [embed] });
	},
};
