import supabase from './supabase';

/**
 * Sign in with Google using Supabase's native OAuth
 * This will redirect to Google's OAuth page and back to your app
 */
export async function signInWithGoogle() {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/login`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      console.error('[google-auth]', error.message);
      throw error;
    }

    // The user will be redirected to Google's OAuth page
    // After successful authentication, they'll be redirected back to /login
    return data;
  } catch (error) {
    console.error('[google-auth] Failed to initiate Google sign-in:', error);
    throw error;
  }
}

/**
 * Handle OAuth callback from Google
 * Supabase automatically handles the callback, but you can use this
 * function to detect when a user returns from OAuth
 */
export function isOAuthCallback() {
  const params = new URLSearchParams(window.location.search);
  return params.has('code') || params.has('error');
}
