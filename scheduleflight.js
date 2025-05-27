const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const schedule = require('node-schedule');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('scheduleflight')
    .setDescription('Schedule a new flight announcement')
    .addStringOption(option =>
      option.setName('flight_number').setDescription('Flight number').setRequired(true))
    .addStringOption(option =>
      option.setName('departure').setDescription('Departure airport').setRequired(true))
    .addStringOption(option =>
      option.setName('destination').setDescription('Destination airport').setRequired(true))
    .addStringOption(option =>
      option.setName('datetime').setDescription('MM-DD-YYYY HH:mm format').setRequired(true))
    .addChannelOption(option =>
      option.setName('channel').setDescription('Channel to send the announcement in').setRequired(true)),

  async execute(interaction) {
    // Define allowed role IDs here
    const allowedRoleIds = ['1221319106758705282', '1375334565048221706']; 

    // Check if user has any of the allowed roles
    const memberRoles = interaction.member.roles.cache;
    const hasPermission = allowedRoleIds.some(roleId => memberRoles.has(roleId));

    if (!hasPermission) {
      return interaction.reply({ content: "❌ You don't have permission to use this command.", ephemeral: true });
    }

    const flightNumber = interaction.options.getString('flight_number');
    const departure = interaction.options.getString('departure');
    const destination = interaction.options.getString('destination');
    const dateTimeInput = interaction.options.getString('datetime');
    const channel = interaction.options.getChannel('channel');

    const flightTime = new Date(dateTimeInput);
    if (isNaN(flightTime)) {
      return interaction.reply({ content: 'Invalid date format. Use MM-DD-YYYY HH:mm', ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setTitle(`✈️ Flight ${flightNumber} Announcement`)
      .setDescription(`Flight ${flightNumber} will take place on **${dateTimeInput}** from **${departure}** to **${destination}**.`)
      .addFields(
        { name: '🧑‍✈️ Pilot', value: 'TBD', inline: true },
        { name: '🧍‍♂️ CSRs', value: 'TBD', inline: true },
        { name: '🧑‍💼 Supervisor', value: 'TBD', inline: true },
        { name: '🧳 Passengers', value: 'React below to RSVP!', inline: false }
      )
      .setColor('Blue')
      .setTimestamp();

    const sentMessage = await channel.send({ embeds: [embed] });

    // Save flight data globally for reactions
    global.flightAnnouncements = global.flightAnnouncements || {};
    global.flightAnnouncements[sentMessage.id] = {
      pilot: null,
      csrs: [],
      supervisor: null,
    };

    // Add emojis
    await sentMessage.react('🧑‍✈️');
    await sentMessage.react('🧍‍♂️');
    await sentMessage.react('🧑‍💼');
    await sentMessage.react('🧳');

    // Schedule 24-hour, 15-minute, and start-time reminders
    const jobTimes = [
      { offset: 24 * 60 * 60 * 1000, message: `⏰ 24-hour reminder: Flight ${flightNumber} is tomorrow!` },
      { offset: 15 * 60 * 1000, message: `⏰ 15-minute reminder: Flight ${flightNumber} is about to begin!` },
      { offset: 0, message: `✈️ Flight ${flightNumber} is now starting! @everyone` },
    ];

    for (const { offset, message } of jobTimes) {
      const jobTime = new Date(flightTime.getTime() - offset);
      if (jobTime > new Date()) {
        schedule.scheduleJob(jobTime, () => {
          channel.send(message);
        });
      }
    }

    await interaction.reply({ content: '✅ Flight scheduled and announcement posted!', ephemeral: true });
  },
};
