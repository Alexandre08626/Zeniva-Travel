# Partner Portal — Local dev notes

- Start app: npm --prefix web run dev
- To try Partner signup: visit http://localhost:3000/signup?space=partner
- To try Partner login: http://localhost:3000/login?space=partner

Developer notes:
- Current implementation uses client-side auth store and temporary in-memory APIs under `/api/partner/*`.
- For production, follow the TODO list in `docs/partner-portal.md` and implement server-side auth + DB.
