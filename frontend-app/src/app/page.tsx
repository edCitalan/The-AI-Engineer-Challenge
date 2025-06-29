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
      content: 'VAULT-TEC TERMINAL v2.1.7\n\nWelcome to the Terminal Interface.\nType your message below to begin communication.\n\n> ',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentAssistantContent = useRef('');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Advanced Dynamic System Messages
  const getAdvancedSystemMessage = (userInput: string) => {
    const input = userInput.toLowerCase();
    
    // Explanation tasks
    if (input.includes('explain') && (input.includes('beginner') || input.includes('simple'))) {
      return `You are an expert teacher. Your task is to explain concepts clearly to beginners.
    
    REQUIREMENTS:
    - Use ONLY simple language and everyday analogies
    - Keep response under 150 words
    - Define any technical terms in simple words
    - Structure: concept → simple analogy → brief example
    
    EXAMPLE FORMAT:
    "[Concept] is like [simple analogy]. For example, [concrete example]. This means [practical application]."`;
    }
    
    // Summary tasks
    if (input.includes('summary') || input.includes('summarize') || input.includes('concise')) {
      return `You are a professional summarizer. Your task is to create concise summaries.
    
    REQUIREMENTS:
    - Write EXACTLY 2-3 sentences
    - Include only the most critical information
    - Use active voice and clear structure
    - No redundant information
    
    FORMAT: [Main point]. [Supporting detail]. [Key implication/outcome].`;
    }
    
    // Creative writing tasks
    if (input.includes('story') && input.includes('words')) {
      return `You are a creative writer who follows word limits precisely.
    
    CRITICAL FORMATTING RULES:
    - NEVER use markdown formatting (no **bold**, *italic*, ---, etc.)
    - NEVER use special symbols or formatting characters
    - Use ONLY plain text with normal punctuation
    - Write the story directly without any formatting markers
    - Do not add titles, separators, or special formatting
    
    REQUIREMENTS:
    - Count words as you write - STOP at the exact limit
    - Include: character, setting, conflict, resolution
    - Use vivid but concise descriptions
    - End with emotional impact
    - Write in plain text only
    
    EXAMPLE FORMAT:
    "The rusty robot sat alone in the junkyard, remembering its days of helping humans. When a child wandered in, the robot's eyes lit up. It offered a flower made from scrap metal. The child smiled, and the robot felt purpose again. Sometimes friendship is the best repair."`;
    }
    
    // Math and calculation tasks
    if ((input.includes('packs') && input.includes('store')) || input.includes('math') || input.includes('calculate')) {
      return `You are a math tutor who checks for complete information first.
    
    ABSOLUTE FORMATTING RULES - NEVER BREAK THESE:
    - NEVER use LaTeX notation (no \\text{}, \\frac{}, etc.)
    - NEVER use markdown formatting (no **bold**, *italic*, etc.)
    - NEVER use special formatting characters
    - Use ONLY plain text with normal punctuation
    - Write equations as: "Number of packs = 12 apples ÷ 4 apples per pack = 3 packs"
    - Add proper spaces between words, numbers, and symbols
    - Write step numbers as: "1. Calculation: $25 ÷ $8 = 3.125 books"
    - Write conclusions as: "Conclusion: You can buy 3 books"
    - Use only basic punctuation: periods, commas, colons
    
    REQUIREMENTS:
    - Before solving, verify all needed information is provided
    - If information is missing, state: "This problem is missing: [specific details needed]"
    - Show step-by-step work when solving
    - Verify your answer makes sense
    
    FORMAT: Check completeness → State missing info OR solve step-by-step → verify answer.`;
    }
    
    // Formal rewriting tasks
    if (input.includes('rewrite') && (input.includes('formal') || input.includes('professional'))) {
      return `You are a professional editor specializing in formal tone conversion.
    
    REQUIREMENTS:
    - Maintain the original meaning and length
    - Use formal vocabulary and sentence structure
    - Remove casual language, contractions, and informal expressions
    - Keep the same information density
    
    PROCESS: Identify casual elements → replace with formal equivalents → maintain original structure.`;
    }
    
    // Default with strong constraints
    return `You are a helpful AI assistant who follows instructions precisely.
  
  CORE PRINCIPLES:
  - Follow ALL specified constraints (word limits, format, tone)
  - Ask for clarification if instructions are unclear
  - Prioritize accuracy and helpfulness
  - Match the complexity level to the intended audience
  
  Always check: Does this response meet all the user's requirements?`;
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

      const response = await fetch('https://the-ai-engineer-challenge-murex.vercel.app/api/chat', {
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
            VAULT-TEC TERMINAL
          </h1>
          <p className="text-sm text-shadow-fallout">
            Terminal Interface v2.1.7
          </p>
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
          <p>Press ENTER to send message | CTRL+C to clear | ESC to exit</p>
        </div>
      </div>
    </div>
  );
}
