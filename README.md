# Bot de Discord del clan

Bot basado en `discord.js` v14 y Supabase. Los comandos se cargan desde `src/commands` y se registran en el servidor indicado por `GUILD_ID`.

## Configuracion

Copia las variables de `.env` y completa `DISCORD_TOKEN`, `DISCORD_CLIENT_ID`, `GUILD_ID`, `SUPABASE_URL`, `SUPABASE_KEY` y `SUPABASE_PUNTOS_RPC`. Esta ultima debe ser el nombre de la funcion autorizada que ya existe en Supabase para modificar puntos y tier. Para operaciones de escritura con RLS habilitado, configura tambien `SUPABASE_SERVICE_ROLE_KEY` en el entorno del servidor. Nunca compartas esa clave ni la uses en frontend. Los canales y el rol de administracion son opcionales: `CHANNEL_ANUNCIOS`, `CHANNEL_ACTIVIDAD`, `CHANNEL_MODERACION`, `CHANNEL_BIENVENIDA` y `ROL_ADMIN`.

Antes de arrancar, ejecuta en Supabase:

```sql
ALTER TABLE public.miembros ADD COLUMN IF NOT EXISTS discord_id text UNIQUE;
```

Para encontrar el nombre y los argumentos de la funcion autorizada, ejecuta en el SQL Editor:

```sql
SELECT p.proname AS funcion,
			 pg_get_function_identity_arguments(p.oid) AS argumentos
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
	AND (p.proname ILIKE '%punto%' OR p.proname ILIKE '%tier%');
```

Si la funcion devuelve `No tienes permiso para asignar puntos`, consulta su definicion:

```sql
SELECT pg_get_functiondef(p.oid)
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
	AND p.proname = 'asignar_puntos_miembro';
```

La funcion debe autorizar el rol `service_role` para el bot o recibir una identidad de administrador que pueda validar. Un rol de Discord no se convierte automaticamente en `auth.uid()` de Supabase.

## Ejecucion

```bash
npm run deploy-commands
npm start
```

`npm run dev` activa el modo watch de Node.js. El bot no puede crear la migracion de Supabase ni descubrir IDs de Discord: ambos valores deben configurarse manualmente.
