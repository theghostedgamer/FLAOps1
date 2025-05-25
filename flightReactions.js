const { EmbedBuilder } = require('discord.js');

const PILOT_EMOJI = '🧑‍✈️';
const CSR_EMOJI = '🧍‍♂️';
const SUPERVISOR_EMOJI = '🧑‍💼';
const PASSENGER_EMOJI = '🧳';

const allowedRoleIds = [
  '1213501559011414126',
  '1221319757211504670',
  '1213501557522563102'
];

module.exports = (client) => {
  // Ensure global flightAnnouncements store exists
  global.flightAnnouncements = global.flightAnnouncements || {};

  client.on('messageReactionAdd', async (reaction, user) => {
    if (user.bot) return;

    if (reaction.partial) await reaction.fetch();
    if (reaction.message.partial) await reaction.message.fetch();

    const flightData = global.flightAnnouncements[reaction.message.id];
    if (!flightData) return;

    const emoji = reaction.emoji.name;
    if (![PILOT_EMOJI, CSR_EMOJI, SUPERVISOR_EMOJI, PASSENGER_EMOJI].includes(emoji)) return;

    const member = await reaction.message.guild.members.fetch(user.id);
    if (!member.roles.cache.some(role => allowedRoleIds.includes(role.id))) return;

    switch (emoji) {
      case PILOT_EMOJI:
        flightData.pilot = `<@${user.id}>`;
        break;
      case CSR_EMOJI:
        if (!flightData.csrs.includes(`<@${user.id}>`)) flightData.csrs.push(`<@${user.id}>`);
        break;
      case SUPERVISOR_EMOJI:
        flightData.supervisor = `<@${user.id}>`;
        break;
    }

    const embed = EmbedBuilder.from(reaction.message.embeds[0]);
    embed.setFields([
      { name: '🧑‍✈️ Pilot', value: flightData.pilot ?? 'TBD', inline: true },
      { name: '🧍‍♂️ CSRs', value: flightData.csrs.length ? flightData.csrs.join(', ') : 'TBD', inline: true },
      { name: '🧑‍💼 Supervisor', value: flightData.supervisor ?? 'TBD', inline: true },
      { name: '🧳 Passengers', value: 'React below to RSVP!', inline: false },
    ]);

    try {
      await reaction.message.edit({ embeds: [embed] });
    } catch (err) {
      console.error('Failed to update flight embed:', err);
    }
  });

  client.on('messageReactionRemove', async (reaction, user) => {
    if (user.bot) return;

    if (reaction.partial) await reaction.fetch();
    if (reaction.message.partial) await reaction.message.fetch();

    const flightData = global.flightAnnouncements[reaction.message.id];
    if (!flightData) return;

    const emoji = reaction.emoji.name;
    const userTag = `<@${user.id}>`;

    switch (emoji) {
      case PILOT_EMOJI:
        if (flightData.pilot === userTag) flightData.pilot = null;
        break;
      case CSR_EMOJI:
        flightData.csrs = flightData.csrs.filter(csr => csr !== userTag);
        break;
      case SUPERVISOR_EMOJI:
        if (flightData.supervisor === userTag) flightData.supervisor = null;
        break;
    }

    const embed = EmbedBuilder.from(reaction.message.embeds[0]);
    embed.setFields([
      { name: '🧑‍✈️ Pilot', value: flightData.pilot ?? 'TBD', inline: true },
      { name: '🧍‍♂️ CSRs', value: flightData.csrs.length ? flightData.csrs.join(', ') : 'TBD', inline: true },
      { name: '🧑‍💼 Supervisor', value: flightData.supervisor ?? 'TBD', inline: true },
      { name: '🧳 Passengers', value: 'React below to RSVP!', inline: false },
    ]);

    try {
      await reaction.message.edit({ embeds: [embed] });
    } catch (err) {
      console.error('Failed to update flight embed on reaction remove:', err);
    }
  });
};
