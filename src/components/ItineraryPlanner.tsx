import React, { useState } from 'react';
import { X, Globe, Sparkles, Loader } from 'lucide-react';
import { motion } from 'framer-motion';

interface Place {
  id: string;
  name: string;
  description?: string;
  location: {
    lat: number;
    lon: number;
  };
  distance?: number;
  category?: string;
  image?: string;
}

interface ItineraryPlannerProps {
  onClose: () => void;
  places: Place[];
  userLocation: [number, number] | null;
  onGenerateAI?: (destination: string, days: number, preferences: string) => void;
  isLoading?: boolean;
}

export function ItineraryPlanner({ 
  onClose, 
  places, 
  userLocation, 
  onGenerateAI,
  isLoading = false
}: ItineraryPlannerProps) {
  const [destination, setDestination] = useState('');
  const [numDays, setNumDays] = useState(1);
  const [preferences, setPreferences] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleGenerateAIItinerary = () => {
    // Validate inputs
    if (!destination.trim()) {
      setError("Please enter a destination");
      return;
    }
    
    if (numDays < 1 || numDays > 14) {
      setError("Please enter a valid number of days (1-14)");
      return;
    }
    
    setError(null);
    
    if (onGenerateAI && destination && numDays > 0) {
      onGenerateAI(destination, numDays, preferences);
    }
  };

  // Suggested preferences for better results
  const suggestionChips = [
    "family-friendly", 
    "outdoor activities", 
    "historical sites", 
    "foodie experiences", 
    "budget-conscious",
    "luxury",
    "cultural immersion",
    "adventure",
    "relaxation"
  ];

  const addPreference = (pref: string) => {
    if (preferences.includes(pref)) {
      // Remove if already included
      setPreferences(preferences.split(',')
        .map(p => p.trim())
        .filter(p => p !== pref)
        .join(', '));
    } else {
      // Add if not already included
      setPreferences(preferences ? `${preferences}, ${pref}` : pref);
    }
  };

  return (
    <div className="absolute top-20 right-8 z-[1000] w-96 max-h-[calc(100vh-160px)] bg-black/30 backdrop-blur-xl rounded-3xl border border-white/20 overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">AI Itinerary Planner</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 transition-all duration-300"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(100vh-280px)] pr-2">
          <motion.div
            key="ai-planner"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white/5 rounded-xl p-4 mb-4">
              <div className="flex items-center space-x-2 mb-4">
                <Sparkles className="w-5 h-5 text-blue-400" />
                <h3 className="text-white font-medium">AI Itinerary Generator</h3>
              </div>
              
              {error && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <label className="text-white/70 text-sm block mb-2">Destination</label>
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="e.g., San Francisco, Paris, Tokyo"
                    className="w-full bg-white/10 border border-white/20 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
                
                <div>
                  <label className="text-white/70 text-sm block mb-2">Number of Days</label>
                  <input
                    type="number"
                    min="1"
                    max="14"
                    value={numDays}
                    onChange={(e) => setNumDays(parseInt(e.target.value) || 1)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
                
                <div>
                  <label className="text-white/70 text-sm block mb-2">Preferences</label>
                  <textarea
                    value={preferences}
                    onChange={(e) => setPreferences(e.target.value)}
                    placeholder="e.g., family-friendly, outdoor activities, historical sites, foodie experiences, budget-conscious"
                    rows={3}
                    className="w-full bg-white/10 border border-white/20 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                  />
                  
                  <div className="mt-2 flex flex-wrap gap-2">
                    {suggestionChips.map((pref) => (
                      <button
                        key={pref}
                        onClick={() => addPreference(pref)}
                        className={`px-2 py-1 rounded-full text-xs ${
                          preferences.includes(pref)
                            ? 'bg-blue-500/50 text-white'
                            : 'bg-white/10 text-white/70 hover:bg-white/20'
                        } transition-colors`}
                      >
                        {pref}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleGenerateAIItinerary}
              disabled={isLoading || !destination || numDays < 1}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white font-medium transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg"
            >
              {isLoading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Generating Itinerary...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Generate AI Itinerary</span>
                </>
              )}
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}