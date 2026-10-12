"""Order status transitions, enforced by role.

Each role can only push an order through the steps that are actually
theirs to do. A customer can't mark their own order 'delivered', a rider
can't 'confirm' an order they haven't picked up yet. This is what makes
the three role-views genuinely different systems, not the same screen
with a label swapped.

Two customer-initiated transitions exist alongside the restaurant/rider
pipeline: 'placed' -> 'cancelled' (a short self-serve cancel window right
after ordering, time-gated by the caller in app.py, not here) and
'delivered' -> 'completed' (the customer confirming they actually
received the food, which is what closes the order for good rather than
just taking the rider's word for it).
"""

# status -> set of statuses it may legally move to next
VALID_TRANSITIONS = {
    "placed": {"confirmed", "cancelled"},
    "confirmed": {"preparing", "cancelled"},
    "preparing": {"out_for_delivery", "cancelled"},
    "out_for_delivery": {"delivered"},
    "delivered": {"completed"},
    "completed": set(),
    "cancelled": set(),
}

# which role(s) may perform each transition. A single role string, or a
# set when more than one role can legally trigger the same transition
# (e.g. either the restaurant or the customer can cancel a fresh order,
# just under different conditions).
#
# Note: preparing -> out_for_delivery is a RIDER action (picking up the
# order), and requires the order to already have a rider assigned via
# the separate claim step. A restaurant can prep food, but only the rider
# who claimed it can mark it picked up.
TRANSITION_OWNER = {
    ("placed", "confirmed"): "restaurant_owner",
    ("placed", "cancelled"): {"restaurant_owner", "customer"},
    ("confirmed", "preparing"): "restaurant_owner",
    ("confirmed", "cancelled"): "restaurant_owner",
    ("preparing", "out_for_delivery"): "rider",
    ("preparing", "cancelled"): "restaurant_owner",
    ("out_for_delivery", "delivered"): "rider",
    ("delivered", "completed"): "customer",
}


class InvalidTransition(Exception):
    pass


class NotAuthorizedForTransition(Exception):
    pass


def check_transition(current: str, target: str, actor_role: str) -> None:
    if target not in VALID_TRANSITIONS.get(current, set()):
        raise InvalidTransition(f"Cannot move an order from '{current}' to '{target}'.")
    required = TRANSITION_OWNER.get((current, target))
    if required is not None:
        allowed_roles = {required} if isinstance(required, str) else required
        if actor_role not in allowed_roles:
            names = " or ".join(r.replace("_", " ") for r in sorted(allowed_roles))
            raise NotAuthorizedForTransition(
                f"Only a {names} can move an order from '{current}' to '{target}'."
            )
