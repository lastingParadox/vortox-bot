const { SlashCommandBuilder } = require('@discordjs/builders');

const { VortoxColor } = require('../../utilities/enums');
const { VortoxEmbed } = require("../../utilities/embeds");
const Character = require("../../models/characters");
const Location = require("../../models/locations");
const mongoose = require("mongoose");

function validateIntHundred(integer) {
    return (integer >= -100 && integer <= 100);
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('character')
        .setDescription('Character commands.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Adds a character to the database.')
                .addStringOption(option =>
                    option.setName('character_id')
                        .setDescription('The character\'s id to be used in commands. Required.')
                        .setRequired(true)
                )
                .addIntegerOption(option =>
                    option.setName('hp')
                        .setDescription('The character\'s maximum hp. Required.')
                        .setRequired(true)
                )
                .addIntegerOption(option =>
                    option.setName('incorporeal')
                        .setDescription('Whether the character is incorporeal or not. Optional.')
                        .setRequired(false)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('delete')
                .setDescription('Removes a character from the database.')
                .addStringOption(option =>
                    option.setName('character_id')
                        .setDescription('The removed character\'s id.')
                        .setRequired(true)
                )
        )
        .addSubcommandGroup(subcommandGroup =>
            subcommandGroup.setName('edit')
                .setDescription('Character edit commands.')
                .addSubcommand(subcommand =>
                    subcommand.setName('basic')
                        .setDescription('Edit basic attributes (id, name, description).')
                        .addStringOption(option =>
                            option.setName('character_id')
                                .setDescription('The edited character\'s id.')
                                .setRequired(true)
                        )
                        .addStringOption(option =>
                            option.setName('new_id')
                                .setDescription('Edit the character\'s id.')
                                .setRequired(false)
                        )
                        .addStringOption(option =>
                            option.setName('name')
                                .setDescription('Edit the character\'s name.')
                                .setRequired(false))
                        .addStringOption(option =>
                            option.setName('description')
                                .setDescription('Edit the character\'s description.')
                                .setRequired(false)
                        )
                )
                .addSubcommand(subcommand =>
                    subcommand.setName('game')
                        .setDescription('Edit game attributes (max-hp, shield, incorporeal).')
                        .addStringOption(option =>
                            option.setName('character_id')
                                .setDescription('The edited character\'s id.')
                                .setRequired(true)
                        )
                        .addIntegerOption(option =>
                            option.setName('max_hp')
                                .setDescription('Edit the character\'s maximum hit points. Must be greater than 0.')
                                .setRequired(false)
                        )
                        .addIntegerOption(option =>
                            option.setName('shield')
                                .setDescription('Edit the character\'s shield. Must be greater than or equal to 0.')
                                .setRequired(false)
                        )
                        .addBooleanOption(option =>
                            option.setName('incorporeal')
                                .setDescription('Edit whether the character is incorporeal.')
                                .setRequired(false)
                        )
                )
                .addSubcommand(subcommand =>
                    subcommand.setName('resistance')
                        .setDescription('Edit resistance attributes (various).')
                        .addStringOption(option =>
                            option.setName('character_id')
                                .setDescription('The edited character\'s id.')
                                .setRequired(true)
                        )
                        .addIntegerOption(option =>
                            option.setName('sharp')
                                .setDescription('Edit the character\'s sharp resistance, from 0 to 100.')
                                .setRequired(false)
                        )
                        .addIntegerOption(option =>
                            option.setName('blunt')
                                .setDescription('Edit the character\'s blunt resistance, from 0 to 100.')
                                .setRequired(false)
                        )
                        .addIntegerOption(option =>
                            option.setName('explosive')
                                .setDescription('Edit the character\'s explosive resistance, from 0 to 100.')
                                .setRequired(false)
                        )
                        .addIntegerOption(option =>
                            option.setName('plasma')
                                .setDescription('Edit the character\'s plasma resistance, from 0 to 100.')
                                .setRequired(false)
                        )
                        .addIntegerOption(option =>
                            option.setName('laser')
                                .setDescription('Edit the character\'s laser resistance, from 0 to 100.')
                                .setRequired(false)
                        )
                        .addIntegerOption(option =>
                            option.setName('fire')
                                .setDescription('Edit the character\'s fire resistance, from 0 to 100.')
                                .setRequired(false)
                        )
                        .addIntegerOption(option =>
                            option.setName('freeze')
                                .setDescription('Edit the character\'s freeze resistance, from 0 to 100.')
                                .setRequired(false)
                        )
                        .addIntegerOption(option =>
                            option.setName('shock')
                                .setDescription('Edit the character\'s shock resistance, from 0 to 100.')
                                .setRequired(false)
                        )
                        .addIntegerOption(option =>
                            option.setName('biological')
                                .setDescription('Edit the character\'s biological resistance, from 0 to 100.')
                                .setRequired(false)
                        )
                )
                .addSubcommand(subcommand =>
                    subcommand.setName('meta')
                        .setDescription('Edit Discord attributes (image-url, color, author).')
                        .addStringOption(option =>
                            option.setName('character_id')
                                .setDescription('The edited character\'s id.')
                                .setRequired(true)
                        )
                        .addStringOption(option =>
                            option.setName('image_url')
                                .setDescription('Edit the character\'s image.')
                                .setRequired(false)
                        )
                        .addStringOption(option =>
                            option.setName('color')
                                .setDescription('Edit the character\'s color.')
                                .setRequired(false)
                        )
                        .addMentionableOption(option =>
                            option.setName('author')
                                .setDescription('Edit the character\'s author.')
                                .setRequired(false)
                        )
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('info')
                .setDescription('Shows a character\'s details.')
                .addStringOption(option =>
                    option.setName('character_id')
                        .setDescription('The retrieved character\'s id.')
                        .setRequired(true)
                )
        ),

    async execute(interaction) {
        const id = interaction.options.getString('character_id').toLowerCase();
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === "add") {
            const hp = interaction.options.getInteger('hp');
            let incorporeal = interaction.options.getBoolean('incorporeal');
            if (incorporeal === null) incorporeal = false;
            const newCharacter = new Character( {
                _id: new mongoose.Types.ObjectId(),
                id: id,
                name: (id.charAt(0).toUpperCase() + id.slice(1)),
                description: "A character without a curated description.",
                game: {
                    hp: hp,
                    maxHp: hp,
                    shield: 0,
                    incorporeal: incorporeal,
                    resistances: {
                        sharp: 0,
                        blunt: 0,
                        explosive: 0,
                        plasma: 0,
                        laser: 0,
                        fire: 0,
                        freeze: 0,
                        shock: 0,
                        biological: 0
                    }
                },

                meta: {
                    image: "https://polybit-apps.s3.amazonaws.com/stdlib/users/discord/profile/image.png",
                    color: VortoxColor.DEFAULT,
                    guildId: interaction.guildId,
                    author: interaction.member.id
                },

                locations: [],
                quoteAmount: 0
            });

            try {
                await newCharacter.save();
                console.log(`Added character ${id} to the database.`);
            } catch (err) {
                console.log(`Id matching ${id} already exists in the ${interaction.guildId} database, not adding new document.`);
                const failEmbed = new VortoxEmbed(VortoxColor.ERROR, `Error Adding \`${id}\``, `tried to add ${id} to the database.`, interaction.member);
                failEmbed.setDescription(`Character id \`${id}\` in this guild already exists!`);
                await interaction.reply({ embeds: [failEmbed], ephemeral: true });
                return;
            }

            const embed = new VortoxEmbed(VortoxColor.SUCCESS, `Adding Character \`${id}\``, `added character ${id} to the database.`, interaction.member);
            embed.setDescription(`Character id \`${id}\` added to the database!`);

            await interaction.reply({ embeds: [embed] });
        }
        else if (subcommand === 'delete') {

            const locations = await Location.find({ guildId: interaction.guildId });

            const target = await Character.findOne({ id: id, 'meta.guildId': interaction.guildId });

            if (!target) {
                console.log(`No document with id matching ${id} found in the ${interaction.guildId} database.`);
                const embedFail = new VortoxEmbed(VortoxColor.ERROR, `Error Deleting \`${id}\``, `tried to remove character ${id} from the guild database.`, interaction.member);
                embedFail.setDescription(`Character \`${id}\` does not exist in this guild!`);
                interaction.reply({embeds: [embedFail], ephemeral: true});
                return;
            }

            const embedValidate = new VortoxEmbed(VortoxColor.DEFAULT, `Deleting ${target.name} Validation`, `is trying to remove character ${id} from the guild database.`, interaction.member);
            embedValidate.setDescription(`Are you sure you want to delete ${target.name} (ID: \`${id}\`)?\nRespond with \`${id}\`.`);

            const embedSuccess = new VortoxEmbed(VortoxColor.SUCCESS, `Deleting ${target.name}`, `removed character ${id} from the guild database.`, interaction.member);
            embedSuccess.setDescription(`Deleted ${target.name} (ID: \`${id}\`)!`);

            const embedCatch = new VortoxEmbed(VortoxColor.MISS, `Not Deleting ${target.name}`, `tried to remove character ${id} from the guild database.`, interaction.member);
            embedCatch.setDescription(`Message content did not match \`${id}\` or ${interaction.member.displayName} did not respond in time.`);

            const filter = (m) => m.author.id === interaction.member.id;
            await interaction.reply({embeds: [embedValidate], ephemeral: false, fetchReply: true})
                .then(() => {
                    interaction.channel.awaitMessages({filter: filter, max: 1, time: 180000, errors: ['time']})
                        .then(async collected => {
                            if (collected.first().content.toLowerCase() === id) {
                                for (let quote of target.quotes) {
                                    let tempLocation = await locations.find(location => location.id === quote.location);
                                    tempLocation.count--;
                                }
                                console.log(`Removed character ${id} from the database.`)
                                await Character.deleteOne({id: id});
                                for (let location of locations) {
                                    if (location.count === 0) {
                                        console.log(`Removed location ${location.id} from the database.`);
                                        await Location.deleteOne({id: location.id});
                                    } else await location.save();
                                }
                                await collected.first().delete();
                                interaction.editReply({embeds: [embedSuccess], ephemeral: false});
                            } else interaction.editReply({embeds: [embedCatch], ephemeral: false});
                        })
                        .catch(() => {
                            interaction.editReply({embeds: [embedCatch], ephemeral: false});
                        })
                });
        }
        else if (subcommand === 'info') {
            const target = await Character.findOne({ id: id, 'meta.guildId': interaction.guildId }).populate('locations', 'name');

            if (!target) {
                console.log(`No document with id matching ${id} found in the ${interaction.guildId} database.`);
                const embedFail = new VortoxEmbed(VortoxColor.ERROR, `Error Retrieving \`${id}\``, `tried to find character ${id} in the guild database.`, interaction.member);
                embedFail.setDescription(`Character \`${id}\` does not exist in this guild!`);
                interaction.reply({ embeds: [embedFail], ephemeral: true });
                return;
            }

            const fields = [
                { name: "ID", value: `\`${target.id}\``, inline: true },
                { name: "HP", value: `\`${target.game.hp}/${target.game.maxHp}\``, inline: true },
            ]

            if (target.shield > 0) fields.push({ name: "Shield", value: `\`${target.game.shield}\``, inline: true },);
            if (target.game.incorporeal) fields.push({ name: "Incorporeal", value: `\`${target.game.incorporeal}\``, inline: true },);
            let resistanceString = "";
            for (const resistance in target.game.resistances) {
                if (resistance === "$isNew") continue;
                if (target.game.resistances[resistance] >= -100 && target.game.resistances[resistance] <= 100)
                    resistanceString += `\`${resistance}: ${target.game.resistances[resistance]}\`, `
            }
            if (resistanceString.length > 0) {
                resistanceString = resistanceString.slice(0, -2);
                fields.push({ name: "Resistances", value: `${resistanceString}`, inline: true },);
            }
            if (target.locations.length > 0) {
                let locationString = "";
                for (let location of target.locations) {
                    locationString += "`" + location.name + "`\n";
                }
                fields.push({ name: "Locations", value: `${locationString}`, inline: false });
            }
            if (target.quoteAmount > 0) fields.push({ name: "Quote Count", value: `\`${target.quoteAmount}\``, inline: true },);
            fields.push({ name: "Author", value: `<@${target.meta.author}>`, inline: true});

            const embed = new VortoxEmbed(target.meta.color, `${target.name}`, `got information for ${target.name}.`, interaction.member);
            embed.setThumbnail(target.meta.image);
            embed.setDescription(target.description)
                .addFields(fields);

            await interaction.reply({ embeds: [embed] });
        }
        else {
            const target = await Character.findOne({ id: id, 'meta.guildId': interaction.guildId });

            if (!target) {
                console.log(`No document with id matching ${id} found in the ${interaction.guildId} database.`);
                const embedFail = new VortoxEmbed(VortoxColor.ERROR, `Error Retrieving \`${id}\``, `tried to edit character ${id} in the guild database.`, interaction.member);
                embedFail.setDescription(`Character \`${id}\` does not exist in this guild!`);
                interaction.reply({ embeds: [embedFail], ephemeral: true });
                return;
            }

            if (subcommand === 'basic') {
                let newId = interaction.options.getString('new_id');
                if (newId !== null) newId = newId.toLowerCase();
                const name = interaction.options.getString('name');
                const description = interaction.options.getString('description');

                if (newId !== null) {
                    const test = await Character.findOne({ id: newId });

                    if (test !== null) {
                        console.log(`Id matching ${newId} found in the ${interaction.guildId} database, not editing document ${id}.`);
                        const failEmbed = new VortoxEmbed(VortoxColor.ERROR, `Error Editing \`${target.name}\``, `tried to edit ${id} in the guild database.`, interaction.member);
                        failEmbed.setDescription(`Character id \`${newId}\` already exists!`);
                        await interaction.reply({ embeds: [failEmbed], ephemeral: true });
                        return;
                    }

                    target.id = newId;
                }
                if (name !== null) target.name = name;
                if (description !== null) target.description = description;

            }
            else if (subcommand === 'game') {
                const maxHp = interaction.options.getInteger('max_hp');
                const shield = interaction.options.getInteger('shield');
                const incorporeal = interaction.options.getBoolean('incorporeal');

                if (maxHp !== null || shield !== null) {
                    const failEmbed = new VortoxEmbed(VortoxColor.ERROR, `Error Editing \`${target.name}\``, `tried to edit ${id} in the guild database.`, interaction.member);
                    let errorDescription = "";

                    if (maxHp !== null && maxHp <= 0) errorDescription += `Maximum HP must be greater than zero!`;
                    else if (maxHp !== null) target.game.maxHp = maxHp;
                    if (shield !== null && shield < 0) {
                        if (errorDescription.length > 0)
                            errorDescription += `\nShield must be greater than or equal to zero!`
                        else errorDescription += `Shield must be greater than or equal to zero!`
                    }
                    else if (shield !== null) target.game.shield = shield;

                    if (errorDescription.length > 0) {
                        failEmbed.setDescription(errorDescription)
                        await interaction.reply( { embeds: [failEmbed], ephemeral: true });
                        return;
                    }
                }
                if (incorporeal !== null) target.game.incorporeal = incorporeal;

            }
            else if (subcommand === 'resistance') {
                const sharp = interaction.options.getInteger('sharp');
                const blunt = interaction.options.getInteger('blunt');
                const explosive = interaction.options.getInteger('explosive');
                const plasma = interaction.options.getInteger('plasma');
                const laser = interaction.options.getInteger('laser');
                const fire = interaction.options.getInteger('fire');
                const freeze = interaction.options.getInteger('freeze');
                const shock = interaction.options.getInteger('shock');
                const biological = interaction.options.getInteger('biological');
                const resistanceArray = [sharp, blunt, explosive, plasma, laser, fire, freeze, shock, biological];

                for (const number of resistanceArray) {
                    console.log(number);
                    if (!number) continue;
                    if (!validateIntHundred(number)) {
                        const failEmbed = new VortoxEmbed(VortoxColor.ERROR, `Error Editing \`${target.name}\``, `tried to edit ${id} in the guild database.`, interaction.member);
                        failEmbed.setDescription(`Resistances must be between 0 and 100 (inclusive)!`)
                        await interaction.reply( { embeds: [failEmbed], ephemeral: true });
                        return;
                    }
                }

                let counter = 0;
                for (const resistance in target.game.resistances) {
                    if (resistanceArray[counter] !== null) target.game.resistances[resistance] = resistanceArray[counter];
                    counter++;
                }
            }
            else {
                const image = interaction.options.getString('image_url');
                const color = interaction.options.getString('color');
                const author = interaction.options.getMentionable('author');

                if (image !== null) target.meta.image = image;
                if (color !== null) target.meta.color = color;
                if (author !== null) target.meta.author = author.id;
            }

            target.save();
            const successEmbed = new VortoxEmbed(VortoxColor.SUCCESS, `Editing ${target.name}`, `edited ${target.name} in the guild database.`, interaction.member);
            successEmbed.setDescription(`Successfully edited ${target.name}!`);

            await interaction.reply({ embeds: [successEmbed] });
        }
    }
}
