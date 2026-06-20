import { getSupabaseServerClient } from "./supabase";

export async function getReadingPaymentState(readingId?: string | null) {
  if (!readingId) {
    return false;
  }

  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return false;
  }

  const { data, error } = await supabase
    .from("readings")
    .select("is_paid")
    .eq("id", readingId)
    .maybeSingle();

  if (error) {
    console.error("Failed to read paywall state", error);
    return false;
  }

  return Boolean(data?.is_paid);
}

export async function markReadingPaidForTesting(readingId: string) {
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return false;
  }

  const { error } = await supabase
    .from("readings")
    .update({
      is_paid: true,
      paid_at: new Date().toISOString(),
    })
    .eq("id", readingId);

  if (error) {
    console.error("Failed to mark reading as paid", error);
    return false;
  }

  return true;
}
