const Discord = require('discord.js');
const axios = require('axios');
const https = require('https');
const { token, CAT_API_KEY, DOG_API_KEY, HEC_TOKEN, splunk_url, flag } = require('./settings');
const client = new Discord.Client();

client.on('ready', () => console.log('Ready!'));

client.on('message', (msg) => {
    if (msg.author.bot) return;
   
    if (isTesting(msg) === false) {
        if (msg.content.match(/(hi|hello|hey|yo|sup|what's up|whats up) gordon/i)) {
            msg.channel.send('Hello ' + msg.author.username);
        }
    
        if (msg.content.match(/^ping$/i)) {
            msg.channel.send('pong');
        }

        if(msg.content.match(/^woof!$/i)) {
            getADog(msg);
        }

        if(msg.content.match(/^meow!$/i)) {
            getACat(msg);
        }
    }
    
    if (isTesting(msg) === true) {
        if (msg.content.match(/chonk/i)) {
            msg.channel.send('Receiving transmission.');
            let embed = createMessageEmbed('https://i.ytimg.com/vi/M6iu2n_Kjkk/maxresdefault.jpg', 'Did someone say... CHONK?!', 'Oh Lawdy');

            msg.channel.send(embed);
        }
    }

});

function isTesting(msg) {
    if (flag === 'live' && msg.guild.id !== '744625770642800710') {
        return false;
    } else if (flag === 'testing' && msg.guild.id === '744625770642800710'){
        return true;
    }
}

function logToSplunk(event) {
    const agent = new https.Agent({  
        rejectUnauthorized: false
      });
    const config = {
        headers: { 'Authorization': `Splunk ${HEC_TOKEN}`},
        httpsAgent: agent
    }

    params = {
        event: event
    }

    axios.post(splunk_url, params, config)
    .then((response) => {
        console.log(response.data);
    }, (error) => {
        console.log(error);
    });
}

function getADog(msg) {
    var url = 'https://api.thedogapi.com/v1/images/search';
    const config = {
        headers: { 'X-API-KEY': DOG_API_KEY }
    }
    axios.get(url, config)
    .then((response) => {        
        var image = response['data'][0]['url'];
        let embed = createMessageEmbed(image, 'Here, have a dog!', 'BORK!');
        msg.channel.send(embed);
    }, (error) => {
        msg.channel.send('Beep boop, I broke :^(');
        let event = JSON.stringify(error.data);
        logToSplunk(event);
    });
}

function getACat(msg) {
    var url = 'https://api.thecatapi.com/v1/images/search';
    const config = {
        headers: { 'X-API-KEY': CAT_API_KEY }
    }
    axios.get(url, config)
    .then((response) => {        
        var image = response['data'][0]['url'];
        let embed = createMessageEmbed(image, 'Here, have a cat!', 'MEOW!');
        msg.channel.send(embed);
    }, (error) => {
        msg.channel.send('Beep boop, I broke :^(');
        let event = JSON.stringify(error.data);
        logToSplunk(event);
    });
}

function createMessageEmbed(image, title, footer) {
    const embed = new Discord.MessageEmbed()
        .setColor('#36393f')
        .setTitle(title)
        .setImage(image)
        .setFooter(footer);
    
    return embed;
}

client.login(token);
