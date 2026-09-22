# Lina — Serveur d'inférence propriétaire (spec matériel + logiciel)

Objectif : héberger **chez Zeniva** le modèle Lina (Qwen3 fine-tuné) et le servir à toutes les
agences clientes via une API compatible OpenAI. Le site, Supabase et ZeniPay restent sur le cloud ;
seul le modèle tourne sur ce serveur.

État actuel du PC de dev : GTX 1080 Ti (11 Go) — suffisant pour tester un 7-8B quantisé avec Ollama,
**pas** pour servir des clients.

---

## Option A — Départ (≈ 9 500-12 000 $ CAD)

| Composant | Choix | Pourquoi |
|---|---|---|
| GPU | **2× NVIDIA RTX 5090 32 Go** (64 Go total) | Qwen3-14B en BF16 (28 Go) + gros batch, ou Qwen3-32B en FP8 (34 Go) |
| CPU | AMD Ryzen 9 9950X | 16 cœurs, PCIe 5.0 |
| Carte mère | ASUS ProArt X870E ou équivalent avec 2 slots PCIe x16 espacés | deux GPU 3 slots |
| RAM | 128 Go DDR5 | chargement modèle + cache |
| Stockage | 4 To NVMe Gen4 (Samsung 990 Pro) + 8 To SATA (backups poids/datasets) | un modèle 14B ≈ 30 Go, garder 5-10 versions |
| Alimentation | 1600 W 80+ Platinum (Corsair AX1600i / Seasonic) | 2× 575 W GPU |
| Boîtier | Fractal Torrent ou Lian Li O11 XL | airflow pour 2 GPU |
| UPS | APC 1500 VA line-interactive | coupures Hydro-Québec |
| OS | Ubuntu Server 24.04 LTS | drivers NVIDIA + Docker |

Capacité : Qwen3-14B ≈ **30-60 conversations simultanées**, ~40-70 tok/s par flux.

## Option B — Sérieuse (≈ 18 000-25 000 $ CAD)

Même base, GPU remplacé par **1× RTX PRO 6000 Blackwell 96 Go** (≈ 12-14k CAD).
Qwen3-32B en BF16 sans compromis, 100+ conversations simultanées, une seule carte (moins de bruit,
moins de chaleur, blower adapté aux racks). C'est la carte à viser dès que 5+ agences paient.

## Option C — Colocation plus tard

Quand les agences exigent un SLA : déplacer le serveur dans un datacenter Montréal
(eStruxture, OVH Beauharnois) ≈ 200-400 $/mois pour 1U-4U + alimentation redondante + fibre.

---

## Réseau

- Fibre **Bell / Vidéotron affaires** avec IP fixe, ou **Cloudflare Tunnel** (gratuit, pas besoin d'ouvrir de port,
  TLS inclus, protège le serveur) → `https://lina-api.zeniva.ca`
- Vercel appelle `https://lina-api.zeniva.ca/v1/chat/completions` avec une clé API que tu génères.
- Bascule automatique : si le serveur ne répond pas en 3 s, la route `/api/lina` retombe déjà sur
  Groq/Claude/Gemini/OpenAI (chaîne de fallback existante). Zéro interruption de service.

---

## Logiciel de serving

### Production : vLLM (gère la concurrence, API OpenAI)

```bash
docker run --gpus all -p 8000:8000 \
  -v /srv/models:/models \
  -e VLLM_API_KEY=<clé-secrète> \
  vllm/vllm-openai:latest \
  --model /models/lina-qwen3-14b \
  --served-model-name lina \
  --tensor-parallel-size 2 \          # = nombre de GPU
  --max-model-len 16384 \
  --gpu-memory-utilization 0.92 \
  --enable-prefix-caching             # les system prompts d'agence sont réutilisés → 3-5× plus rapide
```

Côté Vercel (`.env`) :
```
OPENAI_API_BASE=https://lina-api.zeniva.ca/v1
OPENAI_API_KEY=<clé-secrète>
OPENAI_MODEL=lina
```
Aucun changement de code : `/api/lina` et `/api/chat` utilisent déjà ces variables.

### Dev / test : Ollama

Convertir les poids en GGUF (`llama.cpp/convert_hf_to_gguf.py` puis `llama-quantize Q8_0`), puis :

```
# Modelfile
FROM ./lina-qwen3-14b-Q8_0.gguf
PARAMETER temperature 0.6
PARAMETER num_ctx 16384
```
```bash
ollama create lina -f Modelfile
ollama run lina
```

---

## Sécurité et propriété

- Poids stockés sur le NVMe **chiffré (LUKS)** + copie hors ligne sur disque externe + copie chiffrée dans un bucket privé.
- Clé API par agence (table `agencies` → `lina_api_key`), quota par plan, journalisation dans `lina_training_turns`.
- Dépôt de marque **Lina** (USPTO classe 42 + OPIC). Licence Qwen3 = Apache 2.0 → aucune attribution obligatoire.
- CGU agences : leurs données ne servent à l'entraînement que sur consentement explicite (argument commercial vs OpenAI).

---

## Feuille de route

| Étape | Quand | Coût |
|---|---|---|
| Migration `lina_training_turns` appliquée, collecte en cours | maintenant | 0 |
| 3 000 échanges notés ≥ 4 | 6-8 semaines | ton temps |
| Commande serveur Option A | dès que la collecte est lancée | 9,5-12k CAD |
| Fine-tune v1 sur 8×H100 loués | quand le dataset est prêt | 2-5k $ |
| vLLM en prod, Vercel pointe sur lina-api.zeniva.ca | semaine suivante | 0 |
| Multi-tenant SaaS : clé API + quota + widget par agence | 8-12 semaines | ton temps |
