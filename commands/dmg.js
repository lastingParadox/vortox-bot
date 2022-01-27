const { SlashCommandBuilder, underscore } = require('@discordjs/builders');
const fs = require('fs');
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

        const weaponString = fs.readFileSync('./items/weapons.json');
        const typeString = fs.readFileSync('./items/types.json');

        const weaponslist = JSON.parse(weaponString);
        const typeslist = JSON.parse(typeString);
        
        const weapon = weaponslist.find(e => e.id === id);
        if (weapon === undefined) {
            await interaction.reply(`Weapon id \`${id}\` not found!`);
            return
        }
        const type = typeslist.find(e => e.id === weapon.type);

        if (type === undefined)
            await interaction.reply(`Weapon type \`${weapon.type}\` not found!`);
        else {
            const accuracy = Math.floor(Math.random() * 100) + 1;

            if(accuracy <= type.missrate) {
                await interaction.reply(`Rolling for ${id} accuracy...\nRolled a \`${accuracy}\`!\nThe attack misses!`);
            }
            else {
                const damage = diceRoller.rollValue(weapon.damage);
                await interaction.reply(`Rolling for ${id} accuracy...\nRolled a \`${accuracy}\`!\nThe attack hits for \`${damage}\` damage!`);
            }
        }
	},
};
