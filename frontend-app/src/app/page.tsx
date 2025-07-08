'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'system',
      content: 'FLEWIAN ANALYSIS TERMINAL v1.0\n\nWelcome to the Conceptual Analysis Interface.\nUpload a philosophical PDF or ask a conceptual question to begin.\n\n> ',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [documentLoaded, setDocumentLoaded] = useState(false);
  const [documentName, setDocumentName] = useState('');
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentAssistantContent = useRef('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Removed automatic document-status check to avoid premature "ready" messages
  // If you want to re-enable, uncomment the lines below.
  /*
  useEffect(() => {
    checkDocumentStatus();
  }, []);
  */

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const checkDocumentStatus = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/document-status`);
      if (response.ok) {
        const data = await response.json();
        setDocumentLoaded(data.document_loaded);
        // Removed auto-pushing system message to avoid duplicate success notice
      }
    } catch (error) {
      console.error('Error checking document status:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setMessages(prev => [...prev, {
        role: 'system',
        content: 'ERROR: Please upload a PDF file only.\n\n> ',
        timestamp: new Date()
      }]);
      return;
    }

    setUploading(true);
    setMessages(prev => [...prev, {
      role: 'system',
      content: `Processing PDF: ${file.name}...\n\n> `,
      timestamp: new Date()
    }]);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/upload-pdf`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setDocumentLoaded(true);
        setDocumentName(file.name);
        setMessages(prev => [...prev, {
          role: 'system',
          content: `✅ PDF processed successfully!\n📄 Document: ${file.name}\n📊 Chunks created: ${data.chunks_created}\n\nYou can now ask questions about this document.\n\n> `,
          timestamp: new Date()
        }]);
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      // Log error to use the variable and satisfy ESLint
      console.error('Upload error:', error);
      setMessages(prev => [...prev, {
        role: 'system',
        content: 'ERROR: Failed to process PDF. Please try again.\n\n> ',
        timestamp: new Date()
      }]);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Advanced Dynamic System Messages
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getAdvancedSystemMessage = (_userInput: string) => {
    return `You are an AI philosopher trained in conceptual analysis in the style of Antony Flew and the Oxford analytic tradition. Your task is to examine the **use of concepts** in the user's prompt and any retrieved document context, analysing clarity, consistency, and implications using ordinary-language philosophy.

Follow this structure strictly:
1. Clarify the Conceptual Terms:
   - Identify and define the key terms in ordinary language; contrast ambiguous or misleading usages.

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
- When quoting directly from the document, append a citation like "(Book, p. 12)" (use page/location if available).`;
  };

  // Few-Shot Learning Examples
  const getFewShotExamples = (userInput: string) => {
    const input = userInput.toLowerCase();
    
    if (input.includes('explain') && input.includes('beginner')) {
      return `

EXAMPLE:
User: "Explain photosynthesis to a beginner"
Response: "Photosynthesis is like cooking with sunlight. Plants use sunlight, water, and air to make their own food, just like you might use ingredients to make a meal. For example, a tree's leaves capture sunlight and combine it with water from roots and carbon dioxide from air to create sugar for energy. This means plants can grow and survive without eating other organisms."`;
    }
    
    if (input.includes('summary') || input.includes('summarize')) {
      return `

EXAMPLE:
User: "Summarize the benefits of exercise"
Response: "Exercise strengthens muscles and improves cardiovascular health. It releases endorphins that boost mood and reduce stress. Regular physical activity helps maintain healthy weight and reduces disease risk."`;
    }
    
    if (input.includes('story') && input.includes('words')) {
      return `

EXAMPLE:
User: "Write a 50-word story about a robot"
Response: "The rusty robot sat alone in the junkyard, remembering its days of helping humans. When a child wandered in, the robot's eyes lit up. It offered a flower made from scrap metal. The child smiled, and the robot felt purpose again. Sometimes friendship is the best repair."`;
    }
    
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    currentAssistantContent.current = ''; // Reset content ref

    try {
      // Get dynamic system message and examples
      const systemMessage = getAdvancedSystemMessage(input);
      const fewShotExamples = getFewShotExamples(input);
      const fullSystemMessage = systemMessage + fewShotExamples;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          developer_message: fullSystemMessage,
          user_message: input,
          model: 'gpt-4o-mini'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const assistantMessage: Message = {
        role: 'assistant',
        content: '',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Fixed streaming logic to prevent duplication
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        if (chunk.trim()) { // Only process non-empty chunks
          currentAssistantContent.current += chunk;
          
          setMessages(prev => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage.role === 'assistant') {
              lastMessage.content = currentAssistantContent.current;
            }
            return newMessages;
          });
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        role: 'system',
        content: 'ERROR: Connection failed. Please ensure the backend is running and accessible.',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  return (
    <div className="min-h-screen bg-fallout-black text-fallout-green font-terminal relative overflow-hidden">
      {/* Scanline effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="scanline absolute w-full h-1 bg-fallout-green opacity-20"></div>
      </div>

      {/* Main terminal container */}
      <div className="relative z-10 flex flex-col h-screen p-4">
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold text-shadow-fallout-strong animate-glow">
            FLEWIAN ANALYSIS TERMINAL
          </h1>
          <p className="text-sm text-shadow-fallout">
            Conceptual Analysis Engine - Ordinary Language Philosophy
          </p>
          {documentLoaded && (
            <p className="text-xs text-fallout-green-glow mt-1">
              📄 Document Loaded: {documentName}
            </p>
          )}
        </div>

        {/* File Upload Section */}
        <div className="mb-4 p-4 border border-fallout-green rounded-lg box-shadow-fallout bg-fallout-terminal-black">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="text-fallout-green-glow text-shadow-fallout-strong animate-glow">📁</span>
              <span className="text-shadow-fallout font-bold">DOCUMENT UPLOAD</span>
            </div>
            <div className="flex items-center space-x-2">
              {/* READY indicator removed as per user request */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
                             <button
                 onClick={() => fileInputRef.current?.click()}
                 disabled={uploading}
                 className={`
                   relative group px-6 py-3 border-2 rounded-lg font-terminal font-bold text-base
                   bg-fallout-terminal-black transition-all duration-300 ease-in-out transform
                   ${uploading 
                     ? 'border-fallout-green/50 text-fallout-green/50 cursor-not-allowed' 
                     : 'border-fallout-green text-fallout-green hover:border-fallout-green-glow hover:text-fallout-green-glow hover:scale-105 active:scale-95'
                   }
                   ${uploading ? '' : 'hover:box-shadow-fallout-strong hover:bg-fallout-green/5'}
                 `}
               >
                 {/* Background glow effect */}
                 {!uploading && (
                   <div className="absolute inset-0 rounded-lg bg-fallout-green/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                 )}
                
                                 {/* Button content */}
                 <div className="relative flex items-center space-x-2">
                   {uploading && (
                     <span className="text-lg animate-spin">
                       ⟳
                     </span>
                   )}
                   <span className={`font-bold tracking-wide ${uploading ? 'animate-pulse' : ''}`} style={{
                     textShadow: 'none',
                     color: uploading ? '#39FF14' : '#39FF14',
                     filter: 'brightness(1.1) contrast(1.2)'
                   }}>
                     {uploading ? 'PROCESSING...' : 'UPLOAD PDF'}
                   </span>
                 </div>
                
                {/* Loading animation */}
                {uploading && (
                  <div className="absolute inset-0 rounded-lg border-2 border-fallout-green/30 animate-pulse"></div>
                )}
              </button>
            </div>
          </div>
          
          {/* Status message */}
          <div className="text-xs text-shadow-fallout">
            {documentLoaded ? (
              <div className="flex items-center space-x-2 text-fallout-green-glow">
                <span>✅</span>
                <span>Document loaded successfully - RAG functionality enabled</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 opacity-70">
                <span>⚠️</span>
                <span>Upload a PDF document to enable RAG functionality</span>
              </div>
            )}
          </div>
        </div>

        {/* Messages container with integrated input */}
        <div className="flex-1 overflow-y-auto mb-4 p-4 border border-fallout-green rounded box-shadow-fallout bg-fallout-terminal-black font-terminal">
          <div className="space-y-2">
            {messages.map((message, index) => (
              <div key={index} className="text-shadow-fallout">
                {message.role === 'system' && (
                  <div className="text-fallout-green-glow">
                    <span className="text-xs opacity-70">[{formatTimestamp(message.timestamp)}]</span>
                    <span className="ml-2">{message.content}</span>
                  </div>
                )}
                {message.role === 'user' && (
                  <div className="text-fallout-green">
                    <span className="text-xs opacity-70">[{formatTimestamp(message.timestamp)}]</span>
                    <span className="ml-2 font-bold">USER:</span>
                    <span className="ml-2">{message.content}</span>
                  </div>
                )}
                {message.role === 'assistant' && (
                  <div className="text-fallout-green-glow">
                    <span className="text-xs opacity-70">[{formatTimestamp(message.timestamp)}]</span>
                    <span className="ml-2 font-bold">ASSISTANT:</span>
                    <span className="ml-2">{message.content}</span>
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="text-fallout-green-glow animate-pulse">
                <span className="text-xs opacity-70">[{formatTimestamp(new Date())}]</span>
                <span className="ml-2 font-bold">SYSTEM:</span>
                <span className="ml-2">Processing...</span>
              </div>
            )}
            
            {/* Terminal input line */}
            <form onSubmit={handleSubmit} className="flex items-center mt-4 font-terminal">
              <span className="text-fallout-green text-shadow-fallout mr-2">&gt;</span>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                className="flex-1 bg-transparent border-none outline-none text-fallout-green text-shadow-fallout font-terminal selection:bg-fallout-green/20"
                style={{
                  color: '#39FF14',
                  fontSize: '1.3rem',
                  caretColor: '#39FF14',
                  minWidth: 0,
                  width: '100%',
                  padding: 0,
                  margin: 0,
                }}
                autoFocus
              />
            </form>
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-4 text-xs text-shadow-fallout opacity-70">
          <p>Press ENTER to send message | Upload PDF to enable RAG | ESC to exit</p>
        </div>
      </div>
    </div>
  );
}
