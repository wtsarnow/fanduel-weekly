# Updating FanDuel Weekly
All content comes from `weeks.json` (repo root). No build step is needed.
1. Add a new object to `weeks` with: week, dates, autotune, beat80 (true, false, or null while pending), summary, entries[], data_points[{k,v}], worked[], didnt[], patches[].
2. Entry fields: slate, contest, fee, lineup, score, rank, field, pct = (field-rank)/field*100, winnings, plus optional cash_line, top20_rank, winner, note, estimated:true, pct_note.
3. Use null for any unknown value; the site shows it as "pending". Never invent numbers. Set `estimated:true` for estimates.
4. If the auto-tune status changes, add a row to `autotune_history` and bump `updated`.
5. Preview locally with `python3 -m http.server` (fetch() does not work from file://). Commit and push to the gh-pages repo.
Sources: fd-beat80-ledger.md, fd-field-calibration.csv, fd-monday-weekly-report-*.md, slate folders such as tnf-w7/.

## Analytics data pipeline (players.json / signals.json)

Files at the repo root (upload all of them each week):
- `players.json` – one row per player per NFL game (every game, not just ours), key `game_id|player|team`.
  QB/RB/WR/TE/K with a box-score line, every DST, and FD-salaried players who did not record a stat (0 pts).
- `signals.json` – correlations, per-position correlations, bucket comparisons, top patterns, coverage. Recomputed every run.
- `analytics.js` – Analytics tab + Tournament-type analytics on the Dashboard.

Run (from `/workspace/fanduel-weekly`):
```
python3 tools/collect_signals.py --week 8                          # all final Week 8 games
python3 tools/collect_signals.py --week 8 --slate tnf              # tnf | sun | snf | mnf | all
python3 tools/collect_signals.py --week 8 --game 2026_08_XXX_YYY   # one game (nflverse game_id)
python3 tools/collect_signals.py --week 8 --trends                 # also Google Trends (slow; null when rate-limited)
python3 tools/collect_signals.py --analyze-only                    # just rebuild signals.json
```
The script is idempotent: rows are upserted by key, and existing Wikipedia/Trends values are kept.
Unplayed games produce no rows. ESPN summaries are cached in `tools/cache/espn/`.

Before running a new week:
1. Refresh `/workspace/pbp/games.csv` and `/workspace/pbp/pbp26.csv.gz` (nflverse) so the game has scores, lines, rest days and the defense ranks are current.
2. Add that week's FD board / projection files to `BOARDS` at the top of the script (week, path, parser kind, salary type).
3. Add any new lineup files to `lineup_counts()` and the MVP list.
4. Run the script, check `players.json rows` in the output, open the site locally (`python3 -m http.server`) and upload.

Sources: FD points = ESPN box score via /workspace/fdscore.py (the shared scorer); position = rosters2026.csv;
lines/rest/roof/temp = nflverse games.csv; opponent defense rank = EPA/play allowed in earlier weeks (1 = toughest);
Wikipedia = Wikimedia REST pageviews for the 7 days before kickoff (title found via search, must match name);
Google Trends = pytrends, player mean ÷ "NFL" mean in the same request; X mentions = null (the counts API only goes back 7 days).
Nothing is estimated: missing values stay null and show as "n/a".
