import { supabase } from '../supabase.js';
export const obtenerEstado = async (discordId) => { const { data, error } = await supabase.from('solicitudes_miembro').select('*').eq('discord_id', discordId).order('creado_en', { ascending: false }).limit(1).maybeSingle(); if (error) throw error; return data; };
export const obtenerPendientes = async () => { const { data, error } = await supabase.from('solicitudes_miembro').select('*').eq('estado', 'pendiente').order('creado_en'); if (error) throw error; return data || []; };
export const revisarSolicitud = async (id, estado, adminId, motivo) => { const { data, error } = await supabase.from('solicitudes_miembro').update({ estado, revisado_en: new Date().toISOString(), motivo_rechazo: motivo || null }).eq('id', id).select().single(); if (error) throw error; return data; };

export const aprobarSolicitud = async (id) => {
	const { data: solicitud, error: requestError } = await supabase.from('solicitudes_miembro').select('*').eq('id', id).eq('estado', 'pendiente').single();
	if (requestError) throw requestError;
	const { data: existing, error: existingError } = await supabase.from('miembros').select('id').eq('usuario_id', solicitud.usuario_id).maybeSingle();
	if (existingError) throw existingError;
	if (existing) {
		const error = new Error('Este usuario ya es miembro del clan.');
		error.code = 'MEMBER_ALREADY_EXISTS';
		throw error;
	}
	const { data: member, error: memberError } = await supabase.from('miembros').insert({
		usuario_id: solicitud.usuario_id,
		nombre_usuario: solicitud.nombre_usuario,
		nombre_mostrar: solicitud.nombre_mostrar,
		minecraft_username: solicitud.minecraft_username,
		fecha_ingreso: solicitud.fecha_ingreso || new Date().toISOString(),
		estado: 'activo',
	}).select().single();
	if (memberError) throw memberError;
	await revisarSolicitud(id, 'aprobada', null, null);
	return member;
};