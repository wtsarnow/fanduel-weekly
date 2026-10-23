# Updating FanDuel Weekly
All content comes from `data/weeks.json`. No build step is needed.
1. Add a new object to `weeks` with: week, dates, autotune, beat80 (true, false, or null while pending), summary, entries[], data_points[{k,v}], worked[], didnt[], patches[].
2. Entry fields: slate, contest, fee, lineup, score, rank, field, pct = (field-rank)/field*100, winnings, plus optional cash_line, top20_rank, winner, note, estimated:true, pct_note.
3. Use null for any unknown value; the site shows it as "pending". Never invent numbers. Set `estimated:true` for estimates.
4. If the auto-tune status changes, add a row to `autotune_history` and bump `updated`.
5. Preview locally with `python3 -m http.server` (fetch() does not work from file://). Commit and push to the gh-pages repo.
Sources: fd-beat80-ledger.md, fd-field-calibration.csv, fd-monday-weekly-report-*.md, slate folders such as tnf-w7/.
