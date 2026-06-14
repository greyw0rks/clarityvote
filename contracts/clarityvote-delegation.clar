;; clarityvote-delegation
;; Allows STX holders to delegate their voting power to another principal
;; Delegatee accumulates voting weight from all delegators
;; Compatible with ClarityVote STX-balance-weighted governance

;; ============================================================
;; Constants
;; ============================================================

(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-SELF-DELEGATE (err u101))
(define-constant ERR-ALREADY-DELEGATED (err u102))
(define-constant ERR-NO-DELEGATION (err u103))
(define-constant ERR-CIRCULAR-DELEGATION (err u104))
(define-constant ERR-ZERO-BALANCE (err u105))

;; ============================================================
;; Data Maps
;; ============================================================

;; Maps delegator -> delegatee
(define-map delegations
  principal
  principal
)

;; Maps delegatee -> total delegated weight (in uSTX)
(define-map delegated-weight
  principal
  uint
)

;; Maps delegatee -> list of delegators (for enumeration, capped at 50)
(define-map delegator-count
  principal
  uint
)

;; Total delegations ever created (for stats)
(define-data-var total-delegations uint u0)

;; ============================================================
;; Read-Only Functions
;; ============================================================

(define-read-only (get-delegation (delegator principal))
  (map-get? delegations delegator)
)

(define-read-only (get-delegated-weight (delegatee principal))
  (default-to u0 (map-get? delegated-weight delegatee))
)

(define-read-only (get-delegator-count (delegatee principal))
  (default-to u0 (map-get? delegator-count delegatee))
)

(define-read-only (get-total-delegations)
  (var-get total-delegations)
)

;; Returns effective voting weight: own balance + delegated weight
(define-read-only (get-effective-weight (voter principal))
  (let (
    (own-balance (stx-get-balance voter))
    (extra-weight (get-delegated-weight voter))
  )
    (+ own-balance extra-weight)
  )
)

;; Check if a principal has delegated their vote
(define-read-only (has-delegated (delegator principal))
  (is-some (map-get? delegations delegator))
)

;; Check if delegating would create a circular chain
(define-read-only (is-circular (delegator principal) (delegatee principal))
  ;; Simple one-hop check: if delegatee has already delegated to delegator
  (match (map-get? delegations delegatee)
    existing-delegatee (is-eq existing-delegatee delegator)
    false
  )
)

;; ============================================================
;; Public Functions
;; ============================================================

;; Delegate voting power to another principal
(define-public (delegate (delegatee principal))
  (let (
    (delegator tx-sender)
    (delegator-balance (stx-get-balance tx-sender))
  )
    ;; Cannot delegate to self
    (asserts! (not (is-eq delegator delegatee)) ERR-SELF-DELEGATE)
    ;; Must have STX balance to delegate
    (asserts! (> delegator-balance u0) ERR-ZERO-BALANCE)
    ;; Cannot already have an active delegation
    (asserts! (not (has-delegated delegator)) ERR-ALREADY-DELEGATED)
    ;; No circular delegation
    (asserts! (not (is-circular delegator delegatee)) ERR-CIRCULAR-DELEGATION)

    ;; Record delegation
    (map-set delegations delegator delegatee)

    ;; Add delegator's balance to delegatee's weight
    (map-set delegated-weight
      delegatee
      (+ (get-delegated-weight delegatee) delegator-balance)
    )

    ;; Increment delegator count for delegatee
    (map-set delegator-count
      delegatee
      (+ (get-delegator-count delegatee) u1)
    )

    ;; Increment global counter
    (var-set total-delegations (+ (var-get total-delegations) u1))

    (ok true)
  )
)

;; Revoke an existing delegation
(define-public (revoke-delegation)
  (let (
    (delegator tx-sender)
    (delegator-balance (stx-get-balance tx-sender))
  )
    ;; Must have an active delegation
    (asserts! (has-delegated delegator) ERR-NO-DELEGATION)

    (let (
      (delegatee (unwrap! (map-get? delegations delegator) ERR-NO-DELEGATION))
      (current-weight (get-delegated-weight delegatee))
      (current-count (get-delegator-count delegatee))
    )
      ;; Remove delegation record
      (map-delete delegations delegator)

      ;; Subtract delegator's balance from delegatee weight
      ;; Guard against underflow
      (map-set delegated-weight
        delegatee
        (if (>= current-weight delegator-balance)
          (- current-weight delegator-balance)
          u0
        )
      )

      ;; Decrement delegator count
      (map-set delegator-count
        delegatee
        (if (> current-count u0)
          (- current-count u1)
          u0
        )
      )

      (ok true)
    )
  )
)

;; Transfer delegation to a new delegatee (atomic revoke + re-delegate)
(define-public (transfer-delegation (new-delegatee principal))
  (let (
    (delegator tx-sender)
    (delegator-balance (stx-get-balance tx-sender))
  )
    (asserts! (not (is-eq delegator new-delegatee)) ERR-SELF-DELEGATE)
    (asserts! (has-delegated delegator) ERR-NO-DELEGATION)
    (asserts! (not (is-circular delegator new-delegatee)) ERR-CIRCULAR-DELEGATION)

    (let (
      (old-delegatee (unwrap! (map-get? delegations delegator) ERR-NO-DELEGATION))
      (old-weight (get-delegated-weight old-delegatee))
      (old-count (get-delegator-count old-delegatee))
    )
      ;; Remove weight from old delegatee
      (map-set delegated-weight
        old-delegatee
        (if (>= old-weight delegator-balance)
          (- old-weight delegator-balance)
          u0
        )
      )
      (map-set delegator-count
        old-delegatee
        (if (> old-count u0) (- old-count u1) u0)
      )

      ;; Set new delegation
      (map-set delegations delegator new-delegatee)

      ;; Add weight to new delegatee
      (map-set delegated-weight
        new-delegatee
        (+ (get-delegated-weight new-delegatee) delegator-balance)
      )
      (map-set delegator-count
        new-delegatee
        (+ (get-delegator-count new-delegatee) u1)
      )

      (ok true)
    )
  )
)
