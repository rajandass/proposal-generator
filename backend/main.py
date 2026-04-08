from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()

from api import proposals, generate, sign, razorpay as razorpay_api

app = FastAPI(title="Proposal Generator API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "http://localhost:3000")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(proposals.router, prefix="/api/proposals", tags=["proposals"])
app.include_router(generate.router, prefix="/api/generate", tags=["generate"])
app.include_router(sign.router, prefix="/api/sign", tags=["sign"])
app.include_router(razorpay_api.router, prefix="/api/razorpay", tags=["razorpay"])


@app.get("/health")
async def health():
    return {"status": "ok"}
