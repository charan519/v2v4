import axios from 'axios';

// API key for Gemini - in production, this should be secured through environment variables
const GEMINI_API_KEY = "AIzaSyDJvQSRzOPFj-3TOLgYgbT8PFMQUkBN1xo";

/**
 * Generate an AI-powered travel itinerary using Google's Gemini API
 * @param destination The destination for the itinerary
 * @param days Number of days for the trip
 * @param preferences User preferences (e.g., "family-friendly", "outdoor activities")
 * @returns The generated itinerary text
 */
export async function generateAIItinerary(destination: string, days: number, preferences: string): Promise<string> {
  try {
    // Check if API key is valid
    if (!GEMINI_API_KEY || GEMINI_API_KEY === "YOUR_GEMINI_API_KEY") {
      console.log("Using mock itinerary due to missing API key");
      return formatMockItinerary(destination, days, preferences);
    }

    const response = await axios.post(
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
  {
    contents: [{
      role: "user",  // This field is required!
      parts: [{
        text: `You are an expert travel planner. Create a highly detailed and personalized travel itinerary for ${destination} for ${days} days. 
  - Preferences: ${preferences}  
  - Include: Famous attractions, hidden gems, cultural experiences, and food recommendations.  
  - Adjust recommendations based on seasonality and peak travel hours.  
  - Highlight the best times to visit each location to avoid crowds.  
  - Specify travel time between locations.  
  - Avoid repeating common recommendations unless they are must-see spots.  
  - Format the response in Markdown with:  
    - # for title  
    - ## for day headers  
    - **Bold for time and important details**  
    - Locations with addresses in (parentheses)  
    - Notes at the end with travel tips, expected costs, and best transportation options.`

      }]
    }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2048
    }
  },
  {
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': GEMINI_API_KEY
    },
    timeout: 15000
  }
);

    

    if (response.data && response.data.candidates && response.data.candidates.length > 0) {
      return response.data.candidates[0].content.parts[0].text;
    } else {
      console.log("No valid response from Gemini API, using mock itinerary");
      return formatMockItinerary(destination, days, preferences);
    }
  } catch (error) {
  if (axios.isAxiosError(error)) {
    console.error('API request error:', JSON.stringify(error.response?.data, null, 2));
  } else {
    console.error('Unexpected error:', error);
  }
}


}

/**
 * Format a mock itinerary when the API call fails
 */
function formatMockItinerary(destination: string, days: number, preferences: string): string {
  return `# ${destination} Itinerary - ${days} Day${days > 1 ? 's' : ''}

## Day 1
- **8:00 AM**: Breakfast at Central Café (Downtown ${destination})
- **9:30 AM**: Visit the main attractions in ${destination} (${destination} City Center)
- **12:30 PM**: Lunch at Local Flavors Restaurant (123 Main Street)
- **2:00 PM**: Explore museums and cultural sites (Cultural District)
- **6:00 PM**: Dinner with local cuisine at Authentic Kitchen (456 Harbor View)
- **8:00 PM**: Evening walk or entertainment (Waterfront Promenade)

${days > 1 ? `
## Day 2
- **8:30 AM**: Morning coffee and pastries at Morning Brew (78 Sunrise Avenue)
- **10:00 AM**: Outdoor activities${preferences.includes('outdoor') ? ' - hiking at Nature Trail Park (3 miles north of downtown)' : ' - City Gardens Tour (Botanical Gardens)'}
- **1:00 PM**: Lunch at Trendy Bites (Fashion District)
- **3:00 PM**: Shopping or relaxation time (Market Square)
- **7:00 PM**: Dinner at Gourmet Heights Restaurant (Skyline Tower, 20th floor)
- **9:00 PM**: Nightlife or relaxing evening${preferences.includes('family') ? ' with family at Starlight Plaza' : ' at Jazz & Blues Club (Entertainment District)'}
` : ''}

${days > 2 ? `
## Day 3
- **9:00 AM**: Leisurely breakfast at Sunrise Café (Beachfront)
- **10:30 AM**: Day trip to nearby ${destination} Falls (15 miles east of city center)
- **1:30 PM**: Picnic lunch at Scenic Viewpoint or local eatery (Countryside)
- **3:30 PM**: Visit to Hidden Gems Museum (Old Town district)
- **6:30 PM**: Farewell dinner at Sunset Restaurant (Hilltop Drive)
- **8:30 PM**: Final evening activities at Moonlight Square
` : ''}

**Notes:**
- This itinerary is customized based on your preferences: ${preferences}
- All times are approximate and can be adjusted
- Transportation options include: public transit, walking, or rental car
- Best time to visit most attractions is weekday mornings to avoid crowds
- Consider purchasing a city pass for multiple attractions
`;
}

/**
 * Generate AI recommendations for places to visit based on user preferences
 * @param location Current location coordinates [lat, lon]
 * @param preferences User preferences
 * @returns List of recommended places with descriptions
 */
export async function generatePlaceRecommendations(
  location: [number, number], 
  preferences: string
): Promise<any[]> {
  try {
    // Check if API key is valid
    if (!GEMINI_API_KEY || GEMINI_API_KEY === "YOUR_GEMINI_API_KEY") {
      console.log("Using mock recommendations due to missing API key");
      return [];
    }

    const [lat, lon] = location;
    
    const response = await axios.post(
      'https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent',
      {
        contents: [{
          parts: [{
            text: `Based on the location coordinates (${lat}, ${lon}), suggest 5 interesting places to visit nearby. 
                  Consider preferences: ${preferences}.
                  Return the response as a JSON array with each place having: name, description, category, and estimated distance.`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': GEMINI_API_KEY
        },
        timeout: 10000 // 10 second timeout
      }
    );

    if (response.data && response.data.candidates && response.data.candidates.length > 0) {
      const text = response.data.candidates[0].content.parts[0].text;
      
      // Extract JSON from the response text
      const jsonMatch = text.match(/\[\s*\{.*\}\s*\]/s);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0]);
        } catch (e) {
          console.error('Error parsing JSON from AI response:', e instanceof Error ? e.message : String(e));
          return [];
        }
      }
    }
    
    return [];
  } catch (error) {
    console.error('Error generating place recommendations:', error instanceof Error ? error.message : String(error));
    return [];
  }
}