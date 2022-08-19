const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

const mongoose = require("mongoose");
const { characterSchema } = require('../../models/characters')
const { weaponSchema } = require('../../models/weapons')
const { locationSchema } = require("../../models/locations");

const { VortoxColor } = require("../../utilities/enums");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('delete')
        .setDescription('Deletes a weapon or character.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('character')
                .setDescription('Delete a pre-existing character.')
                .addStringOption(option =>
                    option.setName('id')
                        .setDescription('The character\'s id to be deleted.')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('weapon')
                .setDescription('Delete a pre-existing weapon.')
                .addStringOption(option =>
                    option.setName('id')
                        .setDescription('The weapon\'s id to be deleted.')
                        .setRequired(true))),

    async execute(interaction) {

        const id = interaction.options.getString('id').toLowerCase();

        const embedValidate = new EmbedBuilder()
            .setColor(VortoxColor.DEFAULT)
            .setTitle(`Deleting \`${id}\` Validation`)
            .setDescription(`Are you sure you want to delete \`${id}\`? Respond with \`${id}\`.`);

        const embedSuccess = new EmbedBuilder()
            .setColor(VortoxColor.SUCCESS)
            .setTitle(`Deleting \`${id}\` Successful`)
            .setDescription(`Deleted ${interaction.options.getSubcommand()} \`${id}\`!`);

        const embedFail = new EmbedBuilder()
            .setColor(VortoxColor.ERROR)
            .setTitle(`Not Deleting \`${id}\``)
            .setDescription(`Message content did not match \`${id}\` or ${interaction.member.displayName} did not respond in time.`)

        const Location = mongoose.model('Location', locationSchema);
        const locations = await Location.find({ guildId: interaction.guildId });
        let locationArray = [];

        locations.forEach(location => locationArray.push(location));

        let model;

        if (interaction.options.getSubcommand() === "character") model = mongoose.model('Character', characterSchema);
        else if (interaction.options.getSubcommand() === "weapon") model = mongoose.model('Weapons', weaponSchema);

        const temp = await model.findOne({ id: id });

        if (!temp) {
            console.log(`No document with id matching ${id} found in the database.`)
            embedFail.setTitle(`Deleting \`${id}\` Failed!`)
                .setDescription(`\`${id}\` does not exist!`)
            interaction.reply({ embeds: [embedFail] });
            return;
        }

        const deleteDoc = async () => {
            try {
                console.log(`Deleted ${temp.name}! (Id: ${temp.id})`);
                return model.deleteOne({ id: id, guildId: interaction.guildId });
            } catch (err) {
                console.log(err);
            }
        }

        const filter = (m) => m.author.id === interaction.member.id;
        await interaction.reply({ embeds: [embedValidate], ephemeral: false,  fetchReply: true })
            .then(() => {
                interaction.channel.awaitMessages({ filter: filter, max: 1, time: 180000, errors: ['time'] })
                    .then(collected => {
                        if(collected.first().content.toLowerCase() === id) {
                            temp.quotes.forEach(quote => {
                                let tempLocation = locationArray.find(location => location.id === quote.location);
                                tempLocation.count--;
                            })
                            deleteDoc();
                            locationArray.forEach(async location => {
                                if(location.count === 0) await Location.deleteOne({id: location.id});
                                else await location.save();
                            })
                            interaction.editReply({ embeds: [embedSuccess], ephemeral: false });
                        }
                        else interaction.editReply({ embeds: [embedFail], ephemeral: false });
                    })
                    .catch(() => {
                        interaction.editReply( { embeds: [embedFail], ephemeral: false });
                    })
            });
    },
};
