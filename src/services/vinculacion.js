import { supabase } from '../supabase.js';

const ensureClient = () => {
  if (!supabase) throw new Error('Supabase no está configurado.');
};

export const obtenerMiembroPorDiscord = async (discordId) => {
  ensureClient();
  const { data, error } = await supabase.from('miembros').select('*, tier:tiers(*)').eq('discord_id', discordId).maybeSingle();
  if (error) throw error;
  return data;
};

export const obtenerMiembroPorNombre = async (nombreUsuario) => {
  ensureClient();
  const { data, error } = await supabase.from('miembros').select('*, tier:tiers(*)').eq('nombre_usuario', nombreUsuario).maybeSingle();
  if (error) throw error;
  return data;
};

export const vincularCuenta = async (discordId, nombreUsuario) => {
  const miembro = await obtenerMiembroPorNombre(nombreUsuario);
  if (!miembro) return { error: 'not_found' };
  if (miembro.discord_id && miembro.discord_id !== discordId) return { error: 'already_linked' };
  const { data, error } = await supabase.from('miembros').update({ discord_id: discordId }).eq('id', miembro.id).select('*, tier:tiers(*)').single();
  if (error) throw error;
  return { miembro: data };
};

export const desvincularCuenta = async (discordId) => {
  const miembro = await obtenerMiembroPorDiscord(discordId);
  if (!miembro) return null;
  const { error } = await supabase.from('miembros').update({ discord_id: null }).eq('id', miembro.id);
  if (error) throw error;
  return miembro;
};