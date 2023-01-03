const List = require("../models/lists");
const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const { VortoxEmbed } = require("../utilities/embeds");
const { VortoxColor } = require("../utilities/enums");

function getRow(index, embeds) {
	const row = new ActionRowBuilder()
	row.addComponents([
		new ButtonBuilder()
			.setCustomId('first_embed')
			.setStyle(ButtonStyle.Secondary)
			.setEmoji('⏮')
			.setDisabled(index === 0),
		new ButtonBuilder()
			.setCustomId('prev_embed')
			.setStyle(ButtonStyle.Secondary)
			.setEmoji('⏪')
			.setDisabled(index === 0),
		new ButtonBuilder()
			.setCustomId('next_embed')
			.setStyle(ButtonStyle.Secondary)
			.setEmoji('⏩')
			.setDisabled(index === embeds.length - 1),
		new ButtonBuilder()
			.setCustomId('last_embed')
			.setStyle(ButtonStyle.Secondary)
			.setEmoji('⏭')
			.setDisabled(index === embeds.length - 1),
	])

	return row;
}

module.exports = {
	name: 'interactionCreate',
	async execute(interaction) {
		if (!interaction.isButton()) return;

		const listItem = await List.findOne({ messageId: interaction.message.id });
		if (!listItem) {
			const deletedEmbed = new VortoxEmbed(VortoxColor.MISS, "List Expired", "tried to access an expired list.", interaction.member);
			deletedEmbed.setDescription('This list has expired. Use the \`list\` command to generate a new one.')
			await interaction.message.edit({ embeds: [deletedEmbed] })
			return interaction.deferUpdate();
		}
		const id = interaction.customId;

		if (id !== 'prev_embed' &&
			id !== 'next_embed' &&
			id !== 'first_embed' &&
			id !== 'last_embed') {
			return;
		}
		if (id === 'first_embed' && listItem.selectedIndex > 0)
			listItem.selectedIndex = 0
		else if (id === 'prev_embed' && listItem.selectedIndex > 0)
			--listItem.selectedIndex;
		else if (id === 'next_embed' && listItem.selectedIndex < listItem.embeds.length - 1)
			++listItem.selectedIndex;
		else if (id === 'last_embed' && listItem.selectedIndex < listItem.embeds.length - 1)
			listItem.selectedIndex = listItem.embeds.length - 1;

		const embed = new VortoxEmbed(VortoxColor.DEFAULT, listItem.title, listItem.footer, interaction.member);
		embed.addFields([
			{ name: "ID", value: listItem.embeds[listItem.selectedIndex].id, inline: true },
			{ name: "Name", value: listItem.embeds[listItem.selectedIndex].name, inline: true }
		]);

		if (listItem.type === "characters") embed.addFields({ name: "HP", value: listItem.embeds[listItem.selectedIndex].misc, inline: true });
		else if (listItem.type === "weapons") embed.addFields({ name: "Damage Type", value: listItem.embeds[listItem.selectedIndex].misc, inline: true });
		if (listItem.type === "episodes") embed.addFields({ name: "Thread", value: listItem.embeds[listItem.selectedIndex].misc, inline: true });

		await listItem.save();

		await interaction.message.edit({ embeds: [embed], components: [getRow(listItem.selectedIndex, listItem.embeds)] })

		return interaction.deferUpdate();
	},
};
