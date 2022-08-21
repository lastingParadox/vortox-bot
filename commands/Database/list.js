const { SlashCommandBuilder } = require('@discordjs/builders');

const mongoose = require("mongoose");
const { characterSchema } = require("../../models/characters");
const { weaponSchema } = require("../../models/weapons");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('list')
        .setDescription('Lists items from the database.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('characters')
                .setDescription('List all characters.')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('weapons')
                .setDescription('List all weapons.')
        ),

    async execute(interaction) {
        let model;
        let output;

        if (interaction.options.getSubcommand() === 'characters') {
            model = mongoose.model("Characters", characterSchema);
            const characterList = await model.find().sort('id');

            output = `\`\`\`List of All Characters\n\n` + `id`.padEnd(20) + `| ` + `name`.padEnd(30) + `| hp\n` + "-".repeat(70) + "\n";

            for (let character of characterList) {
                output += `${character.id.padEnd(20, ' ')}| ${character.name.padEnd(30, ' ')}| ${character.game.hp}/${character.game.maxHp}\n`
            }
        }
        else {
            model = mongoose.model("Weapons", weaponSchema);
            const weaponList = await model.find().sort('id');

            output = `\`\`\`List of All Weapons\n\n` + `id`.padEnd(20) + `| ` + `name`.padEnd(30) + `| damage type\n` + "-".repeat(70) + "\n";

            for (let weapon of weaponList) {
                output += `${weapon.id.padEnd(20, ' ')}| ${weapon.name.padEnd(30, ' ')}| ${weapon.damageType}\n`
            }
        }

        output += `\`\`\``

        await interaction.reply(output);
    },
};