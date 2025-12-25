from contextlib import asynccontextmanager
from datetime import datetime, date
from typing import Optional
from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select
from .database import create_db_and_tables, get_session
from .models import (
    TimerSession, 
    Category, 
    CategoryCreate, 
    CategoryUpdate, 
    TimeRecord, 
    TimerSessionCreate,
    TimerSessionUpdate
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Category Endpoints ---

@app.post("/categories/", response_model=Category)
def create_category(category: CategoryCreate, session: Session = Depends(get_session)):
    # Check for existing key
    existing_category = session.exec(select(Category).where(Category.key == category.key)).first()
    if existing_category:
        raise HTTPException(status_code=400, detail=f"Category with key '{category.key}' already exists")
        
    db_category = Category.model_validate(category)
    session.add(db_category)
    session.commit()
    session.refresh(db_category)
    return db_category

@app.get("/categories/", response_model=list[Category])
def read_categories(
    active_only: bool = Query(True, description="If true, return only active categories"),
    session: Session = Depends(get_session)
):
    query = select(Category)
    if active_only:
        query = query.where(Category.is_active == True)
    categories = session.exec(query).all()
    return categories

@app.put("/categories/{category_id}", response_model=Category)
def update_category(category_id: int, category_update: CategoryUpdate, session: Session = Depends(get_session)):
    db_category = session.get(Category, category_id)
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    category_data = category_update.model_dump(exclude_unset=True)
    for key, value in category_data.items():
        setattr(db_category, key, value)
        
    session.add(db_category)
    session.commit()
    session.refresh(db_category)
    return db_category

@app.delete("/categories/{category_id}")
def delete_category(category_id: int, session: Session = Depends(get_session)):
    """
    Logical delete: Sets is_active to False.
    """
    db_category = session.get(Category, category_id)
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    db_category.is_active = False
    session.add(db_category)
    session.commit()
    return {"ok": True, "message": "Category deactivated"}

# --- Timer Endpoints ---

# Global variable to store the active session in memory
current_session: Optional[TimerSession] = None

@app.get("/current", response_model=Optional[TimerSession])
def get_current_session():
    global current_session
    return current_session

@app.post("/start", response_model=TimerSession)
def start_timer(session_data: Optional[TimerSessionCreate] = None, session: Session = Depends(get_session)):
    global current_session
    
    # Check if there is already a running session
    if current_session:
        raise HTTPException(status_code=400, detail="Timer is already running")
    
    # Use default if no body provided
    if session_data is None:
        session_data = TimerSessionCreate()
        
    category_key = session_data.category_key
    
    # Validate category_key if provided
    if category_key:
        if category_key == "uncategorized" or category_key == "":
            category_key = None
        else:
            statement = select(Category).where(Category.key == category_key)
            category = session.exec(statement).first()
            
            if not category:
                raise HTTPException(status_code=404, detail=f"Category with key '{category_key}' not found")
            
            if not category.is_active:
                 raise HTTPException(status_code=400, detail=f"Category '{category_key}' is inactive")

    # Create new session in memory
    current_session = TimerSession(category_key=category_key, start_time=datetime.now())
    return current_session

@app.put("/current", response_model=TimerSession)
def update_current_session(session_data: TimerSessionUpdate, session: Session = Depends(get_session)):
    global current_session
    
    # Check if there is a running session
    if not current_session:
        raise HTTPException(status_code=400, detail="No timer is running")
        
    # Validate category if provided
    if session_data.category_key is not None:
        if session_data.category_key == "uncategorized" or session_data.category_key == "":
            session_data.category_key = None
        else:
            statement = select(Category).where(Category.key == session_data.category_key)
            category = session.exec(statement).first()
            if not category:
                raise HTTPException(status_code=404, detail=f"Category '{session_data.category_key}' not found")
            if not category.is_active:
                 raise HTTPException(status_code=400, detail=f"Category '{session_data.category_key}' is inactive")
            
    # Update category
    current_session.category_key = session_data.category_key
    return current_session

@app.post("/stop", response_model=TimeRecord)
def stop_timer(session: Session = Depends(get_session)):
    global current_session
    
    # Check if there is a running session
    if not current_session:
        raise HTTPException(status_code=400, detail="No timer is running")
    
    end_time = datetime.now()
    
    # Calculate duration
    duration = end_time - current_session.start_time
    duration_seconds = int(duration.total_seconds())
    
    # Resolve category details for SNAPSHOT
    category_key = current_session.category_key
    category_name = "Uncategorized"
    category_color = None
    
    if category_key:
        statement = select(Category).where(Category.key == category_key)
        category = session.exec(statement).first()
        if category:
            category_name = category.name
            category_color = category.color
        else:
            # Fallback if category was deleted physically or key changed (shouldn't happen with logical delete)
            category_name = f"Unknown ({category_key})"

    # Create TimeRecord with SNAPSHOT data
    time_record = TimeRecord(
        start_time=current_session.start_time,
        end_time=end_time,
        duration_seconds=duration_seconds,
        date=end_time.strftime("%Y-%m-%d"),
        
        # Snapshot fields
        category_key=category_key,
        category_name=category_name,
        category_color=category_color
    )
    
    session.add(time_record)
    session.commit()
    session.refresh(time_record)
    
    # Clear current session
    current_session = None
    
    return time_record

# --- Stats Endpoints ---

@app.get("/stats/daily")
def get_daily_stats(
    date_param: date = Query(default_factory=date.today, alias="date"),
    session: Session = Depends(get_session)
):
    target_date_str = date_param.strftime("%Y-%m-%d")
    
    # Get all TimeRecords for target_date
    statement = select(TimeRecord).where(TimeRecord.date == target_date_str)
    records = session.exec(statement).all()
    
    total_seconds = 0
    breakdown = {}
    
    for r in records:
        total_seconds += r.duration_seconds
        
        # Use snapshot name
        name = r.category_name or "Uncategorized"
        
        if name in breakdown:
            breakdown[name] += r.duration_seconds
        else:
            breakdown[name] = r.duration_seconds
            
    return {
        "date": date_param,
        "total_seconds": total_seconds,
        "total_minutes": round(total_seconds / 60, 2),
        "total_hours": round(total_seconds / 3600, 2),
        "breakdown": breakdown,
        "records": records
    }

@app.get("/stats/range")
def get_range_stats(
    start_date: date = Query(..., alias="start"),
    end_date: date = Query(..., alias="end"),
    session: Session = Depends(get_session)
):
    start_str = start_date.strftime("%Y-%m-%d")
    end_str = end_date.strftime("%Y-%m-%d")
    
    # Get all TimeRecords within range
    statement = select(TimeRecord).where(
        TimeRecord.date >= start_str,
        TimeRecord.date <= end_str
    )
    records = session.exec(statement).all()
    
    total_seconds = 0
    category_stats = {}
    daily_stats = {}  # date -> total_seconds
    
    for r in records:
        total_seconds += r.duration_seconds
        
        # Use snapshot name
        name = r.category_name or "Uncategorized"
        
        # Aggregate by category
        if name in category_stats:
            category_stats[name] += r.duration_seconds
        else:
            category_stats[name] = r.duration_seconds
            
        # Aggregate by date
        if r.date in daily_stats:
            daily_stats[r.date] += r.duration_seconds
        else:
            daily_stats[r.date] = r.duration_seconds
            
    return {
        "start_date": start_date,
        "end_date": end_date,
        "total_seconds": total_seconds,
        "total_minutes": round(total_seconds / 60, 2),
        "total_hours": round(total_seconds / 3600, 2),
        "breakdown": category_stats,
        "daily_trend": daily_stats
    }

if __name__ == "__main__":
    import uvicorn
    # Use 127.0.0.1 to avoid firewall prompts on some systems, and port 8000
    uvicorn.run(app, host="127.0.0.1", port=8000)
