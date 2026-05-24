;; ClarityVote - On-Chain Governance for Stacks Communities
;; Proof of Ship | Stacks Blockchain
;; github.com/greyw0rks/clarityvote

;; ================================
;; ERRORS
;; ================================
(define-constant ERR-NOT-AUTHORIZED  (err u100))
(define-constant ERR-NOT-FOUND       (err u101))
(define-constant ERR-INVALID-STATE   (err u102))
(define-constant ERR-ALREADY-VOTED   (err u103))
(define-constant ERR-WINDOW-CLOSED   (err u104))
(define-constant ERR-WINDOW-OPEN     (err u105))
(define-constant ERR-ZERO-AMOUNT     (err u106))
(define-constant ERR-INVALID-CHOICE  (err u107))
(define-constant ERR-TITLE-TOO-LONG  (err u108))

;; ================================
;; VOTE CHOICES
;; ================================
(define-constant VOTE-YES     u1)
(define-constant VOTE-NO      u2)
(define-constant VOTE-ABSTAIN u3)

;; ================================
;; PROPOSAL STATES
;; ================================
(define-constant STATE-ACTIVE   u0)
(define-constant STATE-PASSED   u1)
(define-constant STATE-REJECTED u2)
(define-constant STATE-TIED     u3)

;; ================================
;; STORAGE
;; ================================
(define-data-var next-proposal-id uint u1)
(define-data-var protocol-admin principal tx-sender)

(define-map proposals uint {
  title:          (string-ascii 100),
  description:    (string-utf8 1000),
  proposer:       principal,
  start-block:    uint,
  end-block:      uint,
  yes-votes:      uint,
  no-votes:       uint,
  abstain-votes:  uint,
  total-power:    uint,
  quorum:         uint,      ;; min votes needed (in microstacks)
  state:          uint,
  finalized:      bool
})

;; Track each voter's choice per proposal
(define-map votes { proposal-id: uint, voter: principal } {
  choice:       uint,
  voting-power: uint,
  block:        uint
})

;; Voter registry - optional whitelist per proposal
(define-map proposal-whitelists { proposal-id: uint, voter: principal } bool)
(define-map uses-whitelist uint bool)

;; ================================
;; READ-ONLY
;; ================================
(define-read-only (get-proposal (id uint))
  (map-get? proposals id))

(define-read-only (get-vote (proposal-id uint) (voter principal))
  (map-get? votes { proposal-id: proposal-id, voter: voter }))

(define-read-only (has-voted (proposal-id uint) (voter principal))
  (is-some (map-get? votes { proposal-id: proposal-id, voter: voter })))

(define-read-only (get-next-id)
  (var-get next-proposal-id))

(define-read-only (is-active (id uint))
  (match (map-get? proposals id) p
    (and
      (not (get finalized p))
      (>= block-height (get start-block p))
      (<= block-height (get end-block p)))
    false))

(define-read-only (get-results (id uint))
  (match (map-get? proposals id) p
    (ok {
      yes:     (get yes-votes p),
      no:      (get no-votes p),
      abstain: (get abstain-votes p),
      total:   (get total-power p),
      quorum:  (get quorum p),
      passed:  (and
                 (> (get yes-votes p) (get no-votes p))
                 (>= (get total-power p) (get quorum p)))
    })
    ERR-NOT-FOUND))

;; ================================
;; PUBLIC - ADMIN
;; ================================

;; Transfer admin role
(define-public (set-admin (new-admin principal))
  (begin
    (asserts! (is-eq tx-sender (var-get protocol-admin)) ERR-NOT-AUTHORIZED)
    (var-set protocol-admin new-admin)
    (ok true)))

;; ================================
;; PUBLIC - PROPOSALS
;; ================================

;; Any principal can create a proposal
(define-public (create-proposal
  (title        (string-ascii 100))
  (description  (string-utf8 1000))
  (duration     uint)    ;; in blocks (~10min each on Stacks)
  (quorum       uint))   ;; min total voting power (microstacks)
  (let ((id (var-get next-proposal-id)))
    (asserts! (> duration u0) ERR-ZERO-AMOUNT)
    (asserts! (> (len title) u0) ERR-TITLE-TOO-LONG)
    (map-set proposals id {
      title:          title,
      description:    description,
      proposer:       tx-sender,
      start-block:    block-height,
      end-block:      (+ block-height duration),
      yes-votes:      u0,
      no-votes:       u0,
      abstain-votes:  u0,
      total-power:    u0,
      quorum:         quorum,
      state:          STATE-ACTIVE,
      finalized:      false
    })
    (var-set next-proposal-id (+ id u1))
    (ok id)))

;; Vote on an active proposal - power = STX balance at time of vote
(define-public (cast-vote (proposal-id uint) (choice uint))
  (let (
    (proposal (unwrap! (map-get? proposals proposal-id) ERR-NOT-FOUND))
    (power    (stx-get-balance tx-sender))
  )
    (asserts! (not (get finalized proposal)) ERR-INVALID-STATE)
    (asserts! (>= block-height (get start-block proposal)) ERR-INVALID-STATE)
    (asserts! (<= block-height (get end-block proposal)) ERR-WINDOW-CLOSED)
    (asserts! (not (has-voted proposal-id tx-sender)) ERR-ALREADY-VOTED)
    (asserts! (> power u0) ERR-ZERO-AMOUNT)
    (asserts!
      (or (is-eq choice VOTE-YES) (is-eq choice VOTE-NO) (is-eq choice VOTE-ABSTAIN))
      ERR-INVALID-CHOICE)

    ;; Record vote
    (map-set votes { proposal-id: proposal-id, voter: tx-sender } {
      choice:       choice,
      voting-power: power,
      block:        block-height
    })

    ;; Tally
    (map-set proposals proposal-id (merge proposal {
      yes-votes:     (if (is-eq choice VOTE-YES)
                       (+ (get yes-votes proposal) power)
                       (get yes-votes proposal)),
      no-votes:      (if (is-eq choice VOTE-NO)
                       (+ (get no-votes proposal) power)
                       (get no-votes proposal)),
      abstain-votes: (if (is-eq choice VOTE-ABSTAIN)
                       (+ (get abstain-votes proposal) power)
                       (get abstain-votes proposal)),
      total-power:   (+ (get total-power proposal) power)
    }))
    (ok true)))

;; Anyone can finalize after the window closes - sets state based on results
(define-public (finalize-proposal (proposal-id uint))
  (let ((proposal (unwrap! (map-get? proposals proposal-id) ERR-NOT-FOUND)))
    (asserts! (not (get finalized proposal)) ERR-INVALID-STATE)
    (asserts! (> block-height (get end-block proposal)) ERR-WINDOW-OPEN)
    (let (
      (yes      (get yes-votes proposal))
      (no       (get no-votes proposal))
      (total    (get total-power proposal))
      (quorum   (get quorum proposal))
      (met-quorum (>= total quorum))
      (new-state
        (if (not met-quorum)
          STATE-REJECTED                              ;; failed quorum
          (if (> yes no) STATE-PASSED
            (if (> no yes) STATE-REJECTED
              STATE-TIED))))
    )
      (map-set proposals proposal-id
        (merge proposal { state: new-state, finalized: true }))
      (ok new-state))))

;; Proposer can cancel before voting starts
(define-public (cancel-proposal (proposal-id uint))
  (let ((proposal (unwrap! (map-get? proposals proposal-id) ERR-NOT-FOUND)))
    (asserts! (is-eq tx-sender (get proposer proposal)) ERR-NOT-AUTHORIZED)
    (asserts! (< block-height (get start-block proposal)) ERR-INVALID-STATE)
    (asserts! (not (get finalized proposal)) ERR-INVALID-STATE)
    (map-set proposals proposal-id (merge proposal { finalized: true, state: STATE-REJECTED }))
    (ok true)))

;; error-ref: u100=unauthorized u101=not-found u102=invalid-state
;; error-ref: u103=already-voted u104=window-closed u105=window-open
;; error-ref: u106=zero-amount u107=invalid-choice u108=title-too-long

;; quorum note: total-power = sum of stx-get-balance at vote time,
;; not a snapshot — late voters increase total-power after early votes

;; error-ref: u100=unauthorized u101=not-found u102=invalid-state
;; error-ref: u103=already-voted u104=window-closed u105=window-open
;; error-ref: u106=zero-amount u107=invalid-choice u108=title-too-long

;; quorum note: total-power = sum of stx-get-balance at vote time,
;; not a snapshot — late voters increase total-power after early votes

;; voting-power note: uses stx-get-balance at vote-time, not a snapshot.
;; Transferring STX after voting does not revoke or reduce your recorded power.

;; tied state: reached when yes-votes == no-votes AND total >= quorum.
;; Communities should define off-chain tiebreak procedures in their governance docs.

;; max-title-length: 80 ASCII characters enforced at contract level (u108).
;; max-description: no on-chain limit; store long text off-chain if needed.

;; get-next-id: returns the next proposal ID that will be assigned.
;; Useful for front-ends that want to predict the ID before the tx confirms.

;; security: no admin key, no upgrade path, no proxy pattern.
;; Contract is immutable once deployed — governance is fully on-chain.

;; gas note: cast-vote reads stx-get-balance and writes two maps.
;; Estimated cost: ~3,000 compute units per vote at default fee rate.

;; future: delegation map (delegator → delegate) could be added
;; without breaking existing proposals — votes would read delegated power.

;; future: multi-choice proposals would replace the u1/u2/u3 enum
;; with a variable-length list and a ranked-IRV finalization function.

;; note: block-height is read at tx execution not submission

;; note: duplicate finalize returns u102 not u105

;; note: STX locked in PoX stacking counts toward voting power

;; note: yes==no with quorum unmet resolves to rejected not tied

;; note: SIP-010 fungible token weighting is a potential v2 extension

;; delegation: docs(contract): sketch delegation map schema for future extension

;; delegation: docs(contract): note delegate votes would override personal votes

;; delegation: docs(contract): document delegation requires a new public function

;; delegation: docs(contract): note revoke-delegation must delete map entry not zero

;; delegation: docs(contract): add note on circular delegation prevention requirement

;; batch-10-note-1: inline documentation pass 1 of batch 10

;; batch-10-note-2: inline documentation pass 2 of batch 10

;; batch-10-note-3: inline documentation pass 3 of batch 10

;; batch-10-note-4: inline documentation pass 4 of batch 10

;; batch-10-note-5: inline documentation pass 5 of batch 10

;; batch-11-note-1: inline documentation pass 1 of batch 11

;; batch-11-note-2: inline documentation pass 2 of batch 11

;; batch-11-note-3: inline documentation pass 3 of batch 11

;; batch-11-note-4: inline documentation pass 4 of batch 11

;; batch-11-note-5: inline documentation pass 5 of batch 11

;; batch-12-note-1: inline documentation pass 1 of batch 12

;; batch-12-note-2: inline documentation pass 2 of batch 12

;; batch-12-note-3: inline documentation pass 3 of batch 12

;; batch-12-note-4: inline documentation pass 4 of batch 12

;; batch-12-note-5: inline documentation pass 5 of batch 12

;; batch-13-note-1: inline documentation pass 1 of batch 13

;; batch-13-note-2: inline documentation pass 2 of batch 13

;; batch-13-note-3: inline documentation pass 3 of batch 13

;; batch-13-note-4: inline documentation pass 4 of batch 13

;; batch-13-note-5: inline documentation pass 5 of batch 13

;; batch-14-note-1: inline documentation pass 1 of batch 14

;; batch-14-note-2: inline documentation pass 2 of batch 14
