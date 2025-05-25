require('dotenv').config();
const { REST, Routes } = require('discord.js');

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log('Fetching commands...');

    // Use this for GUILD commands
    const guildCommands = await rest.get(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID)
    );

    // OR use this for GLOBAL commands:
    // const guildCommands = await rest.get(Routes.applicationCommands(process.env.CLIENT_ID));

    console.log(`Found ${guildCommands.length} commands.`);
    for (const command of guildCommands) {
      console.log(`Deleting ${command.name} (${command.id})`);
      await rest.delete(
        Routes.applicationGuildCommand(process.env.CLIENT_ID, process.env.GUILD_ID, command.id)
      );
    }

    console.log('✅ All guild commands deleted.');

  } catch (error) {
    console.error('Error cleaning up commands:', error);
  }
})();
