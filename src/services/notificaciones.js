import { supabase } from '../supabase.js';
import { config } from '../config.js';
import { createInfoEmbed } from '../utils/embeds.js';
import { obtenerProximosEventos } from './eventos.js';
import { obtenerPendientes as obtenerClipsPendientes } from './clips.js';
import { obtenerPendientes as obtenerSolicitudesPendientes } from './solicitudes.js';

const announcedEvents = new Set();
const remindedEvents = new Set();
const notifiedClips = new Set();
const notifiedSolicitudes = new Set();
let eventsInitialized = false;
let moderationInitialized = false;

export const anunciarEnCanal = async (client, canalId, embed) => {
  if (!canalId) return false;
  const channel = await client.channels.fetch(canalId).catch(() => null);
  if (!channel?.isTextBased()) return false;
  await channel.send({ embeds: [embed] });
  return true;
};

const anunciarTextoEnCanal = async (client, canalId, texto) => {
  if (!canalId) return false;
  const channel = await client.channels.fetch(canalId).catch(() => null);
  if (!channel?.isTextBased()) return false;
  await channel.send({ content: texto });
  return true;
};

export const verificarEventosNuevos = async (client) => {
  if (!supabase || !config.channels.anuncios) return;
  const { data } = await supabase.from('eventos').select('*').eq('estado', 'publicado').gt('fecha_inicio', new Date().toISOString()).order('fecha_inicio').limit(5);
  if (!eventsInitialized) {
    for (const event of data || []) announcedEvents.add(event.id);
    eventsInitialized = true;
    return;
  }
  for (const event of data || []) {
    if (announcedEvents.has(event.id)) continue;
    if (await anunciarEnCanal(client, config.channels.anuncios, createInfoEmbed(`Nuevo evento: ${event.titulo}`, event.descripcion || 'Ya puedes inscribirte en Discord.'))) announcedEvents.add(event.id);
  }
};

export const verificarRecordatorios = async (client) => {
  const events = await obtenerProximosEventos();
  const limit = Date.now() + 24 * 60 * 60 * 1000;
  for (const event of events.filter((item) => new Date(item.fecha_inicio).getTime() <= limit)) {
    if (remindedEvents.has(event.id)) continue;
    if (await anunciarEnCanal(client, config.channels.anuncios, createInfoEmbed(`Recordatorio: ${event.titulo}`, `Comienza ${event.fecha_inicio}.`))) remindedEvents.add(event.id);
  }
};

export const verificarModeracion = async (client) => {
  if (!config.channels.moderacion) return;
  const [clips, solicitudes] = await Promise.all([obtenerClipsPendientes(), obtenerSolicitudesPendientes()]);
  if (!moderationInitialized) {
    for (const clip of clips) notifiedClips.add(clip.id);
    for (const solicitud of solicitudes) notifiedSolicitudes.add(solicitud.id);
    moderationInitialized = true;
    return;
  }
  for (const clip of clips) {
    await anunciarClipPendiente(client, clip);
  }
  for (const solicitud of solicitudes) {
    if (notifiedSolicitudes.has(solicitud.id)) continue;
    const nombre = solicitud.nombre_usuario || solicitud.nombre_mostrar || solicitud.discord_id || 'Usuario desconocido';
    if (await anunciarEnCanal(client, config.channels.moderacion, createInfoEmbed('Solicitud de miembro pendiente', `**ID:** ${solicitud.id}\n**Usuario:** ${nombre}\nUsa \/solicitud pendientes para revisarla.`))) notifiedSolicitudes.add(solicitud.id);
  }
};

export const anunciarClipPendiente = async (client, clip) => {
  if (!config.channels.moderacion || notifiedClips.has(clip.id)) return false;
  notifiedClips.add(clip.id);
  const autor = clip.miembro?.nombre_usuario || clip.miembro?.nombre_mostrar || clip.autor || 'Sin autor';
  const sent = await anunciarTextoEnCanal(client, config.channels.moderacion, `${clip.titulo} - ${autor}\n${clip.youtube_url || clip.url}`);
  if (!sent) notifiedClips.delete(clip.id);
  return sent;
};