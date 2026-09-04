import { createClient } from '@supabase/supabase-js';
import { config } from './config.js';

export const supabase = config.supabase.url && config.supabase.key
	? createClient(config.supabase.url, process.env.SUPABASE_SERVICE_ROLE_KEY || config.supabase.key)
	: null;
