# Shared spec — the TLS handshake

Identical for both arms (control = teach-base only; treatment = teach-base +
visual-teach available). Pins the mission and a fixed 3-lesson plan. Each arm
authors freely _within_ this plan; wording may diverge, the topic series is
fixed. This spec must never mention the visual layer.

## Mission

A working developer relies on HTTPS every day but treats TLS as magic. They see
the padlock, occasionally hit a "certificate error," and have no model of what
the browser and server actually do to set up a secure connection. They can't
reason about why a self-signed cert warns, what a CA is for, or where to look
when a handshake fails. The goal: understand the modern (TLS 1.3) handshake well
enough to explain what each side proves, how they agree on a shared key without
ever sending it, and how certificate trust is established — enough to debug a
real TLS error without guessing.

Auto-generated mission; the learner can edit it.

## Fixed lesson plan (exactly 3 lessons, in order)

1. **What TLS protects, and who's involved** — the smallest true mental model.
   The three guarantees TLS provides (confidentiality, integrity,
   authentication) and the actors (client, server, certificate authority). What
   a certificate actually is: a public key bound to an identity (hostname),
   signed by a CA the client already trusts. Build the actors → guarantees
   intuition; no handshake mechanics or key math yet.

2. **The handshake, step by step** — the core skill. The TLS 1.3 message flow:
   ClientHello (offered versions/ciphers + a key share), ServerHello (chosen
   params + its key share) with the certificate, and Finished on both sides. The
   key idea: an ephemeral Diffie-Hellman exchange lets both sides derive the same
   session key from public values, so the secret is never transmitted. Centered
   on a recall/sequence feedback loop the learner works through (order the
   messages, name what each carries).

3. **Trust and failure** — applied practice toward the mission. The certificate
   chain (leaf → intermediate → root) and what the client checks: signature
   validates up to a trusted root, hostname matches, not expired, not revoked.
   Then the common failures and what each means (expired cert, self-signed,
   hostname mismatch, unknown/untrusted CA). Interleaves lessons 1–2 into a short
   applied checklist for diagnosing a TLS connection error.

## Constraints

- Comfortable with HTTP, clients/servers, and the request/response model; has
  used `curl` and browser devtools. No working model of TLS, certificates, or
  public-key crypto beyond "there are keys."
- Treat public-key crypto as a black box: a keypair where one key undoes the
  other. Do NOT teach RSA/ECC internals — only the properties TLS relies on.
- Target TLS 1.3 as the default; mention 1.2 only where it clarifies a contrast.
- One tangible win per lesson; keep each short.
