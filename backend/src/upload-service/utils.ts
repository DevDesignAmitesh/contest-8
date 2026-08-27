import fs from "fs";
import { PDFParse } from "pdf-parse";
import { readFile } from "fs/promises"
import type { Chunks, Docs, ParsedDoc } from "../types";

export async function parsePdf(filePath: string): Promise<ParsedDoc[]> {
  try {
    // 1. Read file into a binary buffer
    const dataBuffer = await readFile(filePath);
    
    // 2. Instantiate the parser with the buffer
    const parser = new PDFParse({ data: dataBuffer });
    
    // 3. Extract text content and metadata
    const text = await parser.getText();
        
    // 4. Clean up parser memory instance
    await parser.destroy();

    return text.pages.map((pg) => ({
      pageNumber: pg.num,
      pageContent: pg.text,
      source: filePath,
    }));
  } catch (error) {
    console.error('Parsing failed:', error);
    throw Error("Something went wrong in parsePdf")
  }
}

export function getDocs(path: string, prevDocs: Docs[]) {
  const docs = prevDocs;
  
  const response = fs.readdirSync(path, { withFileTypes: true })
  
  for (const res of response) {
    const dervidedPath = `${path}/${res.name}`;
    const fileName = res.name.replace(/ /g,'').replace(".pdf", "");

    console.log(fileName)
    
    
    if (res.isFile()) {
      docs.push({
        path: dervidedPath,
        fileName,
      })

    } else {
      getDocs(dervidedPath, docs)
    }
  }
  
  return docs;
}

// overlapping based chunking
export function chunking(dataToChunk: ParsedDoc[]) {
  const CHUNK_SIZE = 10000; 
  const OVERLAP = 500; 
  const chunks: Chunks = {}
  
  for (let i = 0; i < dataToChunk.length; i++) {
    const elm = dataToChunk[i];
    if (!elm) continue;

    const key = `${elm.source}-${elm.pageNumber}`;
    
    for (let i = 0; i < elm.pageContent.length; i += CHUNK_SIZE - OVERLAP) {
      if (chunks[key] === undefined) {
        chunks[key] = []
      }

      chunks[key]?.push({
        key,
        content: elm.pageContent.slice(i, CHUNK_SIZE + i),
        source: elm.source,
        pageNum: elm.pageNumber
      })
    }
  }
  
  return chunks;
}

export function chunkToArray(chunks: Chunks) {
  const dataToReturn = [];

  for (const [_chunkKey, chunkContent] of Object.entries(chunks)) {
    for (const [idx, elm] of chunkContent.entries()) {
      dataToReturn.push({ 
        id: `${elm.key}-i${idx}`, 
        pgNum: elm.pageNum, 
        text: elm.content, 
        source: elm.source
      })
    }
  }
  
  return dataToReturn;
}
