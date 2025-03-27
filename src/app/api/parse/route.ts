// src/app/api/parse/route.ts

import { NextRequest, NextResponse } from "next/server";
import { parseRecipe } from "../../../lib/openai/parseRecipe";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const recipeText = body.recipeText;

  if (!recipeText || typeof recipeText !== "string") {
    return NextResponse.json(
      { error: "Missing or invalid 'recipeText'" },
      { status: 400 }
    );
  }

  try {
    const parsed = await parseRecipe(recipeText);

    if (!parsed) {
      return NextResponse.json(
        { error: "Failed to parse recipe" },
        { status: 500 }
      );
    }

    return NextResponse.json(parsed, { status: 200 });
  } catch (error: any) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
