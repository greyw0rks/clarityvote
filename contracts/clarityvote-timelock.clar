;; clarityvote-timelock
;; Execution delay enforcer for passed governance proposals
;; After a vote passes, execution is queued and can only be triggered
;; after a mandatory delay (in burn blocks) has elapsed

;; ============================================================
;; Constants
;; ============================================================

(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-QUEUED (err u101))
(define-constant ERR-NOT-QUEUED (err u102))
(define-constant ERR-DELAY-NOT-MET (err u103))
(define-constant ERR-ALREADY-EXECUTED (err u104))
(define-constant ERR-EXPIRED (err u105))
(define-constant ERR-INVALID-DELAY (err u106))
(define-constant ERR-CANCELLED (err u107))

;; Default delay: ~144 burn blocks (~1 Bitcoin day)
(define-constant DEFAULT-DELAY u144)
;; Max delay: ~1008 burn blocks (~7 Bitcoin days)
(define-constant MAX-DELAY u1008)
;; Grace period after eta before proposal expires: ~288 blocks (~2 days)
(define-constant GRACE-PERIOD u288)

;; ============================================================
;; Data Vars
;; ============================================================

(define-data-var timelock-delay uint DEFAULT-DELAY)
(define-data-var admin principal CONTRACT-OWNER)
(define-data-var queued-count uint u0)
(define-data-var executed-count uint u0)

;; ============================================================
;; Data Maps
;; ============================================================

;; proposal-id -> queue entry
(define-map queued-proposals
  uint
  {
    proposer: principal,
    description: (string-utf8 256),
    eta: uint,           ;; earliest burn block for execution
    queued-at: uint,     ;; burn block when queued
    executed: bool,
    cancelled: bool
  }
)

;; ============================================================
;; Read-Only Functions
;; ============================================================

(define-read-only (get-delay)
  (var-get timelock-delay)
)

(define-read-only (get-proposal (proposal-id uint))
  (map-get? queued-proposals proposal-id)
)

(define-read-only (get-admin)
  (var-get admin)
)

(define-read-only (get-queued-count)
  (var-get queued-count)
)

(define-read-only (get-executed-count)
  (var-get executed-count)
)

(define-read-only (is-queued (proposal-id uint))
  (match (map-get? queued-proposals proposal-id)
    entry (and (not (get executed entry)) (not (get cancelled entry)))
    false
  )
)

(define-read-only (is-ready (proposal-id uint))
  (match (map-get? queued-proposals proposal-id)
    entry
      (and
        (not (get executed entry))
        (not (get cancelled entry))
        (>= burn-block-height (get eta entry))
        (< burn-block-height (+ (get eta entry) GRACE-PERIOD))
      )
    false
  )
)

(define-read-only (is-expired (proposal-id uint))
  (match (map-get? queued-proposals proposal-id)
    entry (>= burn-block-height (+ (get eta entry) GRACE-PERIOD))
    false
  )
)

(define-read-only (blocks-until-eta (proposal-id uint))
  (match (map-get? queued-proposals proposal-id)
    entry
      (let ((eta (get eta entry)))
        (if (>= burn-block-height eta)
          u0
          (- eta burn-block-height)
        )
      )
    u0
  )
)

;; ============================================================
;; Public Functions
;; ============================================================

;; Queue a passed proposal for execution after delay
(define-public (queue-proposal
  (proposal-id uint)
  (description (string-utf8 256))
)
  (let (
    (current-burn burn-block-height)
    (delay (var-get timelock-delay))
    (eta (+ current-burn delay))
  )
    ;; Only admin (governance contract) can queue
    (asserts! (is-eq tx-sender (var-get admin)) ERR-NOT-AUTHORIZED)
    ;; Must not already be queued
    (asserts! (not (is-queued proposal-id)) ERR-ALREADY-QUEUED)

    (map-set queued-proposals proposal-id {
      proposer: tx-sender,
      description: description,
      eta: eta,
      queued-at: current-burn,
      executed: false,
      cancelled: false
    })

    (var-set queued-count (+ (var-get queued-count) u1))

    (ok eta)
  )
)

;; Execute a queued proposal after delay has elapsed
(define-public (execute-proposal (proposal-id uint))
  (let (
    (entry (unwrap! (map-get? queued-proposals proposal-id) ERR-NOT-QUEUED))
  )
    (asserts! (is-eq tx-sender (var-get admin)) ERR-NOT-AUTHORIZED)
    (asserts! (not (get executed entry)) ERR-ALREADY-EXECUTED)
    (asserts! (not (get cancelled entry)) ERR-CANCELLED)
    ;; Delay must have passed
    (asserts! (>= burn-block-height (get eta entry)) ERR-DELAY-NOT-MET)
    ;; Must not be expired
    (asserts! (< burn-block-height (+ (get eta entry) GRACE-PERIOD)) ERR-EXPIRED)

    ;; Mark as executed
    (map-set queued-proposals proposal-id
      (merge entry { executed: true })
    )

    (var-set executed-count (+ (var-get executed-count) u1))

    (ok true)
  )
)

;; Cancel a queued proposal (admin only, before execution)
(define-public (cancel-proposal (proposal-id uint))
  (let (
    (entry (unwrap! (map-get? queued-proposals proposal-id) ERR-NOT-QUEUED))
  )
    (asserts! (is-eq tx-sender (var-get admin)) ERR-NOT-AUTHORIZED)
    (asserts! (not (get executed entry)) ERR-ALREADY-EXECUTED)
    (asserts! (not (get cancelled entry)) ERR-CANCELLED)

    (map-set queued-proposals proposal-id
      (merge entry { cancelled: true })
    )

    (ok true)
  )
)

;; Update timelock delay (admin only)
(define-public (set-delay (new-delay uint))
  (begin
    (asserts! (is-eq tx-sender (var-get admin)) ERR-NOT-AUTHORIZED)
    (asserts! (and (>= new-delay u1) (<= new-delay MAX-DELAY)) ERR-INVALID-DELAY)
    (var-set timelock-delay new-delay)
    (ok new-delay)
  )
)

;; Transfer admin role (admin only)
(define-public (set-admin (new-admin principal))
  (begin
    (asserts! (is-eq tx-sender (var-get admin)) ERR-NOT-AUTHORIZED)
    (var-set admin new-admin)
    (ok true)
  )
)
