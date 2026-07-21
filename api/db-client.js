import { createClient } from "@supabase/supabase-js";

const url =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://vcoukinlerisnlpfauxy.supabase.co";
const serviceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "PLACEHOLDER_SERVICE_KEY";

const supabase = createClient(url, serviceKey);

export default supabase;
