const { Client } = require('discord.js');
const axios = require('axios');
const https = require('https');
const { token, CAT_API_KEY, DOG_API_KEY, HEC_TOKEN, splunk_url, flag } = require('./settings');
const client = new Client();

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
    }
    
    if (isTesting(msg) === true) {
        if (msg.content.match(/^test$/i)) {
            msg.channel.send('Receiving transmission.');
            //getADog(msg);
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
    // Call function by first specifying what the event should be, then calling logToSplunk(event)
    //let event = 'Set a course.';
    //logToSplunk(event);
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
    // might need to stringify the message
    var url = 'https://api.thedogapi.com/v1/images/search';
    axios.get(url)
    .then((response) => {
        msg.channel.send('success ' + response.data.json);
    }, (error) => {
        msg.channel.send('error ' + error);
    });
}

client.login(token);
