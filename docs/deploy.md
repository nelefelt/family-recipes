# Production topology and deploy

This is the source of truth for **how Family Recipes is hosted and released**. Workflow YAML is the source of truth for **exact steps**. Do not invent Azure resources, GitHub variables, identities, or URLs that are not listed here or in the workflows.

Audience: engineers and coding agents changing CI, App Service, SQL access, Entra, or runtime config.

## System

```
GitHub (nelefelt/family-recipes)
  PR  ──► jobs: test, api-contract, frontend-test   (required checks)
          job:  e2e                                 (runs, not required yet)
  main ──► package ──► deploy               (only if DEPLOY_ENABLED=true)
                 │         │
                 │         ├─ OIDC ──► user-assigned identity ──► Azure control plane
                 │         ├─ efbundle ──► Azure SQL (data plane)
                 │         └─ zip deploy ──► App Service (api, web)
                 │
                 └─ artifacts: api-package, web-package, efbundle

Entra External ID tenant "Family Recipes"     Microsoft Entra tenant "Standardkatalog"
  end-user sign-in (CIAM)                       Azure subscription, App Service, SQL, billing
  app registrations + user flow                 managed identities + RBAC
```

Two Microsoft directories. They are not interchangeable. Hosting and IAM live in **Standardkatalog**. People who cook recipes sign in through **Family Recipes** (`ciamlogin.com`).

## Runtime

Region: Sweden Central. Resource group: `rg-family-recipes`. Infra is portal-managed; this repo does not provision Azure.

| Resource | Azure name | Runtime |
|---|---|---|
| App Service plan (Linux B1, shared) | `plan-family-recipes` | — |
| API | `familyrecipes-api-nelefelt` | .NET 10 |
| Web | `familyrecipes-web-nelefelt` | Node 24, Next.js standalone, start `node server.js` |
| SQL server / database | `familyrecipes-sql-nelefelt` / `familyrecipes` | Azure SQL, Entra-only auth |
| Deploy identity | `id-familyrecipes-deploy` | User-assigned managed identity |

Public URLs are the App Service **unique** hostnames (`*.swedencentral-01.azurewebsites.net`), stored in GitHub `AZURE_API_BASE_URL` and `AZURE_WEB_BASE_URL`. Do not use `https://{app}.azurewebsites.net`; DNS will fail.

SQL is Entra-only. There is no SQL username/password. The API never opens a SQL firewall rule; only the GitHub runner does, for the duration of `efbundle`.

## Identity

Azure RBAC (control plane) and SQL users (data plane) are separate. An IAM role never grants `SELECT`. A SQL user never starts an App Service deploy.

| Principal | Kind | Azure RBAC | SQL database roles |
|---|---|---|---|
| `id-familyrecipes-deploy` | User-assigned MI. Federated credential subject: `repo:<org-id>/<repo-id>:environment:production` | Website Contributor on **each** web app. Custom role **SQL Firewall Rule Operator** on the **SQL server** (`Microsoft.Sql/servers/firewallRules` only) | `db_ddladmin`, `db_datareader`, `db_datawriter` |
| API app `familyrecipes-api-nelefelt` | System-assigned MI | None on the SQL *resource*. It does not manage Azure. | `db_datareader`, `db_datawriter` |
| End users | CIAM user flow `FamilyRecipesSignUpSignIn` | None | None. They call the API with a JWT. |

The API connects with App Setting `ConnectionStrings__DefaultConnection` using `Authentication=Active Directory Default`. The token is the app’s system-assigned identity. The database guest list is `CREATE USER … FROM EXTERNAL PROVIDER` inside the database, not an IAM assignment on the SQL server.

GitHub authenticates with OIDC (`azure/login@v2` + `id-token: write`). No Azure client secret is stored in GitHub.

## Pipeline

Workflows: `.github/workflows/ci.yml`, `.github/workflows/rollback.yml`.

| Trigger | Jobs | Notes |
|---|---|---|
| Pull request | `test`, `api-contract`, `frontend-test` | Required. `package` / `deploy` do **not** run on PRs. |
| Push to `main` and `vars.DEPLOY_ENABLED == 'true'` | `test`, `api-contract`, `frontend-test` → `package` → `deploy` | The three check jobs run in parallel and `package` needs all of them. `package` and `deploy` use GitHub environment `production` (deployment branch: `main` only). |
| Pull request and push to `main` | `e2e` | Playwright against an E2E web build and a test-only API host (`tests/FamilyRecipes.Api.E2EHost`) with SQL Server in Docker. Not in `package.needs` yet, so it does not block deploy. |
| `workflow_dispatch` on `main` | `rollback` | Restores `api-package` and `web-package` from a previous green `run_id`. Does **not** run `efbundle`. Schema is not reversed. |

`DEPLOY_ENABLED` is a **repository** variable (job-level `if` runs before environment binding). Everything else listed below is on environment `production`.

`deploy` and `rollback` share concurrency group `production` (`cancel-in-progress: false`).

Deploy order: open runner IP on SQL firewall → `efbundle` → delete firewall rule → zip-deploy API → zip-deploy web → smoke `GET {AZURE_API_BASE_URL}/health` and `GET {AZURE_WEB_BASE_URL}/`. A red smoke test means the job failed; the new zip may already be on the apps.

`package` dummy connection string for `dotnet ef migrations bundle` is CI-only (efbundle still needs a connection string at build). Production connection is injected at migrate time.

E2E uses a fake sign-in, enabled only by `E2E_BUILD=1` in `family-recipes-web/playwright.config.ts`. That build goes to `.next-e2e` and is never uploaded. `package` fails if the marker `e2e-fake-auth` is found in `artifacts/web`.

Next.js `NEXT_PUBLIC_*` is compiled into the web artifact during `package`. Changing App Service settings does not update those values; re-run `package`.

`web-package` upload **must** set `include-hidden-files: true`. Without it, `.next` is dropped and the app returns 503 (`no production build`).

## Configuration inventory

| Value | Lives in | Used by |
|---|---|---|
| `DEPLOY_ENABLED` | GitHub **repository** variable | Job `if` on `package` / `deploy` |
| `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, `AZURE_SUBSCRIPTION_ID` | Environment `production` | OIDC login (Standardkatalog / deploy MI) |
| `AZURE_RESOURCE_GROUP`, `AZURE_SQL_SERVER`, `AZURE_SQL_DATABASE`, `AZURE_API_APP_NAME`, `AZURE_WEB_APP_NAME` | Environment `production` | Azure CLI + zip deploy |
| `AZURE_API_BASE_URL`, `AZURE_WEB_BASE_URL` | Environment `production` | Smoke tests; web URL is also the SPA origin |
| `NEXT_PUBLIC_MSAL_*`, `NEXT_PUBLIC_API_SCOPE`, `NEXT_PUBLIC_API_BASE_URL` | Environment `production` | Web **build** in `package` |
| `ConnectionStrings__DefaultConnection` | API App Service settings | Runtime SQL (`Active Directory Default`) |
| `Cors__AllowedOrigins__0` | API App Service settings | Must equal the unique web hostname |
| `AzureAd` (tenant, client, audience/scope) | `FamilyRecipes.Api/appsettings.json` | API token validation (CIAM tenant) |
| SPA redirect URIs | Entra app **FamilyRecipes.Web** in the CIAM tenant | Production unique web URL (trailing `/`) and localhost |
| Web start command `node server.js`, `HOSTNAME`, `SCM_DO_BUILD_DURING_DEPLOYMENT=false` | Web App Service settings | Standalone Node; Kudu must not rebuild |

Local development is a different process and a different config load: API user secrets → local SQL; web `.env` → `localhost`. Same repository, not the same connection string or origin.

## Agent contract

Read this file and the workflow YAML before changing deploy, identity, App Service, SQL auth, CORS, Entra redirects, or GitHub environments.

Do:

- Keep required PR checks as `test`, `api-contract` and `frontend-test` only.
- Keep OIDC; do not add Azure secrets to GitHub.
- Apply schema with `efbundle` in `deploy`, never in application startup.
- Scope deploy RBAC to the two web apps plus the SQL firewall custom role. Do not grant subscription or resource-group Contributor to the deploy identity.
- After adding an EF migration, expect `deploy` (not the API process) to apply it.
- After changing `NEXT_PUBLIC_*`, change the GitHub environment variable and ship via `package`.

Do not:

- Provision, rename, or delete Azure resources from an agent session unless a human explicitly asks.
- Treat Website Contributor (or any Azure IAM role) as database access.
- Put SQL passwords in config; the server is Entra-only.
- Run `efbundle` from `rollback.yml`.
- Set `E2E_BUILD` anywhere except `playwright.config.ts`, or remove the `e2e-fake-auth` check from `package`.
- Smoke-test against `*.azurewebsites.net` instead of the unique regional hostname.
- Upload `web-package` without hidden files.
- Widen the federated credential subject away from `environment:production` on `main`.
- Point `AzureAd` at Standardkatalog, or create App Service resources in the CIAM tenant.
