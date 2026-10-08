"""Password hashing and bearer-token session auth.

Passwords: PBKDF2-HMAC-SHA256 with a random 16-byte salt per user
(stdlib hashlib, no plaintext or reversible storage anywhere).
Sessions: opaque random tokens held server-side in a dict, same tradeoff
every small deployed app makes before reaching for Redis.
"""
import hashlib
import hmac
import os
import secrets

ITERATIONS = 200_000

# token -> user_id. In-memory is fine for a single-process demo deployment;
# a real production system would move this to Redis or signed JWTs.
_SESSIONS: dict[str, int] = {}


def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), bytes.fromhex(salt), ITERATIONS)
    return f"{salt}${digest.hex()}"


def verify_password(password: str, stored: str) -> bool:
    salt, _, digest_hex = stored.partition("$")
    if not salt or not digest_hex:
        return False
    check = hashlib.pbkdf2_hmac("sha256", password.encode(), bytes.fromhex(salt), ITERATIONS)
    return hmac.compare_digest(check.hex(), digest_hex)


def create_session(user_id: int) -> str:
    token = secrets.token_urlsafe(32)
    _SESSIONS[token] = user_id
    return token


def resolve_session(token: str) -> int | None:
    return _SESSIONS.get(token)


def revoke_session(token: str) -> None:
    _SESSIONS.pop(token, None)
