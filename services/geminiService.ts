
import { GoogleGenAI } from "@google/genai";

// Initialization is moved inside the function to follow guidelines for multi-key environments 
// and to ensure the most up-to-date API key from process.env.API_KEY is used for each request.
export const askAssistant = async (question: string, medications: any[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const medsContext = medications.map(m => `- ${m.name}: ${m.dosage}, ${m.frequency}`).join('\n');
  
  const prompt = `
    Você é um assistente virtual gentil e prestativo chamado "Cuidador Amigo", especializado em ajudar idosos a entenderem seus medicamentos.
    A usuária é uma mãe que precisa de orientações simples e claras.
    
    Medicamentos atuais dela:
    ${medsContext}
    
    Informação importante sobre o App:
    - O app rastreia o progresso por doses (ex: 5 de 20).
    - Se a usuária clicar em "Pular Dose", o app NÃO aumenta o contador. Isso significa que o tratamento não "acabou" mais rápido; a dose continua sobrando e ela terá que tomá-la ao final, o que adia o término do tratamento. Isso é importante para garantir que ela tome toda a medicação prescrita pelo médico.
    
    Pergunta da usuária: "${question}"
    
    Regras:
    1. Responda em português de forma carinhosa e simples.
    2. Use termos fáceis de entender.
    3. Sempre mencione que ela deve consultar o médico dela se tiver dúvidas sobre efeitos colaterais graves.
    4. Se ela perguntar sobre pular doses ou adiar o fim do tratamento, explique que o app faz isso para ela não esquecer de terminar a caixinha completa do remédio.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Desculpe, não consegui entender agora. Pode repetir?";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Ops! Tive um probleminha para pensar. Tente novamente em um instante.";
  }
};
