# Triage Labels

Labels that say where a backlog issue stands. They apply to GitHub issues,
not to OpenSpec changes: once a change exists, its state is in the change.

| Label             | Meaning                                                        |
| ----------------- | -------------------------------------------------------------- |
| `needs-triage`    | Maintainer needs to evaluate this issue                        |
| `needs-info`      | Waiting on more information before it can be picked up         |
| `ready-for-agent` | Clear enough for an agent to take to `/openspec-propose` unaided |
| `ready-for-human` | Needs a person: a decision, hands-on work, or access to a running system |
| `wontfix`         | Will not be actioned                                           |

`ready-for-agent` doesn't skip review. A change that touches relationship
data, sync or access control still has a person read its proposal and
design before `/openspec-apply-change` ([openspec.md](openspec.md)).

The `wayfinder:*` labels are retired; see [issue-tracker.md](issue-tracker.md).
