# Issue tracker: GitHub

GitHub issues are this repo's backlog and intake: bugs, ideas, open
questions, and decisions waiting on a person. Specs and changes don't live
here. They live in OpenSpec (see [openspec.md](openspec.md)). Use the `gh`
CLI for all operations.

## Conventions

- **Create an issue**: `gh issue create --title "..." --body "..."`. Use a heredoc for multi-line bodies.
- **Read an issue**: `gh issue view <number> --comments`, filtering comments by `jq` and also fetching labels.
- **List issues**: `gh issue list --state open --json number,title,body,labels,comments --jq '[.[] | {number, title, body, labels: [.labels[].name], comments: [.comments[].body]}]'` with appropriate `--label` and `--state` filters.
- **Comment on an issue**: `gh issue comment <number> --body "..."`
- **Apply / remove labels**: `gh issue edit <number> --add-label "..."` / `--remove-label "..."` (see [triage-labels.md](triage-labels.md))
- **Close**: `gh issue close <number> --comment "..."`

Infer the repo from `git remote -v`; `gh` does this automatically when run inside a clone.

GitHub shares one number space across issues and PRs, so a bare `#42` may be either: resolve with `gh pr view 42` and fall back to `gh issue view 42`.

## From issue to change

- **Picking up an issue**: assign it (`gh issue edit <n> --add-assignee @me`)
  and start an OpenSpec change. The change's `proposal.md` links the issue.
  Comment on the issue with the change name so it can be found from GitHub.
- **Scope and design live in the change**, not on the issue. Don't split a
  change into child issues; its steps are `tasks.md`.
- **Questions found while working**: answer them inside the change. Open a
  new issue only for something outside the change's scope (CLAUDE.md:
  "flag, don't decide").
- **Closing**: the PR that applies and archives the change says
  `Closes #<n>`.

## Retired: Wayfinder

Wayfinder maps (`wayfinder:map`) and their child tickets (`wayfinder:*`
labels) were how this repo planned work until #57. The labels are kept so
closed issues keep their history. Don't apply them to new issues or create
new maps.
