const fs = require("fs");
const { ActivityType } = require('discord.js');
const { EpisodeUtils } = require('../utilities/episodeUtils')
const path = require("path");

module.exports = {
	name: 'ready',
	once: true,
	execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);

		EpisodeUtils.start();

		//Presence updates every five minutes.
		const list = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'items', 'status.json'), 'utf8'));

		let presence = list[Math.floor(Math.random() * list.length)]
		let activity = presence.activity;
		let status = presence.status;

		client.user.setPresence({
			activities: [{ name: `${activity}`, type: ActivityType[status] }],
			status: 'idle',
		});

		setInterval(() => {
			presence = list[Math.floor(Math.random() * list.length)]
			activity = presence.activity;
			status = presence.status;

			client.user.setPresence({
				activities: [{ name: `${activity}`, type: ActivityType[status] }],
				status: 'idle',
			});
		}, 300000);

	},
};