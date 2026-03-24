import { HfInference } from "@huggingface/inference";

const hf = new HfInference(process.env.NEXT_PUBLIC_HF_API_KEY);

export const suggestTimeline = async (category: string, userLocation: string) => {
  try {
    const prompt = `Act as a senior project manager. A client from ${userLocation} wants a ${category} project. 
    Based on common industry standards for high-quality solo development, suggest a realistic timeline range (e.g., 2-4 weeks or 2-3 months) 
    and a 1-sentence reasoning. Keep it brief and professional.
    
    Category: ${category}
    Location: ${userLocation}
    Suggested Timeline:`;

    const response = await hf.textGeneration({
      model: "mistralai/Mistral-7B-Instruct-v0.3",
      inputs: prompt,
      parameters: { max_new_tokens: 60, temperature: 0.7, return_full_text: false },
    });

    return response.generated_text.trim() || "3-6 weeks (Based on project scope)";
  } catch (error) {
    // Log as warning instead of error to avoid Next.js dev overlay popups for non-critical failures
    console.warn("AI Suggestion Fallback used (API unavailable or limit reached)");
    return "2-4 weeks (Based on project complexity)";
  }
};

export const validateEmail = (email: string) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

export const hasProfanity = (text: string) => {
  const forbidden = ["abuse", "spam", "scam", "badword1", "badword2"]; // Add actual words or use a library
  const regex = new RegExp(forbidden.join("|"), "gi");
  return regex.test(text);
};
