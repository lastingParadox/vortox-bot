const {InteractionType} = require("discord-api-types/v10");

module.exports = {
	name: 'interactionCreate',
	async execute(interaction, client) {
		if (interaction.type === InteractionType.ApplicationCommand) return;

		const command = client.commands.get(interaction.commandName);

		if (!command) return;

		try {
			await command.execute(interaction);
		} catch (error) {
			console.error(error);
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	},
};