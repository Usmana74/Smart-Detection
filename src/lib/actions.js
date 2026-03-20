import { supabase } from "@/integrations/supabase/client";
export async function uploadAndSave(imageFile, mode, results) {
  const fileName = `${Date.now()}-${imageFile.name}`;
  const { error: upErr } = await supabase.storage
    .from("classification-images")
    .upload(fileName, imageFile);
  if (upErr) throw upErr;
  const { data } = supabase.storage
    .from("classification-images")
    .getPublicUrl(fileName);
  const { error: dbErr } = await supabase
    .from("classifications")
    .insert({
      image_url: data.publicUrl,
      mode,
      top_label: results.topLabel,
      confidence: results.confidence,
      all_results: results.allResults,
    });
  if (dbErr) throw dbErr;
  return data.publicUrl;
}
export async function fetchHistory() {
  const { data, error } = await supabase
    .from("classifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) throw error;
  return data;
}

import { supabase } from "@/integrations/supabase/client";

export async function uploadAndSave(imageFile, mode, results) {
  const fileName = `${Date.now()}-${imageFile.name.replace(/\s/g, "_")}`;

  const { error: upErr } = await supabase.storage
    .from("classification-images")
    .upload(fileName, imageFile);

  if (upErr) {
    console.error("Storage error:", upErr.message);
    throw upErr;
  }

  const { data } = supabase.storage
    .from("classification-images")
    .getPublicUrl(fileName);

  const { error: dbErr } = await supabase
    .from("classifications")
    .insert({
      image_url: data.publicUrl,
      mode,
      top_label: results.topLabel,
      confidence: results.confidence,
      all_results: results.allResults,
    });

  if (dbErr) {
    console.error("DB error:", dbErr.message);
    throw dbErr;
  }

  return data.publicUrl;
}

export async function fetchHistory() {
  const { data, error } = await supabase
    .from("classifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) throw error;
  return data ?? [];
}

export async function fetchCount() {
  const { count, error } = await supabase
    .from("classifications")
    .select("*", { count: "exact", head: true });

  if (error) throw error;
  return count ?? 0;
}