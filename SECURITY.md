# Security Policy

## Supported versions

The `main` branch is the supported development line. Deploy only reviewed commits and keep dependencies updated through pull requests.

## Reporting a vulnerability

Do not open a public issue for a suspected vulnerability. Report it privately to the project owner with:

- A short description and severity
- Affected route, file, or dependency
- Reproduction steps that do not include real customer data
- Suggested mitigation, if known

Do not include passwords, session cookies, database credentials, API keys, or personal data in a report.

## Secret handling

- `.env` files are ignored and must remain outside Git.
- Use `.env.example` only as a placeholder template.
- Rotate any credential that has appeared in source, logs, screenshots, commits, or chat.
- If a secret was committed, assume it is compromised. Rotate it first, then remove it from history with an approved repository-history rewrite.
- The repository previously contained default bootstrap credentials in older commits. Those credentials must never be used; provision a new admin password through the environment.

## Production security baseline

- HTTPS is required.
- `SESSION_SECRET` is required and must be random.
- `CORS_ORIGINS` must be an explicit allowlist.
- MongoDB must require authentication and private network access.
- Use `/api/ready` as the database readiness probe.
- Restrict production access with capability permissions and audit financial mutations.
- Keep backups encrypted and test restoration regularly.
