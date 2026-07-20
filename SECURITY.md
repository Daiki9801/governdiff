# Security Policy

## Supported version

GovernDiff is a Build Week demonstration. Security fixes apply to the latest revision on the default branch; older snapshots are not maintained as supported releases.

## Reporting a vulnerability

Use GitHub's **Security → Report a vulnerability** flow for this repository. Private vulnerability reporting is enabled. Do not open a public issue for a suspected vulnerability, exposed credential, or sensitive-data concern.

Include the affected component, reproducible steps using synthetic data, expected behavior, and impact. Do not include real employee, expense, policy, customer, or credential data in a report.

## Credential safety

- `OPENAI_API_KEY` is optional and server-only.
- Never commit a token, `.env.local`, or any browser-readable `NEXT_PUBLIC_OPENAI_API_KEY`.
- Prefer a process-scoped environment variable and remove it after stopping the development server.
- If a credential is exposed, revoke it with its provider before reporting the incident.

## Data boundary

Live analysis sends only the built-in synthetic policy text, target version, and static field/rule catalogs to OpenAI. CSV records, expense identifiers, employee data, Findings, Impact, Evidence, approvals, and releases remain local. See [README.md](README.md#data-and-privacy-boundary) for the complete boundary and limitations.
