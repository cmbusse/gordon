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
            getAnAnimal(msg, 'dog');
        }

        if(msg.content.match(/^meow!$/i)) {
            getAnAnimal(msg, 'cat');
        }
    }
    
    if (isTesting(msg) === true) {
        if (msg.content.match(/^test$/i)) {
            msg.channel.send('Receiving transmission.');
            
            let chris = client.users.cache.get('141628186290159616');
            chris.send('test response!!!');    
        }
    }

});

client.on('voiceStateUpdate', (oldState, newState) => {
    if (isTesting(newState) === false){
        let newUserChannel = newState.channel;
        let oldUserChannel = oldState.channel;

        if(oldUserChannel === null && newUserChannel !== null) {
            let user = newState.member.user;
            let length = newUserChannel.members.array().length;
            if (user.id !== '141628186290159616' && length > 1) {
                let chris = client.users.cache.get('141628186290159616');
                const users = [];
                for (var member of newUserChannel.members.array()) {
                    users.push(member.user.username);
                }
                chris.send(`${length} people are in chat, sounds like games are afoot!  In chat are:  ${users.join(", ")}`);
            }
        } 
    }

});

function isTesting(obj) {
    if (flag === 'live' && obj.guild.id !== '744625770642800710') {
        return false;
    } else if (flag === 'testing' && obj.guild.id === '744625770642800710'){
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

function getAnAnimal(msg, animal = 'cat') {
    if (animal === 'cat') {
        var token = CAT_API_KEY;
        var footer = 'MEOW!';
    } else {
        var token = DOG_API_KEY;
        var footer = 'BORK!';
    }
    var url = 'https://api.the' + animal + 'api.com/v1/images/search';
    const config = {
        headers: { 'X-API-KEY': token }
    }
    axios.get(url, config)
    .then((response) => {        
        var image = response['data'][0]['url'];
        let embed = createMessageEmbed(image, 'Here, have a ' + animal + '!', footer);
        msg.channel.send(embed);
    }, (error) => {
        msg.channel.send('Beep boop, I broke :^(');
        let event = JSON.stringify(error.data);
        logToSplunk(event);
    });
}

function createMessageEmbed(image, title = '', footer = '') {
    const embed = new Discord.MessageEmbed()
        .setColor('#36393f')
        .setTitle(title)
        .setImage(image)
        .setFooter(footer);
    
    return embed;
}

client.login(token);
