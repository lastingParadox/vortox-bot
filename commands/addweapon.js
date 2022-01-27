const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('addweapon')
		.setDescription('Adds a weapon to the list.')
        .addStringOption(option =>
            option.setName('id')
                .setDescription('The weapon\'s id to be used in commands.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('type')
                .setDescription('The weapon\'s weapon type.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('damage')
                .setDescription('The weapon\'s damage roll.')
                .setRequired(true)),

	async execute(interaction) {
        const id = interaction.options.getString('id');
        const type = interaction.options.getString('type');
        const damage = interaction.options.getString('damage');

        let jsonString = fs.readFileSync('./items/types.json');
        const types = JSON.parse(jsonString);

        if (types.find(e => e.id === type) === undefined) {
            await interaction.reply(`Weapon type \`${type}\` doesn't exist!`);
            return;
        };

        const temp = {
            "id": id,
            "type": type,
            "damage": damage
        };

        jsonString = fs.readFileSync('./items/weapons.json');
        const weapons = JSON.parse(jsonString);
        
        weapons.push(temp);

        fs.writeFile('./items/weapons.json', JSON.stringify(weapons, null, 2), err => {
            if (err) {
                console.log('Error writing to weapons.json.', err);
            }
            else {
                console.log("weapons.json successfully written to!");
            }
        });

		await interaction.reply(`Successfully added \`${id}\` with damage roll \`${damage}\` to the weapon list!`);
	},
};
