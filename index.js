const { Client, GatewayIntentBits, Partials } = require('discord.js');
const db = require('./db');
const config = require('./config');
const { dmOwner } = require('./logs/dmOwner');
const Subscriber = require('./events/Subscriber');

// Import each feature category
const utilsFeature = require('./features/utils');
const haloServersFeature = require('./features/servers');
const ipCheckingFeature = require('./features/ipChecking');
const playersDatabaseFeature = require('./features/playersDB');
const remoteConsoleFeature = require('./features/remoteConsole');
const funFeature = require('./features/fun');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
  partials: [
    Partials.Channel
  ]
});

client.on('ready', async () => {
  await dmOwner(client, '\`Bot is ready\`');

  // Connect to database
  await db.connect();

  // Subscriber for events
  const subscriber = new Subscriber(client);

  utilsFeature.config(client, subscriber);
  haloServersFeature.config(client, subscriber);
  ipCheckingFeature.config(client, subscriber);
  playersDatabaseFeature.config(client, subscriber);
  remoteConsoleFeature.config(client, subscriber);
  funFeature.config(client, subscriber);

  subscriber.subscribeEvents();
  subscriber.registerSlashCommands();
});

// Web server for health checks
const express = require('express');

const app = express();

app.get('/', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(3000, () => {
  console.log('Listening on port 3000');
});

client.login(config.TOKEN);