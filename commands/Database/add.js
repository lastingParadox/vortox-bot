const { SlashCommandBuilder } = require('@discordjs/builders');
const { DiceRoller, RollInitializeError } = require('vortox-dice-parser');
const { EmbedBuilder } = require('discord.js');

const mongoose = require("mongoose");
const { characterSchema } = require('../../models/characters');
const { weaponSchema } = require('../../models/weapons');

const { VortoxColor } = require('../../utilities/enums');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('add')
        .setDescription('Adds to the database.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('character')
                .setDescription('Adds a character to the database.')
                .addStringOption(option =>
                    option.setName('id')
                        .setDescription('The character\'s id to be used in commands.')
                        .setRequired(true)
                )
                .addIntegerOption(option =>
                    option.setName('hp')
                        .setDescription('The character\'s maximum hp.')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('weapon')
                .setDescription('Adds a weapon to the database.')
                .addStringOption(option =>
                option.setName('id')
                    .setDescription('The weapon\'s id to be used in commands.')
                    .setRequired(true)
                )
                .addStringOption(option =>
                option.setName('type')
                    .setDescription('The weapon\'s type to be used in calculating damage.')
                    .setRequired(true)
                    .addChoices(
                        { name: 'Sharp', value: 'sharp' },
                        { name: 'Blunt', value: 'blunt' },
                        { name: 'Explosive', value: 'explosive' },
                        { name: 'Plasma', value: 'plasma' },
                        { name: 'Laser', value: 'laser' },
                        { name: 'Fire', value: 'fire' },
                        { name: 'Freeze', value: 'freeze' },
                        { name: 'Shock', value: 'shock' },
                        { name: 'Biological', value: 'biological' },
                    )
                )
                .addStringOption(option =>
                option.setName('damage')
                    .setDescription('The weapon\'s dice expression to be used in calculating damage.')
                    .setRequired(true)
                )
                .addIntegerOption(option =>
                    option.setName('missrate')
                        .setDescription('The weapon\'s probability of missing, to be used in calculating damage. (Range: 0 - 100)')
                        .setRequired(false)
                )
        ),

    async execute(interaction) {
        const id = interaction.options.getString('id').toLowerCase();
        const addType = interaction.options.getSubcommand();

        const embed = new EmbedBuilder();

        if (addType === "character") {
            const hp = interaction.options.getInteger('hp');
            const Character = mongoose.model('Character', characterSchema);
            const newCharacter = new Character( {
                id: id,
                name: (id.charAt(0).toUpperCase() + id.slice(1)),
                description: "A character without a curated description.",
                game: {
                    hp: hp,
                    maxHp: hp,
                    shield: 0,
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
                quotes: [],
                quoteAmount: 0
            });

            try {
                await newCharacter.save();
                console.log(`Added character ${id} to the database.`);
            } catch (err) {
                console.log(err);
                embed.setColor(VortoxColor.ERROR)
                    .setTitle(`Adding \`${id}\` Failed!`)
                    .setDescription(`Character id \`${id}\` already exists!`)
                    .setFooter({
                        iconURL: interaction.member.displayAvatarURL(),
                        text: `${interaction.member.displayName} tried to add character ${id} to the database.`
                    });
                await interaction.reply({ embeds: [embed], ephemeral: true });
                return;
            }

            embed.setColor(VortoxColor.SUCCESS)
                .setTitle(`Adding \`${id}\` Succeeded!`)
                .setDescription(`Character id \`${id}\` added to the database!`)
                .setFooter({
                    iconURL: interaction.member.displayAvatarURL(),
                    text: `${interaction.member.displayName} added character ${id} to the database.`
                });

            await interaction.reply({ embeds: [embed] });
        }
        else {
            const damage = interaction.options.getString('damage');
            const type = interaction.options.getString('type');
            let missRate = interaction.options.getInteger('missrate');
            if (missRate === null)
                missRate = 20;

            try {
                new DiceRoller(damage);
            } catch (error) {
                if (error instanceof RollInitializeError) {
                    embed.setColor(VortoxColor.ERROR)
                        .setTitle(`Adding \`${id}\` Failed`)
                        .setDescription("Dice syntax is invalid!")
                        .setFooter({
                            iconURL: interaction.member.displayAvatarURL(),
                            text: `${interaction.member.displayName} tried to add weapon ${id} to the database.`
                        });
                    await interaction.reply({ embeds: [embed], ephemeral: true });
                    return;
                }
            }

            const Weapon = mongoose.model('Weapon', weaponSchema);
            const newWeapon = new Weapon( {
                id: id,
                name: (id.charAt(0).toUpperCase() + id.slice(1)),
                description: "A weapon without a curated description.",
                damageType: type,
                damage: damage,
                missRate: missRate,
                guildId: interaction.guildId,
                author: interaction.member.id
            });

            try {
                await newWeapon.save();
                console.log(`Added weapon ${id} to the database.`);
            } catch (err) {
                console.log(err);
                embed.setColor(VortoxColor.ERROR)
                    .setTitle(`Adding \`${id}\` Failed!`)
                    .setDescription(`Weapon id \`${id}\` already exists!`)
                    .setFooter({
                        iconURL: interaction.member.displayAvatarURL(),
                        text: `${interaction.member.displayName} tried to add weapon ${id} to the database.`
                    });
                await interaction.reply({ embeds: [embed], ephemeral: true });
                return;
            }

            embed.setColor(VortoxColor.SUCCESS)
                .setTitle(`Adding \`${id}\` Succeeded!`)
                .setDescription(`Weapon id \`${id}\` added to the database!`)
                .setFooter({
                    iconURL: interaction.member.displayAvatarURL(),
                    text: `${interaction.member.displayName} added weapon ${id} to the database.`
                });

            await interaction.reply({ embeds: [embed] });
        }
    }
}
