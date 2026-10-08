"""Distance and delivery-fee calculation.

Delivery fee is distance-based, not a flat number: a base fee covers the
restaurant's own handoff, plus a per-km rate for actual distance travelled,
so a 1km order and a 9km order are priced differently, same as a real
delivery platform.
"""
import math

EARTH_RADIUS_KM = 6371.0
BASE_FEE_CENTS = 299        # flat base, covers pickup regardless of distance
PER_KM_CENTS = 65           # additional cost per km of delivery distance
MAX_DELIVERY_KM = 15.0      # restaurants don't deliver beyond this radius


def haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Great-circle distance between two lat/lng points, in kilometers."""
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    d_phi = math.radians(lat2 - lat1)
    d_lambda = math.radians(lng2 - lng1)
    a = (math.sin(d_phi / 2) ** 2
         + math.cos(phi1) * math.cos(phi2) * math.sin(d_lambda / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return EARTH_RADIUS_KM * c


def delivery_fee_cents(distance_km: float) -> int:
    """Base fee plus per-km rate, rounded to the nearest cent."""
    return round(BASE_FEE_CENTS + PER_KM_CENTS * distance_km)


def is_within_delivery_range(distance_km: float) -> bool:
    return distance_km <= MAX_DELIVERY_KM
