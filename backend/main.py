import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from typing import List, Optional, Any
from prisma import Prisma
import jwt
import bcrypt
import time
import socketio

# Initialize Prisma Client
db = Prisma()

# Initialize Socket.IO Server
sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')

@asynccontextmanager
async def lifespan(app: FastAPI):
    await db.connect()
    yield
    await db.disconnect()

app = FastAPI(title="SplitWise Backend", lifespan=lifespan)
app.mount("/socket.io", socketio.ASGIApp(sio))

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SECRET_KEY = "your-secret-key-for-jwt"
ALGORITHM = "HS256"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

# --- AUTHENTICATION ---
class RegisterUser(BaseModel):
    email: str
    password: str
    name: str

@app.post("/api/auth/register")
async def register(user: RegisterUser):
    hashed_pw = bcrypt.hashpw(user.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    try:
        new_user = await db.user.create(
            data={"email": user.email, "name": user.name, "password": hashed_pw}
        )
        return {"id": new_user.id, "email": new_user.email}
    except Exception as e:
        raise HTTPException(status_code=400, detail="Email already exists")

@app.post("/api/auth/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await db.user.find_unique(where={"email": form_data.username})
    if not user or not bcrypt.checkpw(form_data.password.encode('utf-8'), user.password.encode('utf-8')):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    token = jwt.encode({"sub": user.id, "email": user.email}, SECRET_KEY, algorithm=ALGORITHM)
    return {"access_token": token, "token_type": "bearer", "user": {"id": user.id, "name": user.name}}

async def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401)
        user = await db.user.find_unique(where={"id": user_id})
        if user is None:
            raise HTTPException(status_code=401)
        return user
    except jwt.PyJWTError:
        raise HTTPException(status_code=401)

# --- GROUPS ---
class GroupCreate(BaseModel):
    name: str
    type: str = "ONGOING"
    currency: str = "INR"

@app.get("/api/groups")
async def get_groups(user = Depends(get_current_user)):
    memberships = await db.groupmember.find_many(
        where={"userId": user.id},
        include={"group": True}
    )
    return [m.group for m in memberships if m.group]

@app.post("/api/groups")
async def create_group(group: GroupCreate, user = Depends(get_current_user)):
    import random, string
    invite_code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    
    new_group = await db.group.create(
        data={
            "name": group.name,
            "type": group.type,
            "currency": group.currency,
            "inviteCode": invite_code,
            "members": {
                "create": [{"userId": user.id, "role": "ADMIN"}]
            }
        }
    )
    return new_group

@app.get("/api/groups/{group_id}")
async def get_group(group_id: str, user = Depends(get_current_user)):
    group = await db.group.find_unique(
        where={"id": group_id},
        include={
            "members": {"include": {"user": True}},
            "expenses": {"include": {"paidBy": True, "splits": True}, "order": {"createdAt": "desc"}}
        }
    )
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    return group

# --- AI RECEIPT SCANNER ---
class ScannedItem(BaseModel):
    name: str
    price: float

class ScanResult(BaseModel):
    total_amount: float
    vendor: str
    date: Optional[str]
    items: List[ScannedItem]
    category_guess: str

@app.post("/api/scan-receipt", response_model=ScanResult, tags=["AI Vision"])
async def scan_receipt(file: UploadFile = File(...)):
    # Simulated OCR/AI Logic
    await asyncio.sleep(1.5)
    return ScanResult(
        total_amount=1250.50,
        vendor="Biryani Blues",
        date="2026-07-04",
        items=[
            ScannedItem(name="Chicken Dum Biryani", price=750.00),
            ScannedItem(name="Paneer Tikka", price=350.00),
            ScannedItem(name="Taxes", price=150.50)
        ],
        category_guess="Food"
    )

# --- SOCKET.IO EVENTS ---
@sio.event
async def connect(sid, environ):
    print(f"Client connected: {sid}")

@sio.event
async def join_group(sid, group_id):
    sio.enter_room(sid, group_id)
    print(f"Socket {sid} joined group {group_id}")

@sio.event
async def disconnect(sid):
    print(f"Client disconnected: {sid}")
