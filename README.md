# FreshRoute

A role-based food delivery platform: customers order, restaurant owners
manage their menu and fulfill orders, riders claim and deliver them. Built
to demonstrate real backend engineering, not just a CRUD wrapper: a
role-aware state machine, distance-based pricing, and a full audit trail.

## Stack
- **Backend:** Python, FastAPI, SQLite, pytest
- **Frontend:** React, Vite, React Router
- **Auth:** PBKDF2-HMAC-SHA256 salted password hashing, bearer-token sessions
- **Deployment:** single Render web service; FastAPI serves the built React app directly

## Why three roles, not one
Customer, restaurant owner, and rider are genuinely different systems
sharing one backend, not the same screen with a label swapped. Each role
has its own permitted actions, enforced server-side by a state machine
(`backend/state_machine.py`): a customer can't mark an order delivered, a
restaurant can't pick up its own delivery, a rider can't claim an order
that isn't ready yet.

## Real logic, not placeholders
- **Distance-based delivery pricing**: a Haversine great-circle calculation
  between restaurant and delivery address feeds a base-fee-plus-per-km
  formula, not a flat number.
- **Atomic rider claiming**: claiming an order is a single conditional
  database write (`WHERE rider_id IS NULL`), not a check-then-write, so two
  riders tapping "Claim" on the same order at the same moment can't both
  succeed.
- **Self-serve cancellation window**: a customer can cancel an order
  without contacting the restaurant for 10 seconds after placing it,
  enforced by the backend's own clock, not just a disabled button on
  the frontend.
- **Two-sided delivery confirmation**: an order isn't closed when the rider
  marks it delivered; it waits in a `completed`-pending state until the
  customer confirms receipt.
- **Full order audit trail**: every status change is timestamped and
  recorded, so a customer's tracking view shows exactly when each step
  happened, not just the current state.
- **Restaurant analytics**: top-selling items and daily order volume,
  computed from real aggregation queries against the order history.

## Running locally
```
pip install -r requirements.txt
python3 -m backend.seed   # seeds demo restaurants, riders, and a customer
uvicorn backend.app:app --reload

cd frontend
npm install
npm run dev
```

## Tests
```
pytest tests/ -v
```
11 end-to-end tests covering the full order lifecycle, role-based permission
enforcement at every transition, duplicate-claim prevention, delivery-range
rejection, the customer self-cancel grace window and its edge cases, and
delivery confirmation.

## Demo accounts
Password for all: `demo1234`. Twelve restaurants, one owner account each,
plus two riders and a customer. Every account is also reachable with a
single click from the demo-accounts disclosure on the login page.
- `rosa@freshroute.demo`: restaurant owner, Rosa's Trattoria
- `remy@freshroute.demo`: rider
- `casey@freshroute.demo`: customer
