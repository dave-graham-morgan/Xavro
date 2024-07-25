from enum import Enum


class PaymentStatus(Enum):
    NOT_PAID = 1
    PARTIAL_PAID = 2
    FULL_PAID = 3


class Roles(Enum):
    ADMIN = 1
    EMPLOYEE = 0
    GUEST = 3


def time_to_string(t):
    return t.strftime("%H:%M:%S") if t else None
