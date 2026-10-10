"""Order status transitions, enforced by role.

Each role can only push an order through the steps that are actually
theirs to do. A customer can't mark their own order 'delivered', a rider
can't 'confirm' an order they haven't picked up yet. This is what makes
the three role-views genuinely different systems, not the same screen
with a label swapped.
"""

# status -> set of statuses it may legally move to next
VALID_TRANSITIONS = {
    "placed": {"confirmed", "cancelled"},
    "confirmed": {"preparing", "cancelled"},
    "preparing": {"out_for_delivery", "cancelled"},
    "out_for_delivery": {"delivered"},
    "delivered": set(),
    "cancelled": set(),
}

# which role is allowed to perform each transition.
# Note: preparing -> out_for_delivery is a RIDER action (picking up the
# order), and requires the order to already have a rider assigned via
# the separate claim step. A restaurant can prep food, but only the rider
# who claimed it can mark it picked up.
TRANSITION_OWNER = {
    ("placed", "confirmed"): "restaurant_owner",
    ("placed", "cancelled"): "restaurant_owner",
    ("confirmed", "preparing"): "restaurant_owner",
    ("confirmed", "cancelled"): "restaurant_owner",
    ("preparing", "out_for_delivery"): "rider",
    ("preparing", "cancelled"): "restaurant_owner",
    ("out_for_delivery", "delivered"): "rider",
}


class InvalidTransition(Exception):
    pass


class NotAuthorizedForTransition(Exception):
    pass


def check_transition(current: str, target: str, actor_role: str) -> None:
    if target not in VALID_TRANSITIONS.get(current, set()):
        raise InvalidTransition(f"Cannot move an order from '{current}' to '{target}'.")
    required_role = TRANSITION_OWNER.get((current, target))
    if required_role is not None and actor_role != required_role:
        raise NotAuthorizedForTransition(
            f"Only a {required_role.replace('_', ' ')} can move an order from '{current}' to '{target}'."
        )
