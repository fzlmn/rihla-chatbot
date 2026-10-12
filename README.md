# Rihla — Chatbot guide touristique du Maroc

Rihla (« voyage » en arabe) est un chatbot qui aide les voyageurs à préparer et vivre leur séjour au Maroc : villes à visiter, transports, coutumes, budget.

Projet réalisé dans le cadre du TP *Développement d'un chatbot spécialisé* — module Applications avancées en IA, Mundiapolis.

## Structure

```
rihla/
├── notebook/          # Phase 1 : prototype dans un notebook
├── .env.example       # modèle de configuration (sans secret)
├── requirements.txt   # dépendances Python
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

Puis ouvrir `.env` et coller la clé Groq (https://console.groq.com/keys) après `LLM_API_KEY=`.

## Lancement

*(à compléter)*
