import { OpenAIEmbeddingFunction } from "@chroma-core/openai";
import { OpenAI } from "openai";
import { 
  generateKeyWordsAndRelatedCollectionsSystemPrompt, 
  getGenerateAnswerSystemPrompt 
} from "./utils";
import type { Metadata, QueryResult } from "chromadb";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

export async function getOpenaiClient() {
  return new OpenAI();
}

export async function getGeminiEmbidderClient() {
  return new OpenAIEmbeddingFunction({
    apiKey: process.env.OPENAI_API_KEY,
    modelName: "text-embedding-3-small",
  });
}

export async function generateEmbeddings(dataToEmbedded: string[]) {
  const embedder = await getGeminiEmbidderClient();

  const embeddings = await embedder.generate(dataToEmbedded);

  return embeddings;
}


export async function generateKeyWordsAndRelatedCollections(query: string) {
  const keyWordSchema = z.object({
    keywords: z.array(z.string()),
    collections: z.array(z.string()),
  });
  
  const client = await getOpenaiClient();
    
  const response = await client.responses.parse({
    model: 'gpt-5.6',
    input: [
      {
        role: "system",
        content: generateKeyWordsAndRelatedCollectionsSystemPrompt(),
      },
      {
        role: "user",
        content: query
      }
    ],
    text: {
      format: zodTextFormat(keyWordSchema, "keywords_collections")
    }
  });
  
  return response.output_parsed;
}

export async function generateAnswer(
  query: string, 
  keywords: string[], 
  collectedData: QueryResult<Metadata>[]
) {
  const client = await getOpenaiClient();
    
  const response = await client.responses.create({
    model: 'gpt-5.6',
    input: [
      {
        role: "system",
        content: getGenerateAnswerSystemPrompt(keywords, collectedData),
      },
      {
        role: "user",
        content: query
      }
    ],
  });

  return response.output_text;
}