import { SlashCommandBuilder } from 'discord.js';
import { createErrorEmbed, createInfoEmbed } from '../utils/embeds.js';
import { isAdmin } from '../utils/permissions.js';
import { obtenerPendientes } from '../services/solicitudes.js';

export default {
  data: new SlashCommandBuilder().setName('miembros').setDescription('Gestion de miembros').addSubcommand((subcommand) => subcommand.setName('pendientes').setDescription('Solicitudes pendientes')),
  async execute(interaction) {
    if (!isAdmin(interaction)) return interaction.reply({ embeds: [createErrorEmbed('No tienes permisos de administrador.')], ephemeral: true });
    const rows = await obtenerPendientes();
    return interaction.reply({ embeds: [createInfoEmbed('Miembros pendientes', rows.map((row) => `**#${row.id}** ${row.nombre_usuario || row.nombre_mostrar || 'Usuario'}${row.razon ? `\n${row.razon}` : ''}`).join('\n\n') || 'No hay solicitudes pendientes.')] });
  },
};