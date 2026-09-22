# Lina Dataset — pipeline vers le modèle propriétaire

Ce dossier transforme les vraies conversations Lina en dataset de fine-tuning.
Le modèle final (Qwen3 fine-tuné, licence Apache 2.0) appartient à Zeniva.

## 1. Collecte (automatique)

Depuis la migration `20260921000000_create_lina_training_turns.sql`, chaque échange
passe par `web/lib/lina-training-log.ts` → table `lina_training_turns` :

| Route | Source | Ce qui est capturé |
|---|---|---|
| `/api/lina` | `lina` | prompt, réponse, historique, system prompt agence, provider |
| `/api/lina-stream` (vocal) | `lina-stream` | idem, réponse reconstituée depuis le flux SSE |

Appliquer la migration : `supabase db push` (ou coller le SQL dans l'éditeur Supabase).

## 2. Revue humaine (c'est ça qui fait la qualité)

Dans Supabase, sur `lina_training_turns` :
- `rating` : 1 = mauvais, 3 = correct, 5 = parfait
- `reviewed_reply` : réécris la réponse idéale → elle remplace `reply` à l'export
- `exclude = true` : tests, spam, données sensibles

Objectif avant le premier entraînement : **3 000 échanges notés ≥ 4**, dont ~500 réécrits à la main.
Priorise : propositions complètes, objections prix, upsell (yacht, croisière), suivi post-voyage.

## 3. Export

```bash
node scripts/lina-dataset/export.mjs                      # tout (non noté inclus)
node scripts/lina-dataset/export.mjs --min-rating 4       # seulement les bons
node scripts/lina-dataset/export.mjs --source lina-stream # seulement le vocal
node scripts/lina-dataset/export.mjs --since 2026-06-01
```

Produit `out/train.jsonl`, `out/val.jsonl` (format ShareGPT, split par session) et `out/stats.json`.
Le PII (emails, téléphones, cartes, NAS) est remplacé par des placeholders — jamais de données client dans les poids.

## 4. Entraînement (GPU loué, ~2 000-5 000 $ par version)

```bash
# sur RunPod / Lambda, image PyTorch 2.x CUDA 12, 8×H100
pip install "axolotl[flash-attn,deepspeed]"
axolotl fetch deepspeed_configs
axolotl train scripts/lina-dataset/axolotl-lina-qwen3-14b.yml
```

Sortie : `out/lina-qwen3-14b/` = **les poids de Lina**. Télécharge-les chez toi, sauvegarde-les sur 2 supports.

## 5. Déploiement

Voir `docs/LINA_SERVER_SPEC.md` (vLLM en production, Ollama en dev).
Le code existant change une seule variable : `OPENAI_API_BASE=http://<serveur>:8000/v1` et `OPENAI_MODEL=lina`.

## Cycle

Collecte → revue → export → entraînement → déploiement → nouvelle collecte.
Chaque version de Lina apprend des corrections faites sur la précédente. Compte un cycle par trimestre.
