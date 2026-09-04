import { SlashCommandBuilder } from 'discord.js';
import { createInfoEmbed } from '../utils/embeds.js';
import { obtenerEstadisticasGenerales } from '../services/stats.js';
export default { data: new SlashCommandBuilder().setName('stats').setDescription('Estadisticas del clan'), async execute(i) { const s = await obtenerEstadisticasGenerales(); return i.reply({ embeds: [createInfoEmbed('Estadisticas del clan', `Miembros activos: **${s.miembros}**\nClips aprobados: **${s.clips}**\nEventos realizados: **${s.eventos}**\nPuntos otorgados: **${s.puntos}**`)] }); } };