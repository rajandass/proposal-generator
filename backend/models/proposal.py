from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
import uuid


class TimelineItem(BaseModel):
    phase: str
    duration: str


class ExpenditureItem(BaseModel):
    description: str
    cost: float
    tax_rate: float


class ContactInfo(BaseModel):
    company: str
    address: str
    phone: str
    email: str


class ScopeOfWork(BaseModel):
    deliverables: list[str]
    resources: list[str]


class ProposalContent(BaseModel):
    executive_summary: str
    scope_of_work: ScopeOfWork
    timeline: list[TimelineItem]
    expenditure: list[ExpenditureItem]
    about_us: str
    contact: ContactInfo


class ProposalCreate(BaseModel):
    client_name: str
    client_email: EmailStr
    title: str
    price: float
    brief: str


class ProposalUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[ProposalContent] = None
    status: Optional[str] = None


class ProposalResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    token: str
    client_name: str
    client_email: str
    title: str
    status: str
    price: float
    content: ProposalContent
    created_at: datetime
    updated_at: datetime
