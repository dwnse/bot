import { supabase } from '../supabase.js';
import { config } from '../config.js';
import { createInfoEmbed } from '../utils/embeds.js';
import { anunciarEnCanal } from './notificaciones.js';

let lastChecked = new Date(0).toISOString();
let feedInitialized = false;
export const verificarActividad = async (client) => {
  if (!supabase || !config.channels.actividad) return;
  const { data } = await supabase.from('actividad_feed').select('*').gt('creado_en', lastChecked).order('creado_en').limit(50);
  if (!feedInitialized) {
    lastChecked = data?.at(-1)?.creado_en || new Date().toISOString();
    feedInitialized = true;
    return;
  }
  for (const activity of data || []) {
    await anunciarEnCanal(client, config.channels.actividad, createInfoEmbed(activity.titulo || activity.tipo, activity.descripcion || 'Nueva actividad del clan.'));
    lastChecked = activity.creado_en;
  }
};