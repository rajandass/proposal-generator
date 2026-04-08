from pydantic import BaseModel, EmailStr
from typing import Literal


class SignatureCreate(BaseModel):
    proposal_token: str
    signer_name: str
    signer_email: EmailStr
    signature_data: str  # base64 PNG or typed name
    signature_type: Literal["drawn", "typed"]
