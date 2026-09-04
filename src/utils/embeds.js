import { EmbedBuilder } from 'discord.js';

export const Colors = {
  SUCCESS: '#00FF00',
  ERROR: '#FF0000',
  INFO: '#3498DB',
  WARNING: '#F1C40F',
  DEFAULT: '#A7B0BC',
};

const footer = { text: 'Clan Ryo' };
const isValidUrl = (value) => typeof value === 'string' && /^https?:\/\/[^\s]+$/i.test(value);

export const createSuccessEmbed = (title, description) => {
  return new EmbedBuilder()
    .setColor(Colors.SUCCESS)
    .setTitle(`✅ ${title}`)
    .setDescription(description)
    .setFooter(footer);
};

export const createErrorEmbed = (message) => {
  return new EmbedBuilder()
    .setColor(Colors.ERROR)
    .setTitle('❌ Error')
    .setDescription(message)
    .setFooter(footer);
};

export const createInfoEmbed = (title, description) => {
  return new EmbedBuilder()
    .setColor(Colors.INFO)
    .setTitle(title)
    .setDescription(description)
    .setFooter(footer);
};

export const createProfileEmbed = (miembro) => {
  const color = miembro.tier?.color || Colors.DEFAULT;
  const thumbnail = isValidUrl(miembro.avatar_url)
    ? miembro.avatar_url
    : 'https://cdn.discordapp.com/embed/avatars/0.png';
  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle(`Perfil de ${miembro.nombre_mostrar}`)
    .setThumbnail(thumbnail)
    .addFields(
      { name: 'Tier', value: miembro.tier?.nombre || 'Ninguno', inline: true },
      { name: 'Puntos Totales', value: `${miembro.puntos_totales}`, inline: true },
      { name: 'Fecha de Ingreso', value: miembro.fecha_ingreso || 'Desconocida', inline: true }
    )
    .setFooter({
      text: miembro.tier?.nombre || 'Clan Gamer',
      ...(isValidUrl(miembro.tier?.icono) ? { iconURL: miembro.tier.icono } : {}),
    });

  if (miembro.biografia) {
    embed.setDescription(miembro.biografia);
  }
  
  if (miembro.minecraft_username) {
    embed.addFields({ name: 'Minecraft', value: miembro.minecraft_username, inline: true });
    // If they have a Minecraft username, use their skin as thumbnail (Crafatar API)
    if (miembro.minecraft_uuid) {
      embed.setThumbnail(`https://crafatar.com/avatars/${miembro.minecraft_uuid}?overlay=true`);
    } else {
      embed.setThumbnail(`https://minotar.net/helm/${miembro.minecraft_username}/100.png`);
    }
  }

  return embed;
};
