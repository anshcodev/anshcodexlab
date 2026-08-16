const supabaseClient = supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

const responsiveLogoStyles = document.createElement('link');
responsiveLogoStyles.rel = 'stylesheet';
responsiveLogoStyles.href = 'responsive-logo.css';
document.head.appendChild(responsiveLogoStyles);

async function getSession(){ const {data}=await supabaseClient.auth.getSession(); return data.session||null; }
async function getProfile(id){ const {data}=await supabaseClient.from('profiles').select('id,full_name,company,role').eq('id',id).single(); return data||null; }
async function logout(){ await supabaseClient.auth.signOut(); location.href='login.html'; }
