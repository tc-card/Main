No matter your profession—whether you're a freelancer, entrepreneur, doctor, lawyer, business owner, or company leader—Total Connect is the modern, efficient way to share your professional identity, make lasting connections, and elevate your digital presence. Invest in tc cards by Total Connect .
✨

![150](https://github.com/user-attachments/assets/2e256309-e497-4eeb-9890-aa81eb9d2f37)🎉

Get started today, and stay ahead of the curve!🌐

## Basic plan signup entry point

The Basic plan's signup flow is in `plans/basic/`. Its `code.gs` is the Google Apps Script entry point for new card submissions. The page and client scripts collect signup details, while `code.gs` checks duplicate email/profile links and referral codes, writes accepted submissions to the `Form` sheet, and sends a confirmation email. New rows start with `Status` set to `Inactive`.

That `Form` sheet is the shared profile data store used by the separate Edit-Profile project for authenticated updates and by TC-Basic for public card lookups. `code.gs` belongs to this Total Connect project and should remain here; it is not part of either downstream project.

```text
plans/basic/index.html + main.js
              ↓
plans/basic/code.gs → Form sheet ← Edit-Profile
                              ↓
                    TC-Basic public cards
```

Other Basic plan files:

- `plans/basic/index.html` — signup page
- `plans/basic/main.js` — form behavior and requests to Apps Script
- `plans/basic/config.js` — client-side configuration, including the Apps Script endpoint
- `plans/basic/code.gs` — signup API and sheet/email operations
