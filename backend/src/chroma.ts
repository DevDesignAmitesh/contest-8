import { ChromaClient, type Metadata } from "chromadb"
import { getGeminiEmbidderClient } from "./ai"

async function getChromaClient() {
  return new ChromaClient()
}

async function getCollection(collectionName: string) {
  const client = await getChromaClient()

  return await client.getOrCreateCollection({
    name: collectionName,
    embeddingFunction: await getGeminiEmbidderClient()
  })
}

export async function storeInVectorDB(
  embeddings: number[][], 
  documents: string[], 
  ids: string[], 
  metadatas: Metadata[],
  collectionName: string,
) {
  const collection = await getCollection(collectionName)

  await collection.upsert({
    ids,
    embeddings,
    documents,
    metadatas,
  })
}

export async function queryCollection(keywords: string[], collectionName: string) {
  const collection = await getCollection(collectionName)
  
  return await collection.query({
    queryTexts: keywords, 
    nResults: 6, 
    include: ["embeddings", "documents", "metadatas"] 
  })
}