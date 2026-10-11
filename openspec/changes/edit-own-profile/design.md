# Design

## Context

See proposal.md — Why, for motivation, and specs/own-profile/spec.md for
the requirements.

What already exists, because it determines how small this change is:

```
  LAYER                         STATE
  ======================================================================
  integrity/profiles/lib.rs     DONE. validate_update enforces
                                NOT_THE_AUTHOR and
                                UPDATE_MUST_POINT_AT_ORIGINAL on every op
                                that carries an update: StoreEntry,
                                StoreRecord, RegisterUpdate and
                                RegisterAgentActivity, for Profile and for
                                PersonalInformation. ~10 Rust unit tests
                                against a mocked host.
  ----------------------------------------------------------------------
  validation.conductor.ts       DONE. "I can change my own profile, and
                                the change reads back" and the
                                points-at-an-earlier-change refusals pass
                                already, driven through the rogue test
                                zome so they do not rely on our own
                                coordinator behaving.
  ----------------------------------------------------------------------
  coordinator/profiles/lib.rs   Only create_my_profile and
                                get_my_profile. No update extern.
  ----------------------------------------------------------------------
  client.ts                     PROFILE_FUNCTIONS is
                                ['get_my_profile','create_my_profile'].
                                That constant is also the dev signing
                                grant list.
  ----------------------------------------------------------------------
  form logic                    ProfileForm, emptyProfileForm, readForm
                                live in src/first-launch/first-launch.ts.
                                Only the forward direction exists.
  ----------------------------------------------------------------------
  UI state                      App.svelte reads the profile once at
                                launch and passes it into Shell, which
                                is documented as a pure view that
                                imports no client (design D4).
```

One already-answered question worth recording, so nobody re-opens it: a
chain query filtered by entry type returns update records too, so
`get_my_profile`'s "latest on my chain" keeps working unchanged after an
update. That is not an assumption — the existing conductor test asserts the
changed profile reads back.

## Goals / Non-Goals

**Goals:**

- A person can change every field of their own profile, public and private,
  in one form and one save.
- The write is enforced as author-only and point-at-the-original where the
  data is validated, not in the screen.
- The field list stops being duplicated between the create form and the
  edit form, by there being one form.
- The reasoning about why no merge logic exists survives in the repo.

**Non-Goals:**

- Any merge, version-picking or conflict-resolution logic. See D3 and the
  two-device section — there is nothing for it to act on.
- Any change to the integrity zome, entry shapes, or validation rules.
- Retraction, deletion, or truly removing a value from the network.
- Reading or rendering another agent's profile.
- A route for the edit screen, or any change to the navigation scheme.

## Decisions

### D1. One extern taking the whole `MyProfile`, not two

`update_my_profile(MyProfile) -> MyProfile`, mirroring `create_my_profile`.

Alternative considered: separate `update_my_profile` and
`update_my_personal_information` externs, which is the more granular and
more conventional API shape. Rejected because the failure it allows is
exactly the one that matters here: a form that saves the public half, then
fails on the private half, leaves the person's profile half-changed *across
a visibility boundary*. They would have published a change they believe is
paired with a private one that never landed. `create_my_profile` already
chose both-or-neither for the same reason; editing has no weaker a claim.

### D2. The coordinator resolves the original action hash; the client never carries it

Holochain's `update_entry` needs the first version's `ActionHash`.
`get_my_profile` returns entry contents only, so something has to find it.

Alternative considered: return the hash from `get_my_profile` and have the
client pass it back on save. Rejected on two counts. It puts source-chain
internals into UI state, where the rule is that zome calls stay inside the
client module and components never see Holochain concepts. And it creates a
stale-hash failure mode for no benefit — the hash is a fact about the
agent's own chain, derivable on demand, not something the caller knows
better.

So the coordinator queries its own chain for the **first** create of the
entry type. The rogue test zome's `my_original()` is the proven shape for
this; the real coordinator needs its own equivalent.

Note the trap: it must be the *first* create, not the latest record.
Pointing at the latest is precisely what `UPDATE_MUST_POINT_AT_ORIGINAL`
refuses, and the rogue zome has a deliberate `update_my_latest_profile` that
exists only to prove that refusal. Writing this the obvious way — reuse the
"latest on my chain" helper that `get_my_profile` already has — produces
code that compiles, reads naturally, and is rejected at validation.

### D3. Whole-entry replace is right here, and is not last-write-wins

A Holochain update writes a complete new entry, so the client sends the
whole profile and the new version is what the form held.

Alternative considered, and the conventional one: treat the update as a
patch, read the latest entry in the coordinator, merge the changed fields
over it, and write the result. Rejected. It is a read-modify-write against
DHT-adjacent state for no gain, it makes the written entry depend on read
ordering, and it quietly introduces the idea that a profile is assembled
from several sources' contributions — which is the shape rule 2 forbids for
relationships and which has no business appearing here either. The form
already holds every field; it is the complete account, so it should be sent
as one.

The reason whole-entry replace is **not** last-write-wins, stated plainly
because the code looks identical to it:

```
    last-write-wins                 what this does
    -------------------             -------------------------------
    one slot, overwritten           append-only chain, nothing
    older value gone                rewritten, every version kept
    whoever writes last wins        only the author can write at all
    conflict resolved by discard    no conflict to resolve
```

"Which version to show" stays a render-layer decision, as rule 1 requires.
It just happens that for *your own* profile, on your own linear chain, that
decision has one sensible answer and no information is lost by making it.
Rendering someone else's profile is where the decision gets interesting,
and it is deliberately out of scope.

### D4. Personal information is update-or-create

```
   update_my_profile(input)
     |
     |-- original = FIRST Profile create on my chain
     |   update_entry(original, input.profile)
     |
     `-- any PersonalInformation on my chain?
            yes -> update_entry(its first create, input.personal)
            no  -> create_entry(input.personal)
```

Validation refuses an update with nothing to point at, and separately
refuses personal information written before a profile exists — which is
satisfied here, since the profile is already on the chain. `get_my_profile`
already falls back to an empty `PersonalInformation` for an agent that has
none, so the no-entry case is reachable by construction and needs the
create branch.

In practice today `create_my_profile` always writes a personal-information
entry, even an all-empty one, so no live profile lacks it. The branch exists
because the fallback exists; the alternative would be removing that fallback
instead, which would make profiles written before that entry type existed
unreadable. Keeping the fallback and handling the branch is cheaper and
safer.

### D5. One form component, and form logic moves out of first-launch

`ProfileForm`, `emptyProfileForm` and `readForm` move from
`src/first-launch/first-launch.ts` to a new `src/profile/form.ts`, which
gains `profileForm(profile)` — the inverse that seeds the form from a saved
profile. Both the create and edit screens use one shared form component;
they differ in chrome and in what submit calls.

Alternative considered: a field-descriptor table
(`{ key, label, kind, section, autocomplete }`) driving labels, the empty
form, the reader and the inputs generically. Rejected for now. Three of the
fields are genuinely irregular — the gender radios with silhouette images,
the three date-of-birth dropdowns, the disabled photo slot — and the layout
is matched deliberately to the old app's design. A generic renderer would
accumulate per-field escapes and fight that layout. Sharing the component
gets most of the de-duplication with none of that cost, which is why the
re-scoped #55 defers to this change rather than the reverse.

`profileForm` needs a defined fallback for a value the inputs cannot
represent. See R1.

### D6. Profile state lifts to `App.svelte`

`App.svelte` owns `profile`; `Shell` takes an `onsave` callback and bubbles
the saved profile up; the new value flows back down to `TopBar`, `SideNav`
and `ProfilePage`.

Alternatives considered:

| Option | Why not now |
|---|---|
| A profile store module holding the client and current profile, subscribed by the shell's components | Breaks design D4 explicitly, and buys coordination that one writer does not need yet. It is very likely the right answer once a second feature writes — see Open Questions |
| Pass the client into `Shell` and let `ProfilePage` call it | Erodes "components never call Holochain directly" fastest, and for the least benefit |

Lifting keeps the shell a pure view, which is the promise currently written
into `Shell.svelte`. It costs some prop-drilling, which is the honest
trade and is cheap at this size.

### D7. The edit screen is a modal dialog, not a route

The old app used a dialog, the create-profile form is already a dialog over
the welcome screen, and `parseRoute` deliberately rejects a third path
segment — so a route would make this a `navigation` spec change too.

Alternative considered: `#/me/profile/edit`. It would survive a reload and
be linkable. Rejected because nothing asks for either, and the cost is a
change to the route scheme plus a second spec.

### D8. The page says changes add a version

One line next to the Profile section's existing visibility label.

The page already tells the truth about storage rather than what would be
reassuring — "Anyone using Āhau can see this." is on it today, because that
is what a public entry means. Editing raises the same kind of fact: a
correction does not retract the mistake, it sits beside it, and a peer who
holds the old version holds it for good. Saying nothing would be the
conventional choice and would quietly contradict the precedent two lines
above it.

Deliberately one line, not a warning dialog. The person is editing their
own account of themselves, which they are entitled to do; the note is
context, not friction.

### D9. Two devices, offline, conflicting edits, then sync

This cannot happen to one profile, and the design should say so rather than
leave a gap that invites merge logic later.

```
  Case A: two devices, each with its own agent key
  ------------------------------------------------
    device 1, key K1          device 2, key K2
    +-----+-----+             +-----+-----+
    | P1  | P2  |             | Q1  | Q2  |
    +-----+-----+             +-----+-----+
    "Mere"  "Mere Rangi"      "Mere R."  "M. Rangi"

    These are TWO PROFILES, not two versions of one. Each is
    changeable only by its own author. On sync, both survive
    untouched -- there is no collision, because neither points
    at the other's original.

    Which of them is "you" is a per-viewer render decision and
    needs multi-device identity designed first (rule 4). #47
    defers it. Nothing here should pre-empt it, and nothing
    here blocks it.

  Case B: one key copied onto two conductors
  ------------------------------------------------
    Both write to the same chain position -> a source-chain FORK.
    That is a Holochain-level integrity failure, warrantable
    misbehaviour, not an application merge. The app does not get
    a chance to reconcile it and must not pretend to.
```

So: no merge code, and no "pick the winner" code. The test coverage that
follows from this is not a two-devices-offline-then-sync conflict scenario —
there is no conflict to produce — but the two-agent scenario that proves
the *isolation*: agent B cannot change agent A's profile, and each agent's
changes leave the other's profile alone. That is what tasks.md asks for
against a real conductor.

### D10. Where the permission is enforced

Author-only is enforced in `validate_update`, which runs on every op that
carries the update — the author's own record, the update metadata on the
original, and the agent-activity authority. So a conductor that skips its
own validation cannot get a foreign change held as valid by any authority:
the rule holds at sync time and at the time a peer caches the op, not only
when something is read.

The capability grant is the second half. `PROFILE_FUNCTIONS` is both the
client's call list and the dev signing grant, so adding
`update_my_profile` widens that grant by exactly one function and no
more — the grant must continue to list exactly the functions the client
calls, rather than being loosened to a wildcard for convenience.

The screen enforces nothing. It offers an edit control only on the person's
own profile page, which is a usability choice; the guarantee is underneath
it.

**Permissions changing after data has synced.** A profile has no membership
to revoke, so the revoked-member question has no subject here today: the
only permission is authorship, which cannot be transferred or withdrawn —
an agent key either wrote an entry or it did not, for the life of the
chain. The place this question does bite is #67, which may scope profiles
to tribe networks. If it does, a person leaving or being removed from a
tribe leaves their already-synced profile on that tribe's peers, and no
retraction exists to pull it back. This change neither improves nor worsens
that, and deliberately adds no mechanism that would have to be unpicked:
every version it writes is on the author's own chain, under the same
visibility rules as the profile created at first launch.

## Risks / Trade-offs

**R1. A `<select>` seeded with a value it has no option for renders blank,
and the next save silently wipes the field.** → The highest-value risk
here, because it loses data quietly and only on edit. The create form never
met it, since it only ever started empty.

Checked, and the news is good: the date dropdowns were built to cover EDTF
unknown digits, so every date the zome accepts is representable —
`dayOptions` emits `XX` and `1X`/`2X`/`3X`, `monthOptions` emits `XX`, and
`yearOptions` emits `192X`, `19XX`, `2XXX`, `XXXX` and pads back to `0000`.
Each date in the zome's accepting tests (`192X`, `19XX`, `XXXX`,
`1990-XX`, `1990-03-1X`, `XXXX-03-09`, `0042`) is reachable from the three
selects, so `profileForm` can split on `-` without conversion loss.

→ Mitigation anyway: `profileForm` gets a defined, tested fallback for an
unrepresentable value — a profile written by the rogue zome, or by a future
version of the app — rather than relying on the option lists staying in
step with the zome's validation. The fallback must not be "silently
blank".

**R2. `readForm` and `profileForm` drift apart.** Two hand-written
inverse functions over a dozen fields will diverge the first time a field
is added. → Assert `readForm(profileForm(p))` yields `p` as a property over
generated profiles, so drift fails a test rather than losing someone's
data.

**R3. The dev signing grant widens by one function.** → Unavoidable and
small; the mitigation is that the grant keeps listing exactly what the
client calls. #42 (grants accumulating on every page load) is the real
problem and stays its own issue.

**R4. Prop-drilling grows with lifted state.** → Accepted for one writer;
revisited when there is a second. See Open Questions.

**R5. The natural implementation of D2 is wrong and still compiles.**
Reusing the existing "latest on my chain" helper to find the update target
reads naturally and is refused by validation. → The refusal already has
conductor coverage via the rogue zome, and tasks.md adds the same assertion
through the real coordinator, so the mistake fails a test rather than
shipping.

## Migration Plan

No data migration. No entry shape changes, no validation changes, so every
profile already written stays valid and becomes editable as it is.

Rollback is reverting the code. It is safe even after someone has edited:
`get_my_profile` reads the latest entry of each type on the chain, which
is the edited version, so the pre-change app shows the edited profile
correctly rather than reverting to the original. The extra versions on the
chain are inert to it.

The one-way part is not the code but the writing: a published change is on
the DHT and cannot be recalled. That is inherent to the feature, is what
D8's wording tells people, and is why this is worth shipping with that line
rather than after it.

## Open Questions

- **When does lifted state become a store?** D6 is right for one writer.
  The trigger to revisit is the second feature that writes from inside the
  shell — likely tribes or whakapapa. Deferrable: it changes no requirement
  here, and converting prop-drilling to a store later is mechanical.
- **Does clearing a field deserve its own wording, beyond the general
  add-a-version line?** Clearing reads as deletion but is not retraction.
  The spec covers it with a scenario and the general line; whether it needs
  something more pointed is a question for whoever designs retraction, and
  answering it later changes no requirement, approach or task here.
