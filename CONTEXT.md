# Āhau

Āhau is a whakapapa app for whānau, hapū and iwi, where each person and each tribe holds their own account of themselves and no one holds the canonical copy.

## Language

### Spaces

**Your space**:
Everything that belongs to the person whose key is on this device: their own profile, archive and whakapapa. It belongs to that agent, not to a group, and it is not a session. Its address is `#/me`.
_Avoid_: personal group, personal tribe, account, home

**Tribe**:
A whānau, hapū, iwi or other collective that people belong to and act in together, as people see it in Āhau.
_Avoid_: community, group (in anything a person reads)

**Group**:
The Holochain-level arrangement that holds a tribe's shared data and decides who may read and write it. Used only when talking about how tribes are built, never in the app's wording.
_Avoid_: tribe (when the storage and permissions are what's meant)

### Profiles

**Profile**:
A person's own account of themselves, written by them. It is not the canonical record of that person.
_Avoid_: user, account, record

**Personal information**:
The private part of a person's profile (contact details) that only they can see.
_Avoid_: private profile, account details

**Tribe profile**:
A tribe's account of itself: its name, description and the like, as the tribe presents it.
_Avoid_: community profile, group profile

### Whakapapa

**Relative**:
A name-only reference in one person's account of their whakapapa. It is not a canonical person record.
_Avoid_: person (when referring to a name-only reference)

**Relationship**:
One person's account that a parent and child are connected. It does not assert a biological or universal fact.
_Avoid_: biological relationship (unless that is specifically what is meant)

**PersonRef**:
A reference to the author (`Me`) or to a Relative by the action that first created it.
_Avoid_: profile (when referring to a whakapapa reference)

**Me**:
The author of the whakapapa account, as referenced within that author's own relationships.
_Avoid_: self (in app-facing whakapapa language)
