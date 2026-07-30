# SD Body mockup — testing copy

Static mirror of the SD Body (Hormones + Wellness) mockup, taken from
`https://bigeasytest.com/SDBody/finalhtml/` so page revisions can be tested
without touching the staging server.

## What's here

| File | What it is |
|---|---|
| `hormones.html` | The hormones page exactly as it is on staging. Untouched. |
| `hormones-v2.html` | The rewritten hormones page. This is the one under review. |
| everything else | The rest of the mockup, mirrored as-is: 31 pages, 96 assets. |

## The hormones rewrite

Same content, restructured and rewritten. Measured in a browser at 1440px and 390px:

| | Original | Rewrite |
|---|---|---|
| Sections | 41 | 16 |
| Words | 4,411 | 2,355 |
| Images | 33 | 10 |
| Desktop height | 29,738 px (33 screens) | 13,387 px (14.9 screens) |
| Mobile height | 43,119 px (51 screens) | 21,807 px (25.8 screens) |

The length came from giving every small idea its own full-width section with its own
photo: six hormones, four delivery methods and ten patient goals took 26 of the 41
sections between them. Those are now card grids using `.hz-card`, `.deliv-card` and
`.goal-grid`, which already existed unused in `assets/css/site.css` under the comment
"Hormones hub: type cards + delivery + goals". No stylesheet changes were needed.

Also removed: a 32-item list restating the whole page, two lists naming the sections
that followed them, and two paragraphs printed twice word for word.

The copy was rewritten to drop outcome promises ("Beat Depression", "Stronger
Erections", "correct ED at the source") and fix errors carried on the live page,
including "a qualified, clinician", "increases it's own production" and "hormonal
imbalance could causing your anxiety".

A second-pass medical review flagged 12 further issues, all fixed. The substantive
ones: progesterone's role in hormone therapy was stated wrongly (it protects the
uterine lining), and the pills-versus-creams comparison was unsafe as written, since
oral and transdermal estrogen carry different risk profiles.

## Notes

- `robots.txt` disallows everything and `hormones-v2.html` carries a `noindex` tag.
  This is a client's site, and it should not compete with the real one at sdbody.com.
- Every page keeps its original `<link rel="canonical">` pointing at `sdbody.com`.
- Mirrored 2026-07-31.
