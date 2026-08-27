import type { Request, Response } from "express";
import { generateAnswer, generateKeyWordsAndRelatedCollections } from "../ai";
import { queryCollection } from "../chroma";
import type { Metadata, QueryResult } from "chromadb";

export async function handleChat(req: Request, res: Response) {
  const { query } = req.query as { query: string };
  
  if (!query || query.length <= 10) {
    res.status(403).json({ message: "query should be atleast of 10 characters"})
    return;
  }
  
  const generatedResults = await generateKeyWordsAndRelatedCollections(query);
  
  if (!generatedResults) {
    res.status(400).json({ message: "unable to get response from AI" })
    return;
  }
  
  console.log("generatedResults", generatedResults)
  
  const { collections, keywords } = generatedResults;

  const collectedData: QueryResult<Metadata>[] = [];
  
  for (const collection of collections) {
    collectedData.push(await queryCollection(keywords, collection))
  }
  
  const response = await generateAnswer(query, keywords, collectedData);
    
  res.status(200).json({ response })
}