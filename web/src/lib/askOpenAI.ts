// Utilitaire pour appeler l'API OpenAI (GPT-3.5/4)
export async function askOpenAI(prompt: string, apiKey: string): Promise<string> {
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "user", content: prompt }
        ],
        max_tokens: 150,
        temperature: 0.7
      })
    });

    if (!res.ok) {
      console.error("OpenAI API error status:", res.status);
      const errorText = await res.text();
      console.error("OpenAI API error details:", errorText);

      if (res.status === 401) {
        return "Erreur d'authentification OpenAI. Vérifiez que votre clé API est valide et n'a pas expiré.";
      } else if (res.status === 429) {
        return "Limite d'utilisation OpenAI atteinte. Veuillez réessayer plus tard.";
      } else if (res.status === 500) {
        return "Erreur serveur OpenAI. Veuillez réessayer.";
      } else {
        return "Erreur technique avec OpenAI. Veuillez réessayer.";
      }
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content || "Je n'ai pas pu générer de réponse.";
  } catch (error) {
    console.error("OpenAI request error:", error);
    return "Erreur de connexion. Veuillez vérifier votre connexion internet.";
  }
}
