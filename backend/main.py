import os
import io
import json
import logging
import html
from typing import List, Optional
from fastapi import FastAPI, UploadFile, File, HTTPException, Body
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator
from pypdf import PdfReader
from dotenv import load_dotenv
import google.generativeai as genai

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ai-productivity-assistant")

# Load environment variables
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Initialize FastAPI
app = FastAPI(
    title="AI Productivity Assistant API",
    description="Backend API for the AI Productivity Assistant, powered by Gemini API",
    version="1.0.0"
)

# Configure CORS dynamically for security
allowed_origins_str = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,https://flow-mind-ai-ten.vercel.app")
allowed_origins = [o.strip() for o in allowed_origins_str.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security headers middleware
@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    return response

# Global Exception Handler to hide stack traces in production
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Internal server error: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred. Please try again later."}
    )

# Configure Gemini
api_key_valid = False
if GEMINI_API_KEY:
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        api_key_valid = True
        logger.info("Gemini API configured successfully.")
    except Exception as e:
        logger.error(f"Error configuring Gemini API: {e}")
else:
    logger.warning("GEMINI_API_KEY not found in environment variables. Running in DEMO/MOCK mode.")

# --- Pydantic Schemas for Gemini Structured Outputs ---

class TaskBreakdown(BaseModel):
    title: str = Field(..., description="Title of the task")
    priority: str = Field(..., description="Priority: High, Medium, or Low")
    estimated_duration: str = Field(..., description="Estimated time required, e.g., '30 mins', '2 hours'")
    description: str = Field(..., description="Short description of what needs to be done")

class ChatAssistantResponse(BaseModel):
    reply: str = Field(..., description="Conversational reply summarizing the advice and plan")
    tasks: List[TaskBreakdown] = Field(default=[], description="List of generated tasks to add to the planner")
    suggested_schedule: List[str] = Field(default=[], description="List of schedule time blocks, e.g., '10:00 AM - 11:30 AM: Review notes'")
    is_mock: bool = Field(default=False, description="Flag indicating if the response is mock data due to missing API key")

class DailyScheduleItem(BaseModel):
    time: str = Field(..., description="Time slot, e.g., '09:00 AM', '1:00 PM'")
    activity: str = Field(..., description="Task or activity title")
    duration: str = Field(..., description="Duration of slot, e.g., '1 hour', '45 mins'")

class DailyPlannerResponse(BaseModel):
    schedule: List[DailyScheduleItem] = Field(..., description="List of scheduled timeline items")
    productivity_tips: List[str] = Field(..., description="A few actionable productivity tips customized for the plan")
    is_mock: bool = Field(default=False, description="Flag indicating if response is mock")

class EmailResponse(BaseModel):
    subject: str = Field(..., description="Professional email subject line")
    body: str = Field(..., description="Professional email body text")
    is_mock: bool = Field(default=False, description="Flag indicating if response is mock")

class TextSummaryResponse(BaseModel):
    summary: str = Field(..., description="Detailed paragraph summary of the text")
    key_points: List[str] = Field(..., description="Key bullet points summarizing main insights")
    action_items: List[str] = Field(..., description="Actionable checklist items extracted from the text")
    is_mock: bool = Field(default=False, description="Flag indicating if response is mock")

# --- Input Request Schemas with Pre-Sanitizers and Limits ---

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=1000)

    @field_validator('message')
    @classmethod
    def sanitize_message(cls, v):
        return html.escape(v.strip())

class PlannerRequest(BaseModel):
    prompt: str = Field(..., min_length=1, max_length=1000)
    tasks: List[str] = Field(default=[], max_length=100)

    @field_validator('prompt')
    @classmethod
    def sanitize_prompt(cls, v):
        return html.escape(v.strip())

    @field_validator('tasks')
    @classmethod
    def sanitize_tasks(cls, v):
        return [html.escape(t.strip()) for t in v]

class EmailRequest(BaseModel):
    prompt: str = Field(..., min_length=1, max_length=1000)

    @field_validator('prompt')
    @classmethod
    def sanitize_prompt(cls, v):
        return html.escape(v.strip())

class SummarizeRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=100000)

    @field_validator('text')
    @classmethod
    def sanitize_text(cls, v):
        return html.escape(v.strip())

# --- Schema Cleaning Helper ---

def get_clean_gemini_schema(pydantic_model):
    """
    Resolves $ref links and filters out unsupported fields (like default, $defs) 
    from Pydantic schemas to ensure 100% compatibility with Gemini API.
    """
    schema = pydantic_model.model_json_schema()
    defs = schema.get("$defs", {})
    
    def resolve_refs(item):
        if isinstance(item, list):
            return [resolve_refs(i) for i in item]
        elif isinstance(item, dict):
            if "$ref" in item:
                ref_path = item["$ref"]
                def_name = ref_path.split("/")[-1]
                return resolve_refs(defs[def_name])
            return {k: resolve_refs(v) for k, v in item.items()}
        return item
        
    resolved_schema = resolve_refs(schema)
    
    def clean_fields(s):
        if not isinstance(s, dict):
            return s
            
        allowed_keys = {"type", "description", "properties", "required", "items", "enum"}
        type_map = {
            "string": "STRING",
            "integer": "INTEGER",
            "number": "NUMBER",
            "boolean": "BOOLEAN",
            "object": "OBJECT",
            "array": "ARRAY"
        }
        
        cleaned = {}
        for k, v in s.items():
            if k in allowed_keys:
                if k == "type" and isinstance(v, str):
                    cleaned[k] = type_map.get(v.lower(), v.upper())
                elif k == "properties" and isinstance(v, dict):
                    cleaned[k] = {name: clean_fields(val) for name, val in v.items()}
                elif k == "items" and isinstance(v, dict):
                    cleaned[k] = clean_fields(v)
                else:
                    cleaned[k] = v
        return cleaned

    return clean_fields(resolved_schema)

# --- Helper Functions ---

def get_gemini_model(model_name: str = "gemini-3.5-flash"):
    """Returns the GenerativeModel instance or raises exception if not configured."""
    if not api_key_valid:
        raise ValueError("API key not configured")
    return genai.GenerativeModel(model_name)

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extracts text from PDF bytes using PyPDF."""
    try:
        pdf_file = io.BytesIO(file_bytes)
        reader = PdfReader(pdf_file)
        text = ""
        for i, page in enumerate(reader.pages):
            page_text = page.extract_text()
            if page_text:
                text += f"[Page {i+1}]\n{page_text}\n"
        return text
    except Exception as e:
        logger.error(f"Error parsing PDF: {e}")
        raise HTTPException(status_code=400, detail="Failed to parse the PDF file. Please ensure it is a valid PDF.")

# --- Mock Data Generation ---

def generate_mock_chat(user_message: str) -> ChatAssistantResponse:
    return ChatAssistantResponse(
        reply=f"👋 Hello! I am running in DEMO mode because no `GEMINI_API_KEY` was provided. Set the key in `backend/.env` for real AI suggestions!\n\nHere is a mock task breakdown based on: '{user_message}'",
        tasks=[
            TaskBreakdown(title="Define project scope", priority="High", estimated_duration="1 hour", description="Determine boundaries and deliverables for the request."),
            TaskBreakdown(title="Research design inspiration", priority="Medium", estimated_duration="2 hours", description="Look at SaaS dashboard structures for best practices."),
            TaskBreakdown(title="Draft initial layout", priority="Low", estimated_duration="1.5 hours", description="Create low-fidelity mockups of components.")
        ],
        suggested_schedule=[
            "09:00 AM - 10:00 AM: Define project scope",
            "10:00 AM - 12:00 PM: Research design inspiration",
            "01:00 PM - 02:30 PM: Draft initial layout"
        ],
        is_mock=True
    )

def generate_mock_planner(prompt: str, tasks: list) -> DailyPlannerResponse:
    return DailyPlannerResponse(
        schedule=[
            DailyScheduleItem(time="09:00 AM", activity="Focus Session: Backend API Setup", duration="1.5 hours"),
            DailyScheduleItem(time="10:30 AM", activity="Break & Hydrate", duration="15 mins"),
            DailyScheduleItem(time="10:45 AM", activity="Focus Session: Frontend Layout implementation", duration="2 hours"),
            DailyScheduleItem(time="12:45 PM", activity="Lunch Break", duration="1 hour"),
            DailyScheduleItem(time="01:45 PM", activity="Integration & Testing", duration="1.5 hours")
        ],
        productivity_tips=[
            "Use the Pomodoro technique: 25 minutes of work followed by a 5-minute break.",
            "Turn off notifications during focus sessions.",
            "Complete your highest priority task first thing in the morning."
        ],
        is_mock=True
    )

def generate_mock_email(prompt: str) -> EmailResponse:
    return EmailResponse(
        subject="Project Update & Timeline Request",
        body=(
            f"Dear Team,\n\n"
            f"Regarding our request: '{prompt}'.\n\n"
            f"I wanted to update you on the current status. We are making great progress, but "
            f"to ensure the highest quality deliverables, I would like to request a brief extension "
            f"on the upcoming deadline.\n\n"
            f"Please let me know if we can coordinate a quick discussion about this.\n\n"
            f"Best regards,\n"
            f"[Your Name]"
        ),
        is_mock=True
    )

def generate_mock_summary(text: str) -> TextSummaryResponse:
    truncated = text[:100] + "..." if len(text) > 100 else text
    return TextSummaryResponse(
        summary=(
            f"This is a DEMO summary. The provided document starts with: '{truncated}'. "
            f"To get automated summaries, please configure the `GEMINI_API_KEY` in the `backend/.env` file."
        ),
        key_points=[
            "Document parsing is working perfectly, but requires Gemini API to generate deep summaries.",
            "Text length analyzed: " + f"{len(text)} characters.",
            "File read succeeded."
        ],
        action_items=[
            "Add GEMINI_API_KEY to your backend environment variables",
            "Restart backend server",
            "Try uploading this file again"
        ],
        is_mock=True
    )

# --- Routes ---

@app.get("/api/health")
async def health():
    return {
        "status": "healthy",
        "gemini_api_configured": api_key_valid
    }

@app.post("/api/chat", response_model=ChatAssistantResponse)
async def chat(request: ChatRequest):
    if not api_key_valid:
        return generate_mock_chat(request.message)
    
    try:
        model = get_gemini_model()
        prompt = (
            f"You are a helpful AI Productivity Assistant. The user says: '{request.message}'.\n"
            "Formulate a friendly, encouraging chat response. In addition, break down the goal "
            "into specific actionable tasks, complete with priority and estimated duration, and suggest "
            "a schedule layout. Return a structured JSON response matching the schema."
        )
        
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                response_mime_type="application/json",
                response_schema=get_clean_gemini_schema(ChatAssistantResponse)
            )
        )
        
        result = json.loads(response.text)
        return ChatAssistantResponse(**result)
    
    except Exception as e:
        logger.error(f"Error in /api/chat: {e}")
        return generate_mock_chat(request.message)

@app.post("/api/planner", response_model=DailyPlannerResponse)
async def planner(request: PlannerRequest):
    if not api_key_valid:
        return generate_mock_planner(request.prompt, request.tasks)
    
    try:
        model = get_gemini_model()
        tasks_context = f"\nTasks to incorporate: {', '.join(request.tasks)}" if request.tasks else ""
        prompt = (
            f"Create a highly detailed daily planner schedule based on this requirement: '{request.prompt}'.{tasks_context}\n"
            "Suggest realistic time slots and custom actionable productivity tips. Return a structured JSON response."
        )
        
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                response_mime_type="application/json",
                response_schema=get_clean_gemini_schema(DailyPlannerResponse)
            )
        )
        
        result = json.loads(response.text)
        return DailyPlannerResponse(**result)
    
    except Exception as e:
        logger.error(f"Error in /api/planner: {e}")
        return generate_mock_planner(request.prompt, request.tasks)

@app.post("/api/email", response_model=EmailResponse)
async def email(request: EmailRequest):
    if not api_key_valid:
        return generate_mock_email(request.prompt)
    
    try:
        model = get_gemini_model()
        prompt = (
            f"Generate a professional, polished, high-quality email draft based on this request: '{request.prompt}'.\n"
            "Provide both a compelling subject line and a structured, friendly body. Return a structured JSON response."
        )
        
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                response_mime_type="application/json",
                response_schema=get_clean_gemini_schema(EmailResponse)
            )
        )
        
        result = json.loads(response.text)
        return EmailResponse(**result)
    
    except Exception as e:
        logger.error(f"Error in /api/email: {e}")
        return generate_mock_email(request.prompt)

@app.post("/api/summarize", response_model=TextSummaryResponse)
async def summarize(request: SummarizeRequest):
    if not api_key_valid:
        return generate_mock_summary(request.text)
    
    try:
        model = get_gemini_model()
        prompt = (
            f"Analyze the following text and summarize it. Extract key insights and actionable check items.\n"
            f"Text to summarize:\n{request.text}\n\n"
            "Return a structured JSON response with summary, key_points list, and action_items list."
        )
        
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                response_mime_type="application/json",
                response_schema=get_clean_gemini_schema(TextSummaryResponse)
            )
        )
        
        result = json.loads(response.text)
        return TextSummaryResponse(**result)
        
    except Exception as e:
        logger.error(f"Error in /api/summarize: {e}")
        return generate_mock_summary(request.text)

@app.post("/api/pdf", response_model=TextSummaryResponse)
async def pdf(file: UploadFile = File(...)):
    # Read PDF bytes
    file_bytes = await file.read()
    
    # Extract text from PDF
    text = extract_text_from_pdf(file_bytes)
    
    if not text.strip():
        raise HTTPException(status_code=400, detail="The uploaded PDF file does not contain extractable text.")
        
    # Reuse summarize logic
    if not api_key_valid:
        return generate_mock_summary(text)
        
    try:
        model = get_gemini_model()
        truncated_text = text[:100000]
        prompt = (
            f"Analyze the following text extracted from a PDF and summarize it. Extract key insights and actionable check items.\n"
            f"Text content:\n{truncated_text}\n\n"
            "Return a structured JSON response with summary, key_points list, and action_items list."
        )
        
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                response_mime_type="application/json",
                response_schema=get_clean_gemini_schema(TextSummaryResponse)
            )
        )
        
        result = json.loads(response.text)
        return TextSummaryResponse(**result)
        
    except Exception as e:
        logger.error(f"Error in /api/pdf: {e}")
        return generate_mock_summary(text)

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    uvicorn.run("main:app", host=host, port=port, reload=True)
