const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('addtype')
		.setDescription('Adds a weapon type to the list.')
        .addStringOption(option =>
            option.setName('id')
                .setDescription('The type\'s id to be used in commands.')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('missrate')
                .setDescription('The types\'s miss rate, in percentage.')
                .setRequired(true)),

	async execute(interaction) {
        const id = interaction.options.getString('id');
        const missrate = interaction.options.getInteger('missrate');
        const temp = {
            "id": id,
            "missrate": missrate
        };

        const jsonString = fs.readFileSync('./items/types.json')
        const types = JSON.parse(jsonString)
        
        types.push(temp);

        fs.writeFile('./items/types.json', JSON.stringify(types, null, 2), err => {
            if (err) {
                console.log('Error writing to types.json.', err);
            }
            else {
                console.log("types.json successfully written to!")
            }
        })

		await interaction.reply(`Successfully added \`${id}\` with accuracy \`${missrate}%\` to the weapon types list!`);
	},
};
