import { supabase } from '../supabase.js';

const normalizeClip = (clip) => ({ ...clip, url: clip.youtube_url });

export const enviarClip = async (miembroId, url, titulo, descripcion) => {
  const { data, error } = await supabase.from('clips').insert({ miembro_id: miembroId, youtube_url: url, titulo, descripcion, estado: 'pendiente' }).select().single();
  if (error) throw error;
  return normalizeClip(data);
};

export const obtenerRecientes = async (limite = 10) => {
  const { data, error } = await supabase.from('clips').select('*, miembro:miembros(nombre_mostrar)').eq('estado', 'aprobado').order('creado_en', { ascending: false }).limit(limite);
  if (error) throw error;
  return (data || []).map(normalizeClip);
};

export const obtenerDestacados = async () => {
  const { data, error } = await supabase.from('clips').select('*, miembro:miembros(nombre_mostrar)').eq('estado', 'aprobado').eq('destacado', true).order('creado_en', { ascending: false });
  if (error) throw error;
  return (data || []).map(normalizeClip);
};

export const obtenerPendientes = async () => {
  const { data, error } = await supabase.from('clips').select('*, miembro:miembros(nombre_mostrar,nombre_usuario)').eq('estado', 'pendiente').order('creado_en', { ascending: true });
  if (error) throw error;
  const clips = data || [];
  return Promise.all(clips.map(async (clip) => {
    if (clip.miembro?.nombre_usuario || clip.miembro?.nombre_mostrar) return normalizeClip(clip);
    if (clip.miembro_id) {
      const { data: member } = await supabase.from('miembros').select('nombre_usuario,nombre_mostrar').eq('id', clip.miembro_id).maybeSingle();
      if (member) return normalizeClip({ ...clip, miembro: member });
    }
    if (clip.usuario_id) {
      const { data: user } = await supabase.from('usuarios').select('nombre').eq('id', clip.usuario_id).maybeSingle();
      if (user?.nombre) return normalizeClip({ ...clip, autor: user.nombre });
    }
    return normalizeClip(clip);
  }));
};

export const obtenerClip = async (id) => {
  const { data, error } = await supabase.from('clips').select('*').eq('id', id).single();
  if (error) throw error;
  return normalizeClip(data);
};

export const moderarClip = async (id, estado, moderadorId, motivo) => {
  const { data, error } = await supabase.from('clips').update({ estado, moderado_por: moderadorId, moderado_en: new Date().toISOString(), motivo_moderacion: motivo || null }).eq('id', id).select().single();
  if (error) throw error;
  return normalizeClip(data);
};
