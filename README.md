# gardenos-web

Friends-and-family docs site for the Garden Monitor project. See `Projects/Garden Monitor/Specs/2026-04-27-gardenos-web-design.md` in the vault for the design.

## Develop
```bash
npm install
npm run dev
```

## Publish from vault
```bash
cp .env.local.example .env.local   # then edit GARDEN_VAULT_PATH
npm run publish
```
