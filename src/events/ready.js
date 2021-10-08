module.exports = {
	name: 'ready',
	once: true,
	execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}.`);
		let activities = ['some baaaaad porn',
			'orbin\' it up',
			'Project 4 when?',
			'Garrick, more like garlic.',
			'Don\'t get marblized.',
			'An onion, wow.',
			'No one out-zizzas the Butt.'];
		let randomNum = Math.floor(Math.random() * activities.length);
		client.user.setActivity(`${activities[randomNum]}`);
	},
};