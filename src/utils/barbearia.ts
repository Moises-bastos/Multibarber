import { supabase } from "../lib/supabase";

export async function buscarMinhaBarbearia() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado.");
  }

  const { data, error } = await supabase
    .from("barbearias")
    .select("id, nome, slug")
    .eq("owner_id", user.id)
    .single();

  if (error) {
    throw error;
  }

  return data;
}
