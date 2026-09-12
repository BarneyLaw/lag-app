# Klar

Klar is an offline-first German practice app for LAG1201. The current MVP covers Units 2 and 3 of the July 2026 *Das Leben A1* glossary and adds grammar exercises from the matching lesson sheets.

## What works now

- Randomized quizzes restricted by unit and question type
- All 141 Unit 2–3 glossary entries
- Exam-shaped noun questions: article, singular, plural, and `X` when no plural is listed
- Verb infinitives and the glossary's third-person conjugations
- Unit 2–3 grammar drills for compounds, `nicht`, `kein-`, articles, conjugation, verb-second word order, questions, and inversion
- Exact spelling, noun capitalization, and umlauts for full credit
- Partial credit for capitalization errors, `ae/oe/ue/ss`, transpositions, and small typos
- Study mode with immediate reasoning tips and Exam mode with review at the end
- Progress and weak-item prioritization stored locally in the browser
- Installable PWA with an offline app shell

## Run locally

No JavaScript dependencies or build step are required.

```powershell
python -m http.server 4173
```

Open `http://127.0.0.1:4173`.

Run the automated checks with Node 20 or newer:

```powershell
npm test
npm run check
```

## Curriculum data

The generated glossary module comes from:

`../Textbook and Accompanying Resources/DasLeben_A1_Glossary_Unit0-Unit8_July2026.xlsx`

Rebuild it after the source workbook changes:

```powershell
python scripts/build_glossary.py `
  "../Textbook and Accompanying Resources/DasLeben_A1_Glossary_Unit0-Unit8_July2026.xlsx" `
  "src/data/glossary.js" `
  --units 2 3
```

The grammar question source is `src/data/grammar.js`. Each item includes the lesson sheet and exercise reference shown in the answer feedback.

## Container

Build and run the unprivileged NGINX image:

```powershell
docker build -t lag-app:local .
docker run --rm -p 8080:8080 lag-app:local
```

The health endpoint is `http://127.0.0.1:8080/healthz`.

## Kubernetes and Traefik

Before applying the manifests:

1. Push the container image to your registry.
2. Replace `ghcr.io/barneylaw/lag-app:latest` in `k8s/deployment.yaml` with the immutable image tag or digest.
3. Replace `german.example.com` in `k8s/ingressroute.yaml` with the real hostname.
4. Match `entryPoints` and `certResolver` to the Traefik installation. The cluster must already have Traefik's CRDs installed.

Deploy:

```powershell
kubectl apply -k k8s
kubectl rollout status deployment/lag-app -n lag-app
```

The manifests create a namespace, two replicas, readiness/liveness probes, a ClusterIP service, and a TLS `IngressRoute`. The container runs as UID 101 with no privilege escalation, a read-only root filesystem, and all Linux capabilities dropped.

## Architecture

The MVP is deliberately client-only. Quiz generation, grading, and progress storage run in the browser, which keeps deployment small and makes the app usable offline. The curriculum is separate from the quiz engine, so additional units can be generated from the glossary without rewriting the interface.

The PWA can later be wrapped with Capacitor for iOS and Android. Voice recognition should be added behind a `PronunciationProvider` boundary so browser speech APIs and native speech services can share the same quiz model. WASM embeddings can be loaded in a Web Worker and used as an optional semantic grading strategy without replacing exact exam grading.

## Repository workflow

Current development branch: `feat/unit-2-3-quiz-mvp`.

Keep curriculum imports, app behavior, and deployment changes in separate commits. Commit author details are read from this repository's local Git configuration.
