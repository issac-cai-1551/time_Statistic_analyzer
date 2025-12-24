from datetime import datetime
from typing import Optional
from sqlmodel import Field, SQLModel, Relationship

from pydantic import BaseModel

# --- Category Models ---
class CategoryBase(SQLModel):
    key: str = Field(index=True, unique=True)
    name: str
    color: Optional[str] = None
    is_active: bool = Field(default=True)

class Category(CategoryBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(SQLModel):
    name: Optional[str] = None
    color: Optional[str] = None
    is_active: Optional[bool] = None

# --- TimerSession Models ---
class TimerSessionCreate(BaseModel):
    category_key: Optional[str] = None

class TimerSessionUpdate(BaseModel):
    category_key: Optional[str] = None

class TimerSession(BaseModel):
    start_time: datetime = Field(default_factory=datetime.now)
    category_key: Optional[str] = None

# --- TimeRecord Models ---
class TimeRecord(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    start_time: datetime
    end_time: datetime
    duration_seconds: int
    date: str  # YYYY-MM-DD
    
    # Snapshot fields
    category_key: Optional[str] = None
    category_name: str
    category_color: Optional[str] = None
    
    created_at: datetime = Field(default_factory=datetime.now)
