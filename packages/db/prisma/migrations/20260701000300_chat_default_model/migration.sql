-- Le chatbot public utilisait par défaut `openrouter/fusion`, un méta-routeur qui
-- renvoie un comparatif multi-modèles verbeux (inadapté à un visiteur). On bascule
-- le défaut de `AiAssistantConfig.model` vers un modèle unique, propre et peu coûteux.
-- Le modèle reste éditable au back office (`/ai`).
ALTER TABLE "AiAssistantConfig" ALTER COLUMN "model" SET DEFAULT 'deepseek/deepseek-v4-flash';
