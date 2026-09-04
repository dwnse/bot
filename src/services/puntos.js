import { supabase } from '../supabase.js';
import { config } from '../config.js';

export const obtenerRanking = async (limite = 20) => {
  const { data, error } = await supabase.from('miembros').select('id,nombre_usuario,nombre_mostrar,puntos_totales,tier:tiers(nombre,color)').eq('estado', 'activo').order('puntos_totales', { ascending: false }).limit(limite);
  if (error) throw error; return data || [];
};
export const obtenerCategorias = async (query = '') => {
  let request = supabase.from('categorias_puntos').select('*').order('nombre').limit(25);
  if (query) request = request.ilike('nombre', `%${query}%`);
  const { data, error } = await request; if (error) throw error; return data || [];
};
export const obtenerHistorial = async (id, limite = 15) => {
  const { data, error } = await supabase.from('movimientos_puntos').select('*, categoria:categorias_puntos(nombre)').eq('miembro_id', id).order('creado_en', { ascending: false }).limit(limite);
  if (error) throw error; return data || [];
};
export const cambiarPuntos = async (miembroId, categoriaId, cantidad, motivo) => {
  if (!config.supabase.puntosRpc) {
    const error = new Error('Configura SUPABASE_PUNTOS_RPC con el nombre de la funcion autorizada de Supabase.');
    error.code = 'PUNTOS_RPC_MISSING';
    throw error;
  }
  const { data, error } = await supabase.rpc(config.supabase.puntosRpc, {
    p_miembro_id: miembroId,
    p_categoria_id: categoriaId,
    p_cantidad: cantidad,
    p_motivo: motivo,
    p_evento_id: null,
  });
  if (error) throw error;
  return data;
};