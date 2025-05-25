require('dotenv').config();
const { REST, Routes } = require('discord.js');

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log('Fetching commands...');

    // DELETE GUILD COMMANDS
    const guildCommands = await rest.get(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID)
    );
    for (const command of guildCommands) {
      console.log(`Deleting GUILD command: ${command.name}`);
      await rest.delete(
        Routes.applicationGuildCommand(process.env.CLIENT_ID, process.env.GUILD_ID, command.id)
      );
    }

    // DELETE GLOBAL COMMANDS
    const globalCommands = await rest.get(Routes.applicationCommands(process.env.CLIENT_ID));
    for (const command of globalCommands) {
      console.log(`Deleting GLOBAL command: ${command.name}`);
      await rest.delete(
        Routes.applicationCommand(process.env.CLIENT_ID, command.id)
      );
    }

    console.log('✅ All commands deleted.');
  } catch (error) {
    console.error('Error deleting commands:', error);
  }
})();
