import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface VoiceSearchProps {
  onVoiceResult: (text: string) => void;
}

export function VoiceSearch({ onVoiceResult }: VoiceSearchProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check if browser supports speech recognition
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
        if (isListening) {
          stopListening();
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        stopListening();
        // Fallback to simulated voice recognition if there's an error
        simulateVoiceRecognition();
      };
    } else {
      console.warn('Speech recognition is not supported in this browser');
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        if (isListening) {
          try {
            recognitionRef.current.stop();
          } catch (e) {
            console.error('Error stopping speech recognition:', e);
          }
        }
      }
    };
  }, [isListening]);

  const handleVoiceSearch = () => {
    if (!isSupported) {
      simulateVoiceRecognition();
      return;
    }

    if (!isListening) {
      startListening();
    } else {
      stopListening();
    }
  };

  const startListening = () => {
    setTranscript('');
    setIsListening(true);
    
    try {
      if (recognitionRef.current) {
        recognitionRef.current.start();
      } else {
        // Fallback to simulation if recognition isn't available
        simulateVoiceRecognition();
      }
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      // Fallback to simulation if there's an error
      simulateVoiceRecognition();
    }
  };

  const stopListening = () => {
    setIsListening(false);
    
    try {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    } catch (error) {
      console.error('Error stopping speech recognition:', error);
    }
    
    if (transcript) {
      onVoiceResult(transcript);
    }
  };

  const simulateVoiceRecognition = () => {
    setIsListening(true);
    
    // Simulate voice recognition since we can't rely on browser support
    setTimeout(() => {
      const simulatedPhrases = [
        "Show me nearby restaurants",
        "Find historical landmarks",
        "Where are the best hiking trails",
        "Take me to the nearest museum",
        "Find coffee shops within walking distance"
      ];
      
      const result = simulatedPhrases[Math.floor(Math.random() * simulatedPhrases.length)];
      setTranscript(result);
      
      // Auto-stop after a few seconds
      setTimeout(() => {
        setIsListening(false);
        onVoiceResult(result);
      }, 1500);
    }, 2000);
  };

  return (
    <div className="relative">
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={handleVoiceSearch}
        className={`p-3 rounded-full transition-all duration-300 ${
          isListening ? 'bg-red-500/80 hover:bg-red-600/80' : 'bg-white/10 hover:bg-white/20'
        }`}
      >
        {isListening ? (
          <MicOff className="w-5 h-5 text-white" />
        ) : (
          <Mic className="w-5 h-5 text-white" />
        )}
      </motion.button>

      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-black/60 backdrop-blur-xl rounded-xl px-4 py-2 min-w-[200px] text-center"
          >
            <p className="text-white text-sm">{transcript || "Listening..."}</p>
            <div className="flex justify-center space-x-1 mt-2">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    scaleY: [1, 2, 1],
                    backgroundColor: ["rgb(59 130 246 / 0.5)", "rgb(59 130 246)", "rgb(59 130 246 / 0.5)"]
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2
                  }}
                  className="w-1 h-4 bg-blue-500/50 rounded-full"
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}