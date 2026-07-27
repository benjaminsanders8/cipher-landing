# Health Economist brain refresh — standing instructions

Purpose: keep the website chatbot's research library (`bot/knowledge-econ.md`) in
sync with Ben's healthcare-economics article folder in Google Drive. Runs on a
weekly schedule; also runnable on demand ("refresh the economist's brain").

Repo: `/Users/benjaminsanders/cipher-landing` (auto-deploys to
cipherhealthanalytics.com on push to `main`).

## Steps

1. **Safety check.** Run `git status` in the repo. If the working tree has
   uncommitted changes, ABORT and report — never mix a brain refresh with
   in-progress work.

2. **List the Drive folder.** Use the Google Drive tools (load via ToolSearch:
   `search_files`, `read_file_content`). Query
   `parentId = '1yyfefcj2t5hioP0NofoVVA0JzwkIdk_x'` and paginate with
   `pageToken` until exhausted. If the Drive tools are unavailable or return
   auth errors, ABORT without changing anything and report that the Drive
   connection was missing from this run.

3. **Find new articles.** Load `bot/econ-manifest.json`. A file is NEW if its
   id appears in neither `digested` nor `excluded`. Where an article exists as
   both `.md` (summary) and `.pdf`, prefer the `.md` and mark BOTH ids as
   digested. Skip non-article files (conversation logs, notes) — add them to
   `excluded` with a reason instead. If nothing is new, report "no new
   articles" and stop.

4. **Digest each new article.** Read it with `read_file_content` and write one
   entry in exactly the format used throughout `bot/knowledge-econ.md`:

   ```
   ### <Study title> (<Journal/Publisher> <Year>)
   - <2–4 findings carrying the specific figures stated in the file — never
     numbers from your own knowledge>
   - Employer angle: <one sentence on why a self-insured employer/CFO cares>
   ```

   Place each entry under the best-fitting existing `##` theme section (create
   a new section only if nothing fits). Paraphrase — never copy sentences from
   the source. Facts must come only from the file itself.

5. **Update the manifest.** Add each processed file id to `digested` with its
   title and today's date.

6. **Rebuild.** Run `node bot/build-knowledge.js` in the repo — it must print
   the new size without errors. Sanity check:
   `node -e "require('/Users/benjaminsanders/cipher-landing/api/_knowledge.js')"`.

7. **Ship.** Commit `bot/knowledge-econ.md`, `bot/econ-manifest.json`, and
   `api/_knowledge.js` with message `Economist brain refresh: +N articles`,
   push to `main`, and confirm the push succeeded.

8. **Report.** Summarize: how many articles added, their titles, or why the
   run aborted. On any failure, leave the repo clean (`git checkout .` if
   needed) rather than half-updated.
