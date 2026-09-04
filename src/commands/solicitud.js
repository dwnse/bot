import { SlashCommandBuilder } from 'discord.js';
import { createErrorEmbed, createInfoEmbed, createSuccessEmbed } from '../utils/embeds.js';
import { isAdmin } from '../utils/permissions.js';
import { obtenerEstado, obtenerPendientes, revisarSolicitud } from '../services/solicitudes.js';

export default {
  data: new SlashCommandBuilder().setName('solicitud').setDescription('Solicitudes de ingreso')
    .addSubcommand((s) => s.setName('estado').setDescription('Tu solicitud'))
    .addSubcommand((s) => s.setName('pendientes').setDescription('Solicitudes pendientes'))
    .addSubcommand((s) => s.setName('aprobar').setDescription('Aprueba').addIntegerOption((o) => o.setName('id').setDescription('ID').setRequired(true)))
    .addSubcommand((s) => s.setName('rechazar').setDescription('Rechaza').addIntegerOption((o) => o.setName('id').setDescription('ID').setRequired(true)).addStringOption((o) => o.setName('motivo').setDescription('Motivo').setRequired(true))),
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    if (subcommand === 'estado') {
      const row = await obtenerEstado(interaction.user.id);
      return interaction.reply({ embeds: [row ? createInfoEmbed('Estado de solicitud', `Estado: **${row.estado}**`) : createErrorEmbed('No tienes solicitudes registradas.')], ephemeral: true });
    }
    if (!isAdmin(interaction)) return interaction.reply({ embeds: [createErrorEmbed('No tienes permisos de administrador.')], ephemeral: true });
    if (subcommand === 'pendientes') {
      const rows = await obtenerPendientes();
      return interaction.reply({ embeds: [createInfoEmbed('Solicitudes pendientes', rows.map((row) => `**#${row.id}** ${row.nombre_usuario || row.nombre_mostrar || row.discord_id || 'Usuario desconocido'}`).join('\n') || 'No hay solicitudes pendientes.')] });
    }
    await revisarSolicitud(interaction.options.getInteger('id'), subcommand === 'aprobar' ? 'aprobada' : 'rechazada', interaction.user.id, interaction.options.getString('motivo'));
    return interaction.reply({ embeds: [createSuccessEmbed('Solicitud revisada', 'El estado se actualizo correctamente.')] });
  },
};
