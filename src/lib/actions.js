import { supabase } from "./supabaseClient";
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
