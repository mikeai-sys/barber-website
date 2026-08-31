import { createClient } from "@supabase/supabase-js";

const url =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  "https://vcoukinlerisnlpfauxy.supabase.co";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjb3VraW5sZXJpc25scGZhdXh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2MzQ1ODgsImV4cCI6MjEwMDIxMDU4OH0.wQO7pKAMd7PoKWPo5qpw_gGS_yUTd62zdVrMXcB_-E4";
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('SUPABASE_SERVICE_ROLE_KEY missing — using anon key (RLS will apply)');
}

const supabase = createClient(url, serviceKey);

export default supabase;
