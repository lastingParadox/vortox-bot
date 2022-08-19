function syllableCounter(word) {

    const vowels = ['a','e','i','o','u','y']
    const lowerWord = word.toLowerCase();
    let count = 0;

    for (let i = 0; i < lowerWord.length; i++) {
        if (i === 0) {
            if (vowels.includes(word[i])) count++;
            continue;
        }
        if(vowels.includes(word[i]) && !(vowels.includes(word[i-1]))) count++;
    }

    if (count === 0) count++;

    return count;
}

module.exports = {
    name: 'messageCreate',
    execute(message) {
        if (message.author.bot) return;
        if (message.content.indexOf(' ') > -1 || message.content.toLowerCase().indexOf("squ") !== 0 || message.content.toLowerCase() === "squoat") return;

        if (syllableCounter(message.content) === 2) {
            message.channel.send(`${message.author}, ${message.content} is a valid squoatling name.`);
        }
        else {
            message.channel.send(`${message.author}, ${message.content} is not a valid squoatling name.`);
        }
    },
};