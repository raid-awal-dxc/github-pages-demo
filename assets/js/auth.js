// 1) Configuration — replace these with your project values
const SUPABASE_URL = "https://xumlsuztbidtgawiplff.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_Y3CbHu7ASRYD9ZDB7j4N-Q_OuaTHekc";

// Where to send users after login/logout
const DEFAULT_POST_LOGIN_REDIRECT = "/dashboard.html";
const DEFAULT_POST_LOGOUT_REDIRECT = "/";

// 2) Create a single client instance using the CDN-loaded Supabase
let supabase;

function initSupabase() {
  if (supabase) return supabase;
  supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  });
  return supabase;
}

// 3) Auth APIs

/**
 * Sign up with email + password.
 * If "Confirm email" is enabled in Supabase, user must confirm before they can sign in.
 * Returns { ok: true, user } or { ok: false, error }.
 */
export async function signUp(email, password) {
  await initSupabase();
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return { ok: false, error };
  return { ok: true, user: data?.user ?? null };
}

/**
 * Sign in with email + password.
 * Returns { ok: true, user } or { ok: false, error }.
 */
export async function signIn(email, password, { redirectTo = DEFAULT_POST_LOGIN_REDIRECT } = {}) {
  await initSupabase();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, error };

  if (redirectTo) location.assign(redirectTo);
  return { ok: true, user: data?.user ?? null };
}

/**
 * Login function
 */
async function login(email, password) {
    const { user, error } = await supabase.auth.signIn({
        email,
        password
    });
    if (error) {
        console.error('Login error:', error.message);
        return null;
    }
    return user;
}

/**
 * Get the current user (or null if signed out).
 */
export async function getUser() {
  await initSupabase();
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    console.warn("getUser error:", error.message);
    return null;
  }
  return data?.user ?? null;
}

/**
 * Require an authenticated user; otherwise redirect to login.
 * Call at the top of any protected page.
 */
export async function requireAuth(redirectTo = "/login.html") {
  const user = await getUser();
  if (!user) {
    // Preserve intended destination: /login.html?next=/protected.html
    const params = new URLSearchParams({ next: location.pathname + location.search });
    location.assign(`${redirectTo}?${params.toString()}`);
    return null;
  }
  return user;
}

/**
 * Subscribe to auth state changes.
 * handler(event, session) where event ∈ 'SIGNED_IN' | 'SIGNED_OUT' | ...
 * Returns an unsubscribe function.
 */
export async function onAuthChange(handler) {
  await initSupabase();
  const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
    try { handler(event, session); } catch (e) { console.error(e); }
  });
  return () => sub.subscription.unsubscribe();
}

/**
 * Sign out and redirect to the login page (by default).
 */
export async function signOut(redirectTo = DEFAULT_POST_LOGOUT_REDIRECT) {
  await initSupabase();
  await supabase.auth.signOut();
  if (redirectTo) location.assign(redirectTo);
}

/**
 * (Optional) Change password for the current user.
 * Requires the user to be signed in.
 */
export async function updatePassword(newPassword) {
  await initSupabase();
  const { data, error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) return { ok: false, error };
  return { ok: true, user: data?.user ?? null };
}

// Make functions globally available
window.signUp = signUp;
window.signIn = signIn;
window.getUser = getUser;
window.requireAuth = requireAuth;
window.signOut = signOut;
