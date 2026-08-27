export type ParsedDoc = {
  pageNumber: number
  pageContent: string
  source: string
}


// key should be like: source-pageNum
export type Chunks = Record<string, {
  key: string
  content: string;
  pageNum: number;
  source: string
}[]>

export type Docs = { path: string, fileName: string }