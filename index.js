require('dotenv').config();

const { Client, GatewayIntentBits, Partials, Collection, ActivityType } = require('discord.js');
const fs = require('fs');
const path = require('path');
const connectDB = require('./database/mongo');
const mongoose = require('mongoose');

// Create client once here
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMembers,
  ],
  partials: [
    Partials.Message,
    Partials.Channel,
    Partials.Reaction,
  ],
});

// Connect to MongoDB
connectDB();

try {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Linked your DB to node app'))
    .catch(console.error);
} catch (error) {
  console.log(error);
}

// Collection for commands
client.commands = new Collection();

// Load commands from the Commands folder
const commandsPath = path.join(__dirname, 'Commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  if ('data' in command && 'execute' in command) {
    client.commands.set(command.data.name, command);
  } else {
    console.warn(`[WARNING] The command at ${file} is missing "data" or "execute".`);
  }
}

// Handle slash command interactions
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: 'There was an error executing that command.', ephemeral: true });
  }
});

// Load and initialize flight reactions module (pass client)
require('./flightReactions')(client);

// Set bot status and presence when ready
client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  client.user.setPresence({
    status: process.env.BOT_STATUS,
    activities: [{
      name: process.env.ACTIVITY_NAME,
      type: ActivityType[process.env.ACTIVITY_TYPE.toUpperCase()],
    }],
  });
});

// Log in to Discord
client.login(process.env.TOKEN);

module.exports = client;
