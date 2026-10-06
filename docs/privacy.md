# Privacy

- **Synthetic only.** Harbour Pet Insurance is fictional. All rules and all 110 pilot claims are generated in `public/samples.js`. There are no names, addresses, policy numbers, pets, vets or payment details of real people.
- **No personal data is collected.** The app has no forms that send data anywhere, no analytics, no cookies, no third-party scripts and no network requests beyond its own static files (the font and logo are self-hosted).
- **Local storage only.** "Publish" stores the handling pack in this browser's `localStorage` under `lld.publications`. "Reset local state" deletes it. Uploaded CSVs are read in the browser and never transmitted.
- **Event log is in-memory.** Events shown in the UI aren't sent anywhere and disappear on reload.
- **No secrets.** The repo and site contain no keys, tokens or credentials. It's a static site on GitHub Pages.
- **If this became real:** claims data is personal data (and can include special-category health data, for example in pet-owner or human lines). A real version would need a DPIA, a lawful basis, data minimisation in the event payloads (IDs and counts, never claim narratives), and retention limits. Those are out of scope here.
