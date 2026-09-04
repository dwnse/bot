import { supabase } from '../supabase.js';

export const obtenerPerfilCompleto = async (miembroId) => {
  const [miembro, puntos, logros, redes] = await Promise.all([
    supabase.from('miembros').select('*, tier:tiers(*)').eq('id', miembroId).single(),
    obtenerPuntosPorCategoria(miembroId), obtenerLogros(miembroId), obtenerEnlacesSociales(miembroId),
  ]);
  if (miembro.error) throw miembro.error;
  return { ...miembro.data, puntos_por_categoria: puntos, logros, redes_sociales: redes };
};

export const obtenerPuntosPorCategoria = async (id) => {
  const { data, error } = await supabase.from('puntos_miembro_categoria').select('*, categoria:categorias_puntos(*)').eq('miembro_id', id).order('puntos', { ascending: false });
  if (error) throw error; return data || [];
};
export const obtenerLogros = async (id) => {
  const { data, error } = await supabase.from('logros_miembro').select('*, logro:logros(*)').eq('miembro_id', id).order('obtenido_en', { ascending: false });
  if (error) throw error; return data || [];
};
export const obtenerTodosLosLogros = async () => {
  const { data, error } = await supabase.from('logros').select('*').eq('estado', 'activo').order('nombre');
  if (error) throw error; return data || [];
};
export const obtenerEnlacesSociales = async (id) => {
  const { data, error } = await supabase.from('enlaces_sociales_miembro').select('*, plataforma:plataformas_sociales(*)').eq('miembro_id', id);
  if (error) throw error; return data || [];
};