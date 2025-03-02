import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, Mic, Camera, X, Send, Loader } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

// API key for Gemini
const API_KEY = "YOUR_GEMINI_API_KEY";

interface Message {
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export function ContextualAssistant() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const current = event.resultIndex;
        const result = event.results[current];
        const transcriptValue = result[0].transcript;
        setTranscript(transcriptValue);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        if (transcript) {
          setInputText(transcript);
        }
      };
    }

    // Add welcome message when chat is first opened
    if (messages.length === 0) {
      setMessages([
        {
          text: "Hello! I'm your AI travel assistant. How can I help you with your journey today?",
          isUser: false,
          timestamp: new Date()
        }
      ]);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onend = null;
        if (isListening) {
          try {
            recognitionRef.current.stop();
          } catch (e) {
            console.error('Error stopping speech recognition:', e);
          }
        }
      }
    };
  }, [isListening, transcript]);

  const generateResponse = async (prompt: string) => {
    try {
      // Use Gemini API to generate a response
      const response = await axios.post(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
        {
          contents: [{
            parts: [{
              text: `You are a helpful travel assistant. The user is using a travel app called GeoGuide AI. 
                    Respond to the following query in a helpful, concise way with travel advice: ${prompt}`
            }]
          }]
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': API_KEY
          }
        }
      );

      if (response.data && response.data.candidates && response.data.candidates.length > 0) {
        return response.data.candidates[0].content.parts[0].text;
      }
      
      // Fallback responses if API call fails or returns empty
      const fallbackResponses = [
        "I found several interesting attractions nearby. Would you like me to show them on the map?",
        "Based on your location, I recommend visiting the local museum which is highly rated by travelers.",
        "The weather looks great for outdoor activities today! Would you like some hiking trail recommendations?",
        "There's a popular local restaurant just 2 kilometers from your location. They're known for their authentic cuisine.",
        "I notice you're in a historic district. There are several architectural landmarks within walking distance."
      ];
      
      return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    } catch (error) {
      console.error('Error generating response:', error);
      
      // Fallback responses if API call fails
      const fallbackResponses = [
        "I found several interesting attractions nearby. Would you like me to show them on the map?",
        "Based on your location, I recommend visiting the local museum which is highly rated by travelers.",
        "The weather looks great for outdoor activities today! Would you like some hiking trail recommendations?",
        "There's a popular local restaurant just 2 kilometers from your location. They're known for their authentic cuisine.",
        "I notice you're in a historic district. There are several architectural landmarks within walking distance."
      ];
      
      return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      text: inputText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);

    try {
      const response = await generateResponse(inputText);
      const aiMessage: Message = {
        text: response,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        text: "I'm sorry, I'm having trouble connecting right now. Please try again later.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleVoiceInput = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
    } else {
      setTranscript("");
      setIsListening(true);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (error) {
          console.error('Error starting speech recognition:', error);
          simulateVoiceRecognition();
        }
      } else {
        simulateVoiceRecognition();
      }
    }
  };

  const simulateVoiceRecognition = () => {
    setIsListening(true);
    
    // Simulate voice recognition
    setTimeout(() => {
      const simulatedPhrases = [
        "What are the best attractions nearby?",
        "Can you recommend some local restaurants?",
        "What's the weather like today?",
        "How do I get to the nearest museum?",
        "Tell me about the history of this area"
      ];
      
      const result = simulatedPhrases[Math.floor(Math.random() * simulatedPhrases.length)];
      setTranscript(result);
      
      // Auto-stop after a few seconds
      setTimeout(() => {
        setIsListening(false);
        setInputText(result);
      }, 1500);
    }, 2000);
  };

  return (
    <div className="fixed bottom-8 left-8 z-[1000]">
      <div
        className={`bg-black/40 backdrop-blur-lg rounded-2xl border border-white/20 shadow-lg transition-all duration-300 overflow-hidden ${
          isExpanded ? "w-80 h-[500px]" : "w-12"
        }`}
      >
        {isExpanded && (
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-white/10 flex justify-between items-center">
              <p className="text-white/70 text-sm">AI Travel Assistant</p>
              <button
                onClick={() => setIsExpanded(false)}
                className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-white/70" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-xl p-3 ${
                      message.isUser
                        ? "bg-blue-500/30 text-white"
                        : "bg-white/10 text-white/90"
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/10 rounded-xl p-3 max-w-[80%]">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                      <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-white/10">
              <div className="relative">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything..."
                  className="w-full px-4 py-2 bg-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                  rows={1}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-2">
                  <button
                    onClick={handleSendMessage}
                    disabled={isLoading || !inputText.trim()}
                    className="p-1.5 hover:bg-white/10 rounded-full transition-colors disabled:opacity-50"
                  >
                    <Send className="w-4 h-4 text-white/70" />
                  </button>
                  <button 
                    onClick={handleVoiceInput}
                    className={`p-1.5 hover:bg-white/10 rounded-full transition-colors ${
                      isListening ? 'text-red-400' : 'text-white/70'
                    }`}
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                  <button className="p-1.5 hover:bg-white/10 rounded-full transition-colors">
                    <Camera className="w-4 h-4 text-white/70" />
                  </button>
                </div>
                
                {isListening && (
                  <div className="absolute -top-10 left-0 right-0 bg-black/60 backdrop-blur-sm rounded-lg p-2 text-center">
                    <p className="text-white text-xs">{transcript || "Listening..."}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Toggle Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-3 flex items-center justify-center hover:bg-white/10 transition-colors rounded-2xl w-full"
          aria-label="Toggle Assistant"
        >
          <MessageSquare className="w-6 h-6 text-blue-400 transition-transform duration-300" />
        </button>
      </div>
    </div>
  );
}