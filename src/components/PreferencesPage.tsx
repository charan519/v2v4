import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Compass, ArrowRight, X, Check, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { updateUserPreferences } from '../utils/supabaseClient';
import { useAuth } from '../context/AuthContext';

interface Question {
  id: number;
  text: string;
  options: {
    id: string;
    text: string;
    emoji: string;
  }[];
}

export function PreferencesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const questions: Question[] = [
    {
      id: 1,
      text: "What's your ideal travel destination?",
      options: [
        { id: 'A', text: 'Mountains', emoji: '⛰️' },
        { id: 'B', text: 'Beaches', emoji: '🏖️' },
        { id: 'C', text: 'Cities', emoji: '🏙️' },
        { id: 'D', text: 'Countryside', emoji: '🌾' },
      ],
    },
    {
      id: 2,
      text: "How do you like to plan your trips?",
      options: [
        { id: 'A', text: 'No plans, just go with the flow', emoji: '🎒' },
        { id: 'B', text: 'A rough idea, but flexible', emoji: '📍' },
        { id: 'C', text: 'Well-planned with an itinerary', emoji: '📅' },
        { id: 'D', text: 'Fully guided tours', emoji: '🎤' },
      ],
    },
    {
      id: 3,
      text: "What's your favorite way to explore?",
      options: [
        { id: 'A', text: 'Walking', emoji: '🚶‍♂️' },
        { id: 'B', text: 'Biking', emoji: '🚲' },
        { id: 'C', text: 'Driving', emoji: '🚗' },
        { id: 'D', text: 'Public transport', emoji: '🚆' },
      ],
    },
    {
      id: 4,
      text: "What's your top priority while traveling?",
      options: [
        { id: 'A', text: 'Adventure & thrills', emoji: '🎢' },
        { id: 'B', text: 'Relaxation & comfort', emoji: '🛀' },
        { id: 'C', text: 'Culture & history', emoji: '🏛️' },
        { id: 'D', text: 'Food & local experiences', emoji: '🍜' },
      ],
    },
    {
      id: 5,
      text: "Who do you prefer to travel with?",
      options: [
        { id: 'A', text: 'Solo', emoji: '✈️' },
        { id: 'B', text: 'Partner', emoji: '❤️' },
        { id: 'C', text: 'Friends', emoji: '👫' },
        { id: 'D', text: 'Family', emoji: '👨‍👩‍👧‍👦' },
      ],
    },
  ];

  const handleSelectOption = (questionId: number, optionId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));

    // If this is the last question, mark as completed
    if (questionId === questions.length) {
      setIsCompleted(true);
    } else {
      // Move to the next question
      setCurrentQuestion((prev) => prev + 1);
    }
  };

  const handleComplete = async () => {
    if (!user) {
      setError("You must be logged in to save preferences");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Format the answers with question text for better context
      const formattedPreferences = Object.entries(answers).reduce((acc, [questionId, answerId]) => {
        const question = questions.find(q => q.id === parseInt(questionId));
        if (!question) return acc;
        
        const option = question.options.find(o => o.id === answerId);
        if (!option) return acc;
        
        return {
          ...acc,
          [question.text]: {
            answer: option.text,
            optionId: answerId
          }
        };
      }, {});

      console.log("Saving preferences for user:", user.id);
      console.log("Preferences data:", formattedPreferences);

      // Save preferences to Supabase
      const { error: updateError } = await updateUserPreferences(user.id, formattedPreferences);
      
      if (updateError) {
        console.error("Supabase update error:", updateError);
        throw new Error(updateError.message || "Failed to save preferences");
      }
      
      // Navigate to the recommendations page
      navigate('/recommendations');
    } catch (err) {
      console.error('Error saving preferences:', err);
      setError(err instanceof Error ? err.message : 'Failed to save preferences. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Check if all questions have been answered
  const allQuestionsAnswered = Object.keys(answers).length === questions.length;

  const currentQuestionData = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 flex flex-col">
      {/* Header */}
      <header className="relative z-10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <Compass className="w-8 h-8 text-blue-400 mr-2" />
          <h1 className="text-2xl font-bold text-white">GeoGuide AI</h1>
        </div>
        <button
          onClick={() => navigate('/')}
          className="p-2 rounded-full hover:bg-white/10 transition-all duration-300"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-2xl bg-black/30 backdrop-blur-xl rounded-3xl border border-white/20 overflow-hidden p-8"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">
              Tell Us About Your Travel Style
            </h2>
            <p className="text-white/70">
              Help us personalize your experience by answering a few questions
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Progress bar */}
          <div className="w-full h-2 bg-white/10 rounded-full mb-8">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-blue-500 rounded-full"
            />
          </div>

          {currentQuestion < questions.length ? (
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-6"
            >
              <h3 className="text-xl font-semibold text-white">
                {currentQuestionData.text}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentQuestionData.options.map((option) => (
                  <motion.button
                    key={option.id}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelectOption(currentQuestionData.id, option.id)}
                    className={`p-4 rounded-xl border text-left transition-all duration-300 flex items-center space-x-4 ${
                      answers[currentQuestionData.id] === option.id
                        ? 'bg-blue-500/30 border-blue-500/50'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-2xl">
                      {option.emoji}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-white font-medium">{option.text}</span>
                        {answers[currentQuestionData.id] === option.id && (
                          <Check className="w-5 h-5 text-blue-400" />
                        )}
                      </div>
                      <span className="text-white/50 text-sm">Option {option.id}</span>
                    </div>
                  </motion.button>
                ))}
              </div>

              <div className="flex justify-between items-center pt-4">
                <button
                  onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
                  disabled={currentQuestion === 0}
                  className="px-4 py-2 bg-white/10 rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Back
                </button>
                <span className="text-white/70">
                  Question {currentQuestion + 1} of {questions.length}
                </span>
                {currentQuestion === questions.length - 1 && allQuestionsAnswered ? (
                  <button
                    onClick={handleComplete}
                    className="px-4 py-2 bg-blue-500/50 hover:bg-blue-500/70 rounded-xl text-white transition-colors"
                  >
                    Submit
                  </button>
                ) : (
                  <button
                    onClick={() => setCurrentQuestion((prev) => Math.min(questions.length - 1, prev + 1))}
                    disabled={!answers[currentQuestionData.id] || currentQuestion === questions.length - 1}
                    className="px-4 py-2 bg-white/10 rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Skip
                  </button>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center space-y-6"
            >
              <div className="w-20 h-20 bg-green-500/30 rounded-full flex items-center justify-center mx-auto">
                <Check className="w-10 h-10 text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-white">All Done!</h3>
              <p className="text-white/70">
                Thanks for sharing your preferences. We'll use this information to personalize your experience.
              </p>
              <button
                onClick={handleComplete}
                disabled={isLoading}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl text-white font-medium flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transition-all duration-300 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Start Exploring</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}