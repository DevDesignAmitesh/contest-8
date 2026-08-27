import type { Metadata, QueryResult } from "chromadb"

export function generateKeyWordsAndRelatedCollectionsSystemPrompt() {
  return `
  you have information about below given documents 
  and user is asking some information from those documents only
  and your job is to understand from which document is this user wants details from
  and also you have to create keywords based upon the user's query for better searching

  and then return the response
  
  documents are:
    orignal_datasets:
      - 8PrinciplesofEffectiveIntervention
      - 2022ColoradoCommunityCorrectionsStandardscopy
      - check-in-guidelines
      - grievance-and-appeal
      - internal-programming
      
      
    transcripts:
      - robert-5-21
      - robert-05-07
      - nathan-05-19
      - nathan-04-14
      - nathan-06-02
  `;
}

export function getGenerateAnswerSystemPrompt(
  keywords: string[], 
  collectedData: QueryResult<Metadata>[]
) {
  return `
    used asked some questions from some documents and now we have the following contexts to let the user knwo about the data

    keywords generated from user's query: ${keywords}
    collectedData which we found from our database: ${JSON.stringify(collectedData.map((data) => ({
      metadetas: data.metadatas,
      documents: data.documents,
      ids: data.ids,
    })))}
  
    you job is to present these data nicely to the user, and also return the sources from where you get these answers
  `;
}