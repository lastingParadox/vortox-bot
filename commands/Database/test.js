const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { VortoxColor } = require('../../utilities/enums');
const fs = require('fs');
const path = require("path");
const mongoose = require("mongoose");
const {characterSchema} = require("../../models/characters");
const {locationSchema} = require("../../models/locations");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('test')
        .setDescription('Tests population'),

    async execute(interaction) {
        let Character = mongoose.model("Characters", characterSchema);
        let Location = mongoose.model("Locations", locationSchema);

        const zingo = await Character.findOne({ id: "zingo" }).populate("locations");

        console.log(zingo);
        let output = zingo.locations;

        await interaction.reply(output.join())
    }
};
