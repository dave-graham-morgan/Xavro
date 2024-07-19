from enum import Enum
from backend import config_globals


class PaymentStatus(Enum):
    NOT_PAID = 1
    PARTIAL_PAID = 2
    FULL_PAID = 3


class BookingStatus(Enum):
    NOT_BOOKED = 1
    RESCHEDULED = 2
    CANCELLED = 3


class Roles(Enum):
    ADMIN = 1
    EMPLOYEE = 0
    GUEST = 3


def get_allowed_origins():
    return config_globals.ALLOWED_ORIGINS
