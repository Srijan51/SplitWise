from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import time

app = FastAPI(
    title="SplitWise AI Receipt Scanner",
    description="Microservice for extracting structured data from receipt images.",
    version="1.0.0",
)

# Allow CORS for the Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
    """
    Upload a receipt image (JPEG/PNG) and use AI (Vision) to extract the total amount, vendor, and items.
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image.")

    content = await file.read()
    
    # ---------------------------------------------------------
    # TODO: Connect your actual AI Model here (e.g., OpenAI/Gemini)
    # Example using hypothetical API:
    # 
    # response = openai.chat.completions.create(
    #     model="gpt-4-vision-preview",
    #     messages=[
    #         {"role": "user", "content": [
    #             {"type": "text", "text": "Extract total, vendor, date, and items from this receipt as JSON."},
    #             {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_encoded}"}}
    #         ]}
    #     ]
    # )
    # return json.loads(response.choices[0].message.content)
    # ---------------------------------------------------------

    # SIMULATED AI DELAY
    time.sleep(1.5)

    # SIMULATED AI RESPONSE
    # (Since we don't have an API key yet, we return a smart mock)
    return ScanResult(
        total_amount=1250.50,
        vendor="Biryani Blues",
        date="2026-07-04",
        items=[
            ScannedItem(name="Chicken Dum Biryani (Large)", price=750.00),
            ScannedItem(name="Paneer Tikka", price=350.00),
            ScannedItem(name="Diet Coke x2", price=100.50),
            ScannedItem(name="Taxes", price=50.00)
        ],
        category_guess="Food"
    )

@app.get("/health", tags=["System"])
def health_check():
    return {"status": "ok", "service": "ai-receipt-scanner"}
