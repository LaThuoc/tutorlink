import { NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";
export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("test_connection")
    .select("*");

  if (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
    });
  }

  return NextResponse.json({
    success: true,
    data,
  });
}