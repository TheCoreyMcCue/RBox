import axios from "axios";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

interface Ingredient {
  amount: string;
  unit: string;
  name: string;
}

interface ParsedRecipe {
  title: string;
  description: string;
  cookTime: number;
  ingredients: Ingredient[];
  steps: string[];
}

interface RecipeResponse {
  choices: {
    message: {
      role: string;
      content: string;
    };
  }[];
}

export const parseRecipe = async (
  recipeText: string
): Promise<ParsedRecipe | null> => {
  if (!OPENAI_API_KEY) {
    console.error("Missing OpenAI API key");
    return null;
  }

  try {
    console.log("Sending request to OpenAI...");

    const response = await axios.post<RecipeResponse>(
      OPENAI_API_URL,
      {
        model: "gpt-4-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant that extracts structured data from cooking recipes. Given a full recipe, respond ONLY with minified JSON. The JSON must include: title (string), description (string), cookTime (number), ingredients (array of { amount, unit, name }), and steps (array of strings). Do NOT include anything outside the JSON — no explanations, comments, or markdown.",
          },
          {
            role: "user",
            content: recipeText,
          },
        ],
        temperature: 0.2,
        max_tokens: 1700,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );

    const resultString = response.data.choices?.[0]?.message?.content;
    // console.log("Raw model output:", resultString);

    if (!resultString) return null;

    // Extract JSON block from the result
    const firstBrace = resultString.indexOf("{");
    const lastBrace = resultString.lastIndexOf("}");
    const jsonString = resultString.slice(firstBrace, lastBrace + 1);

    // Sanitize known formatting issues
    const sanitized = jsonString
      .replace(/[\u2018\u2019\u201A\u201B\u2032\u2035]/g, "'") // single quotes
      .replace(/[\u201C\u201D\u201E\u201F\u2033\u2036]/g, '"') // double quotes
      .replace(/,\s*}/g, "}") // remove trailing commas
      .replace(/,\s*]/g, "]");

    const parsed = JSON.parse(sanitized) as ParsedRecipe;
    // console.log("from function", parsed);

    return parsed;
  } catch (error: any) {
    console.error(
      "Error calling OpenAI:",
      error?.response?.data || error.message
    );
    return null;
  }
};
