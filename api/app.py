# Import required FastAPI components for building the API
from fastapi import FastAPI, HTTPException, Request, UploadFile, File
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
# Import Pydantic for data validation and settings management
from pydantic import BaseModel
# Import OpenAI client for interacting with OpenAI's API
from openai import OpenAI
import os
import sys
from typing import Optional, List
from dotenv import load_dotenv
import tempfile
import shutil

# Add the aimakerspace library to the path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

# Import aimakerspace components
from aimakerspace.text_utils import PDFFileLoader, CharacterTextSplitter
from aimakerspace.vectordatabase import VectorDatabase
from aimakerspace.openai_utils.embedding import EmbeddingModel
from aimakerspace.openai_utils.chatmodel import ChatOpenAI

# Load environment variables
load_dotenv()

# Initialize FastAPI application with a title
app = FastAPI(title="Flewian Analysis API")

# Configure CORS (Cross-Origin Resource Sharing) middleware
# This allows the API to be accessed from different domains/origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # TEMP: Allow all origins for debugging
    allow_credentials=False,  # Must be False when using "*"
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables to store the RAG system state
vector_db = None
document_chunks = []
document_loaded = False

# Define the data model for chat requests using Pydantic
# This ensures incoming request data is properly validated
class ChatRequest(BaseModel):
    developer_message: str  # Message from the developer/system
    user_message: str      # Message from the user
    model: Optional[str] = "gpt-4o-mini"  # Fixed model name

# Define a root endpoint for health checks and deployment verification
@app.get("/")
async def root():
    return {
        "message": "Flewian Analysis API is running",
        "status": "active",
        "version": "2.0.0",
        "document_loaded": document_loaded
    }

# Define an API root endpoint for health checks and deployment verification
@app.get("/api")
async def api_root():
    return {
        "message": "Flewian Analysis API is running",
        "status": "active",
        "version": "2.0.0",
        "document_loaded": document_loaded
    }

# Define endpoint to upload and process PDF documents
@app.post("/api/upload-pdf")
async def upload_pdf(file: UploadFile = File(...)):
    global vector_db, document_chunks, document_loaded
    
    try:
        # Check if file is a PDF
        if not file.filename.lower().endswith('.pdf'):
            raise HTTPException(status_code=400, detail="File must be a PDF")
        
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp_file:
            shutil.copyfileobj(file.file, temp_file)
            temp_path = temp_file.name
        
        # Process the PDF using aimakerspace
        pdf_loader = PDFFileLoader(temp_path)
        documents = pdf_loader.load_documents()
        
        # Split documents into chunks
        text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        document_chunks = text_splitter.split_texts(documents)
        
        # Initialize vector database and embedding model
        embedding_model = EmbeddingModel()
        vector_db = VectorDatabase(embedding_model)
        
        # Build vector database from chunks
        import asyncio
        await vector_db.abuild_from_list(document_chunks)
        
        # Clean up temporary file
        os.unlink(temp_path)
        
        document_loaded = True
        
        return {
            "message": "PDF uploaded and processed successfully",
            "chunks_created": len(document_chunks),
            "filename": file.filename
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing PDF: {str(e)}")

# Define endpoint to check document status
@app.get("/api/document-status")
async def document_status():
    return {
        "document_loaded": document_loaded,
        "chunks_count": len(document_chunks) if document_chunks else 0
    }

# Define the main chat endpoint that handles POST requests with RAG
@app.post("/api/chat")
async def chat(request: ChatRequest):
    global vector_db, document_chunks, document_loaded
    
    try:
        # Get API key from environment variable
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="OpenAI API key not configured")
        
        # Initialize OpenAI client with the API key from environment
        client = OpenAI(api_key=api_key)
        
        # Create an async generator function for streaming responses
        async def generate():
            # If we have a document loaded, use RAG
            if document_loaded and vector_db and document_chunks:
                # Search for relevant chunks
                relevant_chunks = vector_db.search_by_text(
                    request.user_message, 
                    k=3, 
                    return_as_text=True
                )
                
                # Create context from relevant chunks
                context = "\n\n".join(relevant_chunks)
                
                # Create RAG-enhanced system message
                rag_system_message = f"""You are an AI philosopher trained in conceptual analysis in the style of Antony Flew and the Oxford analytic tradition. Your task is to examine the **use of concepts** in the user's prompt and in the retrieved document context, analysing clarity, consistency, and implications using ordinary-language philosophy.

CONTEXT FROM DOCUMENT:
{context}

Follow this structure strictly:
1. Clarify the Conceptual Terms:
   - Identify and define the key terms in ordinary language; contrast any ambiguous or misleading usages.

2. Uncover Assumptions:
   - State the presuppositions or conceptual commitments implicit in the text.
   - Highlight hidden contradictions or category errors, if any.

3. Apply the Paradigm Case Argument (if relevant):
   - When a concept is denied wholesale, demonstrate paradigm cases where it clearly applies.

4. Provide a Clear, Brief Conclusion:
   - Offer a clarified version of the original claim OR explain what conceptual work is required to make it coherent.

General Style Constraints:
- Avoid jargon unless quoting it to explain or challenge it.
- Prioritise clarity, ordinary usage, and logical consistency.
- Do not attempt to *solve* metaphysical problems — aim to *dissolve* conceptual confusion.
- Insert **one blank line** after each numbered section for readability.
- When quoting directly from the document, append a citation like "(Book, p. 12)" (use page/location if available).

{request.developer_message}"""
                
                # Create a streaming chat completion request with RAG context
                stream = client.chat.completions.create(
                    model=request.model,
                    messages=[
                        {"role": "system", "content": rag_system_message},
                        {"role": "user", "content": request.user_message}
                    ],
                    stream=True  # Enable streaming response
                )
            else:
                # Fall back to regular chat without RAG
                stream = client.chat.completions.create(
                    model=request.model,
                    messages=[
                        {"role": "system", "content": request.developer_message},
                        {"role": "user", "content": request.user_message}
                    ],
                    stream=True  # Enable streaming response
                )
            
            # Yield each chunk of the response as it becomes available
            for chunk in stream:
                if chunk.choices[0].delta.content is not None:
                    content = chunk.choices[0].delta.content
                    if content:  # Only yield non-empty content
                        yield content

        # Return a streaming response to the client
        return StreamingResponse(generate(), media_type="text/plain")
    
    except Exception as e:
        # Handle any errors that occur during processing
        raise HTTPException(status_code=500, detail=str(e))

# Define a health check endpoint to verify API status
@app.get("/api/health")
async def health_check():
    return {"status": "ok", "document_loaded": document_loaded}

@app.options("/api/chat")
async def options_chat(request: Request):
    return {}

# Entry point for running the application directly
if __name__ == "__main__":
    import uvicorn
    # Start the server on all network interfaces (0.0.0.0) on port 8000
    uvicorn.run(app, host="0.0.0.0", port=8000)
