# Triage Labels

The skills speak in terms of five canonical triage roles. This file maps those roles to the actual label strings used in this repo's issue tracker.

| Label in mattpocock/skills | Label in our tracker | Meaning                                  |
| --------------------------- | --------------------- | ----------------------------------------- |
| `needs-triage`               | — (no label)           | Maintainer needs to evaluate this issue   |
| `needs-info`                 | — (no label)           | Waiting on reporter for more information  |
| `ready-for-agent`            | `agent:ready`          | Fully specified, ready for an AFK agent   |
| `ready-for-human`            | — (no label)           | Requires human implementation             |
| `wontfix`                    | — (no label)           | Will not be actioned                      |

Only `ready-for-agent` has a real equivalent in this repo (`agent:ready`, already used by the CI agent pipeline — see `agent:running` / `agent:success` / `agent:failed` / `agent:partial` / `agent:escalate` for its lifecycle). The other four roles are not tracked via a label here — do not create new labels for them; leave the role untagged.
