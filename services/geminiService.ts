import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.API_KEY || ''; // Ensure this is set in your environment
const ai = new GoogleGenAI({ apiKey });

export interface AISuggestion {
  productName: string;
  quantity: number;
  unit: string;
  reason: string;
}

export const generateEventStockSuggestion = async (
  eventType: string,
  guests: number,
  durationHours: number
): Promise<AISuggestion[]> => {
  try {
    const model = 'gemini-3-flash-preview';
    
    const prompt = `
      Atuo como planejador de bar para eventos. Preciso de uma lista de sugestão de estoque (bebidas e insumos principais) para um evento com as seguintes características:
      - Tipo: ${eventType}
      - Convidados: ${guests}
      - Duração: ${durationHours} horas.
      
      Considere um consumo médio padrão. Retorne apenas os itens essenciais (Vodka, Gin, Whisky, Energético, Tônica, Frutas, Gelo).
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              productName: { type: Type.STRING },
              quantity: { type: Type.NUMBER },
              unit: { type: Type.STRING },
              reason: { type: Type.STRING }
            },
            required: ['productName', 'quantity', 'unit', 'reason']
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as AISuggestion[];
    }
    return [];
  } catch (error) {
    console.error("Error generating suggestions:", error);
    return [];
  }
};

export const analyzeFinancialHealth = async (
  revenue: number,
  expenses: number,
  pendingEvents: number
): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `
                Analise brevemente a saúde financeira desta empresa de bar de eventos em 2 frases.
                Faturamento Total: R$ ${revenue}
                Despesas Totais: R$ ${expenses}
                Eventos Pendentes: ${pendingEvents}
                Dê uma dica estratégica.
            `
        });
        return response.text || "Análise indisponível no momento.";
    } catch (e) {
        return "Erro ao conectar com IA.";
    }
}
