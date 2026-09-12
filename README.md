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

## CI/CD and Argo CD

`.github/workflows/ci.yaml` runs on pull requests and pushes to `main`:

1. Check JavaScript syntax, run the test suite, and render the Kustomize manifests.
2. Build the production container, start it, and smoke-test the health endpoint, app shell, glossary, and security headers.
3. On `main` only, publish `ghcr.io/barneylaw/lag-app:<short-sha>` and `:latest`.
4. Check out `BarneyLaw/homelab-cicd-config`, set `apps/lag-app/kustomization.yaml` to the immutable short-SHA tag, validate it, and push a `deploy: lag-app <sha>` commit.
5. Argo CD detects the GitOps commit and automatically syncs the application.

Add a fine-grained repository token as the `CONFIG_REPO_TOKEN` Actions secret. It only needs **Contents: read and write** access to `BarneyLaw/homelab-cicd-config`. Image publishing uses the workflow's built-in `GITHUB_TOKEN`; do not put either token in the repository.

The first successful deployment bootstraps these paths if they are absent:

- `apps/lag-app/` in the GitOps repository
- `argocd/lag-app.yaml` in the GitOps repository

The local `k8s/` directory is the bootstrap template and CI validation fixture. Once bootstrapped, the homelab repository is the deployment source of truth; releases only change its Kustomize image tag.

If the cluster does not already reconcile the GitOps repository's `argocd/` directory, apply the Argo CD `Application` once after the first workflow run:

```powershell
git clone https://github.com/BarneyLaw/homelab-cicd-config.git
kubectl apply -f homelab-cicd-config/argocd/lag-app.yaml
```

The deployment uses `german.lab.packetcraft.dev`, Traefik's `websecure` entrypoint, and the cluster's default `*.lab.packetcraft.dev` TLS certificate. It creates two replicas with health probes and runs the container as UID 101 with no privilege escalation, a read-only root filesystem, and all Linux capabilities dropped.

## Architecture

The MVP is deliberately client-only. Quiz generation, grading, and progress storage run in the browser, which keeps deployment small and makes the app usable offline. The curriculum is separate from the quiz engine, so additional units can be generated from the glossary without rewriting the interface.

The PWA can later be wrapped with Capacitor for iOS and Android. Voice recognition should be added behind a `PronunciationProvider` boundary so browser speech APIs and native speech services can share the same quiz model. WASM embeddings can be loaded in a Web Worker and used as an optional semantic grading strategy without replacing exact exam grading.

## Repository workflow

Current development branch: `feat/unit-2-3-quiz-mvp`.

Keep curriculum imports, app behavior, and deployment changes in separate commits. Commit author details are read from this repository's local Git configuration.
