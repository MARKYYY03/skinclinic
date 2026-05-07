import { supabaseClient } from "@/lib/supabase/supabase-client";

export interface LoginResult {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  user: {
    id: string;
    email: string | null;
  } | null;
}

export async function loginUser(email: string, password: string): Promise<LoginResult> {
  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data || !data.session) {
    throw new Error("Login failed: no session returned from Supabase.");
  }

  return {
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    expires_in: data.session.expires_in,
    token_type: data.session.token_type,
    user: data.user
      ? {
          id: data.user.id,
          email: data.user.email ?? null,
        }
      : null,
  };
}
