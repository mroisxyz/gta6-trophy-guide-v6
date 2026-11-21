[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/mroisxyz/gta6-trophy-guide-v5/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/mroisxyz/gta6-trophy-guide-v5/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

# Leonida Ledger — GTA VI trophy audit & tracker

A dense, citation-first offline guide to all 55 PlayStation 5 trophies in Grand Theft Auto VI. Every entry carries the official name, description and grade, a guide written for this project, numbered source chips on every step, and a 57-page register drawn from 19 sites read on 20 November 2026. Conflicting reports on the Chapter 1 meditation, the bowling alley and Ten Pin are shown as positions A and B rather than silently resolved.

The app is a tracker: earned trophies, personal count chips and display settings persist in `localStorage`, with JSON export and import. Filters cover story, missable, collectibles, activities, PSN-hidden, disputed and not-earned entries; grade chips, search and roadmap ordering keep the checklist quick to scan. A spoiler shield masks unearned story names until they are earned. Demo parameters combine `?view=roadmap|missables|sources`, `?filter=missable`, `?trophy=<exact name>` and `?spoiler=1`.

Static files under `app/` only. The single local dossier fetch reads `app/data/trophies.json`; source URLs are anchors that open only when clicked, and no remote asset or Rockstar artwork is used.

## Run it

```
node serve.ts
```

[Enter the make.fun bounty](https://make.fun/bounty/gta6-trophy-guide-01?ref=jhbwqchj)
