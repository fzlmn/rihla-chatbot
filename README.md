# Rihla — Morocco travel guide chatbot

Rihla ("journey" in Arabic) is a chatbot that helps people plan and enjoy a trip in Morocco: which cities to visit, how to get around, local customs and etiquette, and a rough budget.

**Target audience:** English-speaking visitors preparing their first trip to Morocco, and Moroccans who want to explore other regions of the country.

Built for the lab assignment *Développement d'un chatbot spécialisé* (Advanced AI Applications module, Mundiapolis).

**Author:** Fatima Zahra Ait Lamine

**Author:** Fatima Zahra

## Project structure

```
rihla/
├── notebook/          # Phase 1: prototype in a Jupyter notebook
├── .env.example       # configuration template (no secrets)
├── requirements.txt   # Python dependencies
└── README.md
```

## Installation

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

## Configuration

```powershell
Copy-Item .env.example .env
```

Then open `.env` and paste your Groq API key (https://console.groq.com/keys) after `LLM_API_KEY=`.

## Running

*(coming soon)*
