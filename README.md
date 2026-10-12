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
7 end-to-end tests covering the full order lifecycle, role-based permission
enforcement at every transition, duplicate-claim prevention, and delivery-range
rejection.

## Demo accounts
Password for all: `demo1234`
- `rosa@freshroute.demo` — restaurant owner
- `remy@freshroute.demo` — rider
- `casey@freshroute.demo` — customer
