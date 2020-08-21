const { Client } = require('discord.js');
const { token } = require('./settings');
const client = new Client();

client.on('ready', () => console.log('Ready!'));

client.on('message', (msg) => {
    if (msg.author.bot) return;

    if (msg.content.match(/(hi|hello|hey|yo|sup|what's up|whats up) gordon/i)) {
        msg.channel.send('Hello ' + msg.author.username);
    }

    if (msg.content.match(/^ping$/i)) {
        msg.channel.send('pong');
    }
});

client.login(token);
