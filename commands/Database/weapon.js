const { SlashCommandBuilder } = require('@discordjs/builders');
const { DiceRoller, RollInitializeError, InfinityError} = require('vortox-dice-parser');

const mongoose = require("mongoose");
const { weaponSchema } = require('../../models/weapons');

const { VortoxColor } = require('../../utilities/enums');
const { VortoxEmbed } = require("../../utilities/embeds");
module.exports = {
    data: new SlashCommandBuilder()
        .setName('weapon')
        .setDescription('Weapon commands.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Adds a weapon to the database.')
                .addStringOption(option =>
                    option.setName('weapon_id')
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
                            { name: 'Incorporeal', value: 'incorporeal' }
                        )
                )
                .addStringOption(option =>
                    option.setName('damage')
                        .setDescription('The weapon\'s dice expression to be used in calculating damage.')
                        .setRequired(true)
                )
                .addIntegerOption(option =>
                    option.setName('miss_rate')
                        .setDescription('The weapon\'s probability of missing, to be used in calculating damage. (Range: 0 - 100)')
                        .setRequired(false)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('delete')
                .setDescription('Removes a weapon from the database.')
                .addStringOption(option =>
                    option.setName('weapon_id')
                        .setDescription('The removed weapon\'s id.')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('edit')
                .setDescription('Edit weapon attributes.')
                .addStringOption(option =>
                    option.setName('weapon_id')
                        .setDescription('The edited weapon\'s id.')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName('new_id')
                        .setDescription('Edit the weapon\'s id.')
                        .setRequired(false)
                )
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('Edit the weapon\'s name.')
                        .setRequired(false)
                )
                .addStringOption(option =>
                    option.setName('description')
                        .setDescription('Edit the weapon\'s description.')
                        .setRequired(false)
                )
                .addStringOption(option =>
                    option.setName('damage_type')
                        .setDescription('Edit the weapon\'s damage type.')
                        .setRequired(false)
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
                            { name: 'Incorporeal', value: 'incorporeal' }
                        )
                )
                .addStringOption(option =>
                    option.setName('damage')
                        .setDescription('Edit the weapon\'s damage roll expression.')
                        .setRequired(false)
                )
                .addIntegerOption(option =>
                    option.setName('miss_rate')
                        .setDescription('Edit the weapon\'s miss rate. Must be a value between 0 and 100 inclusive.')
                        .setRequired(false)
                )
                .addMentionableOption(option =>
                    option.setName('author')
                        .setDescription('Edit the weapon\'s author.')
                        .setRequired(false)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('info')
                .setDescription('Shows a weapon\'s details.')
                .addStringOption(option =>
                    option.setName('weapon_id')
                        .setDescription('The retrieved weapon\'s id.')
                        .setRequired(true)
                )
        ),

    async execute(interaction) {
        const id = interaction.options.getString('weapon_id').toLowerCase();
        const subcommand = interaction.options.getSubcommand();
        const Weapon = mongoose.model('Weapons', weaponSchema);

        if (subcommand === "add") {
            const damage = interaction.options.getString('damage');
            const type = interaction.options.getString('type');
            let missRate = interaction.options.getInteger('miss_rate');
            if (missRate === null)
                missRate = 20;

            let roller;
            try {
                roller = new DiceRoller(damage);
            } catch (error) {
                if (error instanceof RollInitializeError || error instanceof InfinityError) {
                    const failEmbed = new VortoxEmbed(VortoxColor.ERROR, `Error Adding Weapon \`${id}\``, `tried to add weapon ${id} to the guild database.`, interaction.member);
                    failEmbed.setDescription("Dice syntax is invalid!")
                    await interaction.reply({ embeds: [failEmbed], ephemeral: true });
                    return;
                }
            }

            if (roller.getMin() <= 0 || roller.getMin() === null) {
                const failEmbed = new VortoxEmbed(VortoxColor.ERROR, `Error Adding Weapon \`${id}\``, `tried to add weapon ${id} to the guild database.`, interaction.member);
                failEmbed.setDescription("Damage cannot have the possibility of being negative!")
                await interaction.reply({ embeds: [failEmbed], ephemeral: true });
                return;
            }

            const newWeapon = new Weapon( {
                id: id,
                name: (id.charAt(0).toUpperCase() + id.slice(1)),
                description: "A weapon without a curated description.",
                damageType: type,
                damage: damage,
                missRate: missRate,
                timesUsed: 0,
                guildId: interaction.guildId,
                author: interaction.member.id
            });

            try {
                await newWeapon.save();
                console.log(`Added weapon ${id} to the database.`);
            } catch (err) {
                console.log(`Id matching ${id} already exists in the ${interaction.guildId} database, not adding new document.`);
                const failEmbed = new VortoxEmbed(VortoxColor.ERROR, `Error Adding \`${id}\``, `tried to add ${id} to the guild database.`, interaction.member);
                failEmbed.setDescription(`Weapon id \`${id}\` already exists in this guild!`);
                await interaction.reply({ embeds: [failEmbed], ephemeral: true });
                return;
            }

            const embed = new VortoxEmbed(VortoxColor.SUCCESS, `Adding Weapon \`${id}\``, `added weapon ${id} to the database.`, interaction.member);
            embed.setDescription(`Weapon id \`${id}\` added to the database!`);

            await interaction.reply({ embeds: [embed] });
        }
        else if (subcommand === 'delete') {

            const weapon = await Weapon.findOne({ id: id, 'meta.guildId': interaction.guildId });

            if (!weapon) {
                console.log(`No document with id matching ${id} found in the ${interaction.guildId} database.`);
                const embedFail = new VortoxEmbed(VortoxColor.ERROR, `Error Deleting \`${id}\``, `tried to remove weapon ${id} from the guild database.`, interaction.member);
                embedFail.setDescription(`Weapon \`${id}\` does not exist in this guild!`);
                interaction.reply({ embeds: [embedFail], ephemeral: true });
                return;
            }

            const embedValidate = new VortoxEmbed(VortoxColor.DEFAULT, `Deleting ${weapon.name} Validation`, `is trying to remove weapon ${id} from the database.`, interaction.member);
            embedValidate.setDescription(`Are you sure you want to delete ${weapon.name} (ID: \`${id}\`)?\nRespond with \`${id}\`.`);

            const embedSuccess = new VortoxEmbed(VortoxColor.SUCCESS, `Deleting ${weapon.name}`, `removed weapon ${id} from the guild database.`, interaction.member);
            embedSuccess.setDescription(`Deleted ${weapon.name} (ID: \`${id}\`)!`);

            const embedCatch = new VortoxEmbed(VortoxColor.MISS, `Not Deleting ${weapon.name}`, `tried to remove weapon ${id} from the guild database.`, interaction.member);
            embedCatch.setDescription(`Message content did not match \`${id}\` or ${interaction.member.displayName} did not respond in time.`);

            const filter = (m) => m.author.id === interaction.member.id;
            await interaction.reply({ embeds: [embedValidate], ephemeral: false,  fetchReply: true })
                .then(() => {
                    interaction.channel.awaitMessages({ filter: filter, max: 1, time: 180000, errors: ['time'] })
                        .then(async collected => {
                            if (collected.first().content.toLowerCase() === id) {
                                console.log(`Removed weapon ${id} from the database.`)
                                await Weapon.deleteOne({id: id});
                                await collected.first().delete();
                                await interaction.editReply({ embeds: [embedSuccess] });
                            } else await interaction.editReply({embeds: [embedCatch] });
                        })
                        .catch(async () => {
                            await interaction.editReply({embeds: [embedCatch], ephemeral: false});
                        })
                });
        }
        else if (subcommand === 'info') {
            const weapon = await Weapon.findOne({ id: id, 'meta.guildId': interaction.guildId });

            if (!weapon) {
                console.log(`No document with id matching ${id} found in the ${interaction.guildId} database.`);
                const embedFail = new VortoxEmbed(VortoxColor.ERROR, `Error Retrieving \`${id}\``, `tried to find weapon ${id} in the guild database.`, interaction.member);
                embedFail.setDescription(`Weapon \`${id}\` does not exist in this guild!`);
                interaction.reply({ embeds: [embedFail], ephemeral: true });
                return;
            }

            const embed = new VortoxEmbed(VortoxColor.DEFAULT, `${weapon.name}`, `got information for ${weapon.name}.`, interaction.member);
            embed.setDescription(weapon.description)
                .addFields([
                    { name: "ID", value: `\`${weapon.id}\``, inline: true },
                    { name: "Damage Type", value: `\`${weapon.damageType}\``, inline: true },
                    { name: "Damage Roll", value: `\`${weapon.damage}\``, inline: true },
                    { name: "Number of Uses", value: `${weapon.timesUsed}`, inline: true },
                    { name: "Author", value: `<@${weapon.author}>`, inline: false },
                ])

            await interaction.reply({ embeds: [embed] });

        }
        else {
            let newId = interaction.options.getString('new_id');
            if (newId !== null) newId = newId.toLowerCase();
            let name = interaction.options.getString('name');
            let description = interaction.options.getString('description');
            let damageType = interaction.options.getString('damage_type');
            let damage = interaction.options.getString('damage');
            let missRate = interaction.options.getInteger('miss_rate');
            let author = interaction.options.getMentionable('author');

            const weapon = await Weapon.findOne({ id: id, 'meta.guildId': interaction.guildId });

            if (!weapon) {
                console.log(`No document with id matching ${id} found in the ${interaction.guildId} database.`);
                const embedFail = new VortoxEmbed(VortoxColor.ERROR, `Error Editing \`${id}\``, `tried to edit weapon ${id} in the guild database.`, interaction.member);
                embedFail.setDescription(`Weapon \`${id}\` does not exist in this guild!`);
                interaction.reply({ embeds: [embedFail], ephemeral: true });
                return;
            }

            if (newId !== null) {
                const tempFind = await Weapon.findOne({ id: newId, 'meta.guildId': interaction.guildId });

                if (tempFind !== null) {
                    console.log(`Id matching ${newId} found in the ${interaction.guildId} database, not editing document ${id}.`);
                    const failEmbed = new VortoxEmbed(VortoxColor.ERROR, `Error Editing \`${weapon.name}\``, `tried to edit ${id} in the guild database.`, interaction.member);
                    failEmbed.setDescription(`Weapon id \`${newId}\` already exists!`);
                    await interaction.reply({ embeds: [failEmbed], ephemeral: true });
                    return;
                }
                else weapon.id = newId
            }

            if (name !== null) weapon.name = name;
            if (description !== null) weapon.description = description;
            if (damageType !== null) weapon.damageType = damageType;
            if (damage !== null) {
                let roller;
                try {
                    roller = new DiceRoller(damage);
                } catch (error) {
                    if (error instanceof RollInitializeError || error instanceof InfinityError) {
                        const failEmbed = new VortoxEmbed(VortoxColor.ERROR, `Error Editing Weapon \`${weapon.name}\``, `tried to add weapon ${id} to the guild database.`, interaction.member);
                        failEmbed.setDescription("Dice syntax is invalid!")
                        await interaction.reply({ embeds: [failEmbed], ephemeral: true });
                        return;
                    }
                }

                if (roller.getMin() <= 0 || roller.getMin() === null) {
                    const failEmbed = new VortoxEmbed(VortoxColor.ERROR, `Error Adding Weapon \`${weapon.name}\``, `tried to add weapon ${id} to the guild database.`, interaction.member);
                    failEmbed.setDescription("Damage cannot have the possibility of being negative!")
                    await interaction.reply({ embeds: [failEmbed], ephemeral: true });
                    return;
                }
                weapon.damage = damage;
            }
            if (missRate !== null) {
                if (missRate < 0 || missRate > 100) {
                    const failEmbed = new VortoxEmbed(VortoxColor.ERROR, `Error Editing \`${weapon.name}\``, `tried to edit ${id} in the guild database.`, interaction.member);
                    failEmbed.setDescription(`Miss Rate has to be between 0 and 100 inclusive!`);
                    await interaction.reply({ embeds: [failEmbed], ephemeral: true });
                    return;
                }
                else weapon.missRate = missRate;
            }
            if (author !== null) weapon.author = author.id;

            weapon.save();

            const successEmbed = new VortoxEmbed(VortoxColor.SUCCESS, `Editing ${weapon.name}`, `edited ${weapon.name} in the guild database.`, interaction.member);
            successEmbed.setDescription(`Successfully edited ${weapon.name}!`);

            await interaction.reply({ embeds: [successEmbed] });
        }
    }
}
