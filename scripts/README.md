# Scripts

Utility scripts for Finding Good V2.

## Persona Insert Script

Insert test personas directly into Supabase for testing.

### Setup

```bash
cd finding-good-v2
pnpm install
```

### Usage

```bash
# List available personas
pnpm persona:list

# Insert a specific persona
pnpm persona marcus
pnpm persona rachel
pnpm persona david
pnpm persona simone
pnpm persona terry

# Insert all personas
pnpm persona:all
```

### Available Personas

| Key | Name | Archetype | Email |
|-----|------|-----------|-------|
| marcus | Marcus Chen | Skeptical Executive | info@findinggood.com |
| rachel | Rachel Torres | Over-Thinker | support@findinggood.com |
| david | David Park | Crisis Arrival | brian@brianfretwell.com |
| simone | Simone Williams | Enterprise Evaluator | bfretwell7@hotmail.com |
| terry | Terry Jackson | Surface Enthusiast | info@findinggood.com |

### What Gets Created

For each persona, the script inserts:
- 1 prediction record
- 1 snapshot with calculated scores (zone breakdown, predictability score, growth opportunity, 48hr question)
- 2-3 future connections
- 2 past connections

### Adding New Personas

Edit `scripts/insert-persona.js` and add to the `PERSONAS` object:

```javascript
newpersona: {
  name: 'Display Name',
  email: 'email@example.com',
  archetype: 'Description',
  prediction: { title, description, type },
  future_story: { fs1, fs2, fs3, fs4, fs5, fs6 },
  past_story: { ps1, ps2, ps3, ps4, ps5, ps6 },
  alignment: { q1, q2, q3, q4, q5, q6 }, // 1-4 each
  future_connections: [...],
  past_connections: [...],
}
```
