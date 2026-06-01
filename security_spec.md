# Firestore Security Specification and Dirty Dozen Payloads

This specification defines the complete relational invariants and data protection structures for Voltz Digital onboarding submissions.

## Data Invariants

1. **Submission Autonomy**: Prospective clients can create onboarding submissions without signing up for an account. However, all submissions must undergo strict schema and value constraint validation.
2. **Access Isolation**: Submissions are strictly write-only for clients/visitors, and read-write-delete only for authenticated administrative users defined in `/admins/{adminUid}`.
3. **Immutable Fields**: The document ID, submission ID, and `submittedAt` timestamp must be immutable once created.
4. **Temporal Integrity**: The `submittedAt` timestamp must equal the server's execution time request (`request.time`).
5. **Denial of Wallet Protection**: Maximum lengths are enforced on every string, and the database default denies any route not explicitly allowed.

---

## The "Dirty Dozen" Payloads

Here are the 12 malicious payloads designed to test our rules. Each has a specific vulnerability target that MUST be rejected with `PERMISSION_DENIED`.

### 1. ID Poisoning (Resource Abuse)
* **Attack Vector**: Injecting a 50KB alphanumeric string as `submissionId` to deplete database indexing and memory resources.
* **Expected Result**: `PERMISSION_DENIED`

### 2. Shadow Field Injection (Ghost Fields)
* **Attack Vector**: Creating a submission with an unmapped field `isApprovedByAdmin: true` or `flagged: false` to exploit downstream parsing layers.
* **Expected Result**: `PERMISSION_DENIED`

### 3. PII Leakage (Unprivileged Single Read)
* **Attack Vector**: A general client trying to read a specific `/onboarding/{submissionId}` document containing sensitive client PII (email, mobile, login code) without admin credentials.
* **Expected Result**: `PERMISSION_DENIED`

### 4. PII Scraping (Unprivileged Bulk List)
* **Attack Vector**: Attempting to list and query all documents in the `/onboarding` collection without credentials or admin authorization.
* **Expected Result**: `PERMISSION_DENIED`

### 5. Self-Promoted Admin (RBAC Privilege Escalation)
* **Attack Vector**: Writing a document containing `{ "isAdmin": true }` to `/admins/{attackerUid}` to gain administrator status.
* **Expected Result**: `PERMISSION_DENIED`

### 6. Value Poisoning (Invalid Data Type)
* **Attack Vector**: Submitting `personalEmail` as a Boolean `true` or an integer `1337` instead of a string to crash schema parsers.
* **Expected Result**: `PERMISSION_DENIED`

### 7. Overriding Temporal Records (Custom Timestamps)
* **Attack Vector**: Supplying a client-spoofed `submittedAt` date far into the future instead of using `request.time`.
* **Expected Result**: `PERMISSION_DENIED`

### 8. System State Hijacking / Short-Circuiting
* **Attack Vector**: A client attempting to update status from `new` to `completed` on an existing submission, bypasses admin review.
* **Expected Result**: `PERMISSION_DENIED`

### 9. Unauthorized Record Erasure (Malicious Deletion)
* **Attack Vector**: A random client attempting to delete an onboarding submission document.
* **Expected Result**: `PERMISSION_DENIED`

### 10. Missing Core Schema Properties
* **Attack Vector**: Submitting a document missing the mandatory `businessName` or `personalEmail` properties.
* **Expected Result**: `PERMISSION_DENIED`

### 11. String Overflow Attack (Denial of Wallet)
* **Attack Vector**: Submitting an email, desc, or notes field containing a 5MB string block.
* **Expected Result**: `PERMISSION_DENIED`

### 12. Invalid Enum Poisoning
* **Attack Vector**: Specifying `status: "super_active"` (which is not in the allowed enums: `new`, `reviewed`, `in_progress`, `completed`).
* **Expected Result**: `PERMISSION_DENIED`
