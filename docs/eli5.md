# Line Launch Desk, explained simply

A claims company handles insurance claims for other companies. Each of those companies (the "client") sends a rulebook for every new type of insurance it sells, for example pet insurance. The rulebook says things like "pay the vet within 48 hours" and "a handler can approve up to £5,000 on their own".

Imagine a pilot's pre-flight checklist. Before the plane takes off, every box must be ticked. If one box is empty, the plane stays on the ground, no matter how keen everyone is to go.

Line Launch Desk is that checklist for a new insurance line:

1. **Read the rulebook.** It reads the client's spreadsheet line by line and throws out lines that are broken: missing information, a stage that doesn't exist, or two different rules using the same ID.
2. **Compare it with our own checklist.** The claims company has one checklist with eight steps that every line must cover, from "a claim comes in" to "we report to the client". The desk checks that each step has a rule that is signed off, in date, and within our limits.
3. **Say HOLD or READY.** If anything is missing, the answer is HOLD, with a list of exactly what to fix. Nothing goes half-live.
4. **Sign and publish.** When it is READY, two people sign this exact version: the claims company's ops lead and the client's programme owner. Change one word and both signatures stop counting. Pressing publish twice doesn't publish twice.
5. **Check the pilot honestly.** After launch, it looks at how fast claims are closed. If the average got better only because more easy claims came in, it says NO DECISION instead of celebrating.
6. **Turn problems into ideas to test.** Anything it found (a handler skipping a step, an out-of-date document) becomes an item on a list of things for the product team to investigate. They are questions, not conclusions.

Everything in this demo is made up: the client, the rules and the claims. It doesn't connect to ClaimSorted or any real system.
