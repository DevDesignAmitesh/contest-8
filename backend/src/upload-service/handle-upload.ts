import { generateEmbeddings } from "../ai";
import { storeInVectorDB } from "../chroma";
import type { Docs } from "../types";
import { chunking, chunkToArray, getDocs, parsePdf } from "./utils";

export async function handleUpload(docs: Docs[]) {
  for (const { fileName, path } of docs) {
    // 1. fetching and parsing all the pdfs
    const parsedData = await parsePdf(path);
    
    // 2. chunking them
    const chunks = chunking(parsedData);
    const chunkInArray = chunkToArray(chunks);
    
    // 3. creating embeddings of them
    const embeddings = await generateEmbeddings(chunkInArray.map((chunk) => chunk.text));
    
    // 4. storing in chroma db
    await storeInVectorDB(
      embeddings, 
      chunkInArray.map((chunk) => chunk.text), 
      chunkInArray.map((chunk) => chunk.id),
      chunkInArray.map((chunk) => ({ 
        "pageNumber": chunk.pgNum, 
        "source": chunk.source, 
      })),
      fileName
    )
  }
}


await handleUpload(getDocs("./src/dataset", []))