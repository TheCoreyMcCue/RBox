import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("image") as File;

    if (!file) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const mimetype = file.type || "image/png";

    const prompt = `
Extract the recipe from this image and return ONLY minified JSON in this shape:

{
  "title": string,
  "description": string,
  "cookTime": number,
  "ingredients": [{ "amount": string, "unit": string, "name": string }],
  "steps": [string],
  "categories": [string]
}

No markdown. No commentary. JSON only.
`;

    const response = await axios.post(
      "https://api.openai.com/v1/responses",
      {
        model: "gpt-4o-mini",
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_image",
                image_url: `data:${mimetype};base64,${base64}`,
              },
              {
                type: "input_text",
                text: prompt,
              },
            ],
          },
        ],
        max_output_tokens: 1500,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    // ⚠️ FIXED: Correct output extraction
    const rawOutput =
      response.data.output?.[0]?.content?.[0]?.text ??
      response.data.output_text ??
      "";

    if (!rawOutput || typeof rawOutput !== "string") {
      throw new Error("Model returned no text content.");
    }

    // Extract JSON block
    const start = rawOutput.indexOf("{");
    const end = rawOutput.lastIndexOf("}");

    if (start === -1 || end === -1) {
      throw new Error("No JSON object found in model output.");
    }

    const jsonString = rawOutput.slice(start, end + 1);
    const parsed = JSON.parse(jsonString);
    console.log("🚀 ~ POST ~ parsed:", parsed);

    return NextResponse.json(parsed);
  } catch (err: any) {
    console.error("❌ OCR Parse Error:", err?.response?.data || err);
    return NextResponse.json(
      { error: err?.response?.data || err.message },
      { status: 500 }
    );
  }
}
