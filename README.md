# Klar

Klar is an offline-first German practice app for LAG1201. It covers Units 0-4 of the July 2026 *Das Leben A1* glossary, textbook and lesson sheets, with a separate Semester Test 1 practice category.

## What works now

- Randomized quizzes restricted by unit and question type
- Dedicated routes for setup (`/`), focused practice (`/quiz`), and results (`/results`)
- All 368 Unit 0-4 glossary entries
- Coverage-first family sampling, so gender counterparts and alternate prompts cannot repeat in one quiz
- A recent-use cooldown that favors unseen and least-recently shown families across quizzes
- Exam-shaped noun questions: article, singular, plural, combined singular and plural, and `X` for a missing form
- Verb infinitives tested once in either translation direction
- 78 grammar drills covering introductions, pronouns, conjugation, compounds, articles, accusative, negation and word order
- 44 semester-test items across listening, articles, conjugation, questions, negation, syntax and reading
- Vocabulary quiz and Semester test presets that respect the selected chapters
- Source references and reasoning tips in Study feedback and answer review
- Optional glossary spellings, alternative plurals and plural-only nouns
- Exact spelling, noun capitalization, and umlauts for full credit
- Partial credit for capitalization errors, `ae/oe/ue/ss`, transpositions, and small typos
- Study mode with immediate reasoning tips and Exam mode with review at the end
- Word exposure, question-format exposure, and progress stored locally in the browser
- Installable PWA with an offline app shell and cached sample-test recordings

Choose **Vocabulary quiz** for glossary recall or **Semester test** for sample-paper tasks. Select Units 0-4 for all semester sections. Study gives immediate feedback; Exam saves corrections until the end. Semester practice is randomized and uses one point per card, rather than reproducing the paper's timing or marking scheme.

See [Curriculum and sources](docs/curriculum.md) for coverage, source references and import instructions, and [Architecture and established decisions](docs/architecture.md) for the code structure, question contract, grading and sampling rules.

## Run locally

No JavaScript dependencies or build step are required.

```powershell
python -m http.server 4173
```

Open `http://127.0.0.1:4173`.

After updating an existing installation, reload once while online. The app
refreshes setup when the updated offline content is ready; during practice it
offers a **Reload app** action. Saved progress is retained.

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
  --units 0 1 2 3 4
```

The course-folder shortcut is another way to locate the workbook if the parent path is unavailable. Grammar data lives in `src/data/grammar.js` and `src/data/foundations.js`; semester data lives in `src/data/semester.js`. Each item includes a source reference shown in feedback and review. Preserve content IDs when editing so stored progress stays valid.

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

The MVP is deliberately client-only. Quiz generation, grading, routing, and progress storage run in the browser, which keeps deployment small and makes the app usable offline. NGINX serves `index.html` for direct requests to client-side routes, and the service worker uses the cached app shell as the offline navigation fallback. The curriculum is separate from the quiz engine, so additional units can be generated from the glossary without rewriting the interface.

The PWA can later be wrapped with Capacitor for iOS and Android. Voice recognition should be added behind a `PronunciationProvider` boundary so browser speech APIs and native speech services can share the same quiz model. WASM embeddings can be loaded in a Web Worker and used as an optional semantic grading strategy without replacing exact exam grading.

## Repository workflow

Current development branch: `feat/units-0-4-semester-practice`.

Keep curriculum imports, app behavior, and deployment changes in separate commits. Commit author details are read from this repository's local Git configuration.
