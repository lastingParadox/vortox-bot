const { SlashCommandBuilder } = require('@discordjs/builders');
const Character = require("../../models/characters");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('test')
        .setDescription('Tests population'),

    async execute(interaction) {

        const zingo = await Character.findOne({ id: "zingo" }).populate("locations");

        console.log(zingo);
        let output = zingo.locations;

        await interaction.reply(output.join())
    }
};
