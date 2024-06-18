from enum import Enum

class PaymentStatus(Enum):
    NOT_PAID = 1
    PARTIAL_PAID = 2
    FULL_PAID = 3

