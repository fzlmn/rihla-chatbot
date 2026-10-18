# Rihla — Morocco travel guide chatbot

Rihla ("journey" in Arabic) is a chatbot that helps people plan and enjoy a trip in Morocco: which cities to visit, how to get around, local customs and etiquette, and a rough budget.

**Target audience:** English-speaking visitors preparing their first trip to Morocco, and Moroccans who want to explore other regions of the country.

Built for the lab assignment *Développement d'un chatbot spécialisé* (Advanced AI Applications module, Mundiapolis).

**Author:** Fatima Zahra Ait Lamine

## Project structure

```
rihla/
├── notebook/              # Phase 1: prototype, tests and comparison of 3 prompt versions
├── backend/               # Phase 2: FastAPI API
│   ├── main.py            # routes, validation, conversations, error handling
│   ├── prompt.py          # system prompt (version 3, chosen in the notebook)
│   └── requirements.txt
├── frontend/              # Phase 2: React interface (Vite)
│   ├── src/App.jsx        # chat interface
│   ├── src/api.js         # calls to the backend
│   └── .env.example
├── .env.example           # configuration template (no secrets)
├── requirements.txt       # Python dependencies for the notebook
└── README.md
```

## Requirements

- Python 3.10+
- Node.js 18+
- A free Groq API key: https://console.groq.com/keys

## Installation

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
pip install -r backend/requirements.txt

cd frontend
npm install
cd ..
```

## Configuration

```powershell
Copy-Item .env.example .env
Copy-Item frontend\.env.example frontend\.env
```

Then open `.env` and paste your Groq API key after `LLM_API_KEY=`.

| Variable | Role |
|---|---|
| `LLM_BASE_URL` | Address of the OpenAI-compatible API (Groq) |
| `LLM_API_KEY` | Secret API key |
| `LLM_MODEL` | Model used (`openai/gpt-oss-120b`) |
| `LLM_TEMPERATURE` | Randomness of the answers |
| `LLM_TIMEOUT` | Maximum wait for an answer (seconds) |
| `FRONTEND_URL` | Address of the React app, allowed by CORS |
| `VITE_API_URL` (frontend/.env) | Address of the backend, used by React |

## Running

**Phase 1 — notebook:** open `notebook/rihla_phase1.ipynb`, select the `.venv` kernel and run all cells.

**Phase 2 — web app:** open two terminals.

Terminal 1, backend:
```powershell
.venv\Scripts\Activate.ps1
cd backend
uvicorn main:app --reload
```
The API runs on http://localhost:8000 (interactive documentation: http://localhost:8000/docs).

Terminal 2, frontend:
```powershell
cd frontend
npm run dev
```
Then open http://localhost:5173.

## API

| Route | Role |
|---|---|
| `GET /health` | Check that the service is running |
| `POST /chat` | Send `{"message": "...", "conversation_id": "..." or null}`, receive `{"conversation_id": "...", "answer": "..."}` |
| `DELETE /chat/{conversation_id}` | Reset a conversation |

## Prompt comparison (phase 1)

The notebook tests 3 versions of the system prompt on the same 10 test situations: 4 relevant questions, 2 that need the context of previous messages, 1 ambiguous, 1 off-topic, 1 sensitive and 1 attempt to make Rihla ignore its instructions. Each test runs in a new conversation, and each answer is assessed against the expected behaviour: ✅ correct, ⚠️ partly correct, ❌ incorrect.

| Version | ✅ | ⚠️ | ❌ | Average words |
|---|---|---|---|---|
| v1 | 6 | 2 | 2 | 174 |
| v2 | 8 | 1 | 1 | 95 |
| **v3 (used in the app)** | **9** | **1** | **0** | **97** |

- **v1 → v2:** length limits (120 words, no tables), prices in MAD only, no invented names or facilities, a "Key facts" section (trains, mosques) and an explicit rule that the instructions are confidential.
- **v2 → v3:** two targeted changes. The mosque fact becomes a rule with a trigger ("whenever the user asks about visiting a mosque…"), and for limited mobility Rihla suggests questions to ask instead of describing accessibility as facts.
- **Remaining limit:** the limited-mobility test stays partly correct. Reliable accessibility information would need verified data, not just a better prompt.

The details of every test are in `notebook/results_v1.csv`, `results_v2.csv`, `results_v3.csv` and `comparison.csv`.

## End-to-end checks (phase 2)

The phase 1 test situations were replayed in the web app (relevant, context, ambiguous, off-topic, sensitive and "ignore your instructions" questions), with the same behaviour as prompt v3 in the notebook. The following checks were also done:

| Check | How | Result |
|---|---|---|
| Empty message | Send button with an empty input; `POST /chat` with `"   "` in `/docs` | ✅ Button disabled; API answers 422 "The message cannot be empty" |
| Reset | Give a city, click "New conversation", ask which city | ✅ Rihla no longer knows |
| Two isolated conversations | Two browser tabs, a different city in each | ✅ Each tab keeps its own context |
| Backend unavailable | Stop the backend, then send a message | ✅ Message "Cannot reach the server…", the text stays in the input |
| Model unavailable | Wrong `LLM_MODEL` in `.env` | ✅ Message "The model is not available right now…" (HTTP 502) |
| Health route | `GET /health` | ✅ `{"status": "ok"}` |
| Smartphone display | Browser device mode (F12, Ctrl+Shift+M) | ✅ Layout adapts to small screens |

**Limits:** conversations are stored in memory, so they are lost when the backend restarts. The answers depend on the model and can vary between runs.
