# Contest 8

A RAG chat app: PDF transcripts/policies are embedded into ChromaDB, and a chat endpoint answers questions against them using OpenAI.

Assignment: [AI RAG Case Intelligence System](https://brindle-goal-102.notion.site/AI-RAG-Case-Intelligence-System-3c946b36b2e980a5b16be77ddeb8e640)

## Architecture

- **backend/** — Express + Bun server. `GET /chat?query=...` pulls relevant chunks from ChromaDB and answers via OpenAI.
- **frontend/** — Bun + React + Tailwind chat UI that calls the backend.
- **ChromaDB** — vector store, run via Docker.
- **backend/src/dataset/** — source PDFs seeded into Chroma.

<table>
<tr>
<td align="center"><img src="architecture/seeding-data.png" width="360"><br><sub>seeding flow</sub></td>
<td align="center"><img src="architecture/user-convo.png" width="360"><br><sub>chat request flow</sub></td>
</tr>
</table>

## Prerequisites

- [Bun](https://bun.com)
- Docker (for ChromaDB)
- An `OPENAI_API_KEY` in `backend/.env`

## Run

```bash
bun install    # root runner deps, once
bun run dev    # setup -> seed -> both servers
```

`dev` chains three scripts:

1. `setup` — installs backend/frontend deps, starts ChromaDB (Docker) on `:8000`
2. `seed` — embeds the PDFs in `backend/src/dataset/` into ChromaDB
3. `backend` + `frontend` — run concurrently

- Backend: `http://localhost:4000`
- Frontend: printed in the terminal by the Bun dev server

Run any step alone if needed: `bun run setup`, `bun run seed`, `bun run backend`, `bun run frontend`.
