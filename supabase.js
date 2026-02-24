// Supabase Project Credentials
const SUPABASE_URL = "https://scxayzvcckijkftftrag.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_mPrRMpO6P43ZVMPnbDvcFQ_F7e6giG9";

// Create Supabase Client
const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);