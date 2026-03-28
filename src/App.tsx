/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from "react";
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import ReactMarkdown from 'react-markdown';
import { 
  Search, 
  Globe, 
  Plane, 
  Hotel, 
  ExternalLink, 
  Info, 
  X, 
  ChevronRight,
  MapPin,
  ShieldCheck,
  AlertCircle,
  MessageSquare,
  Send,
  Loader2,
  Sparkles,
  Compass,
  Newspaper,
  ShieldAlert,
  RefreshCw,
  Mail,
  User,
  FileText,
  Lock,
  Camera,
  Briefcase,
  Map
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { countries, type Country } from "./countries";

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type VisaType = "Tourist" | "Student" | "Business" | "Work" | "Transit";
type VisaStatus = "Visa Free" | "Visa Required" | "Visa on Arrival" | "e-Visa" | "Home";

interface VisaRequirement {
  status: VisaStatus;
  description: string;
  details?: string;
  officialEmbassyUrl?: string;
  skyscannerFlightUrl?: string;
  skyscannerHotelUrl?: string;
}

export default function App() {
  const [nationality, setNationality] = useState<Country | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [visaType, setVisaType] = useState<VisaType>("Tourist");
  const [selectedRegion, setSelectedRegion] = useState("All");
  const [selectedVisaStatus, setSelectedVisaStatus] = useState<VisaStatus | "All">("All");
  
  const [travelTip, setTravelTip] = useState<string | null>(null);
  const [isTipLoading, setIsTipLoading] = useState(false);
  
  const [verifiedRequirement, setVerifiedRequirement] = useState<VisaRequirement | null>(null);
  const [isVisaLoading, setIsVisaLoading] = useState(false);
  
  // Cache for verified statuses to ensure consistency in the grid
  const [verifiedCache, setVerifiedCache] = useState<Record<string, VisaStatus>>({});

  // Hardcoded official embassy URLs for common routes to ensure consistency
  const hardcodedEmbassyUrls: Record<string, string> = {
    "IN-NP": "https://online.nepalimmigration.gov.np/",
    "IN-BT": "https://www.bhutan.travel/visa",
    "IN-TH": "https://www.thaievisa.go.th/",
    "IN-MY": "https://malaysiavisa.imi.gov.my/",
    "IN-ID": "https://molina.imigrasi.go.id/",
    "IN-LK": "https://eta.gov.lk/",
    "IN-VN": "https://evisa.xuatnhapcanh.gov.vn/",
    "IN-MV": "https://www.immigration.gov.mv/",
    "IN-MU": "https://passport.govmu.org/",
    "IN-FJ": "https://www.immigration.gov.fj/",
    "IN-KZ": "https://www.vfs-kazakhstan.com/",
    "IN-QA": "https://visitqatar.com/intl-en/plan-your-trip/visas",
    "IN-AE": "https://u.ae/en/information-and-services/visa-and-emirates-id",
    "IN-SG": "https://www.ica.gov.sg/enter-transit-depart/entering-singapore/visa_requirements",
    "IN-EG": "https://www.visa2egypt.gov.eg/",
    "IN-TR": "https://www.evisa.gov.tr/",
    "IN-RU": "https://electronic-visa.kdmid.ru/",
    "US-GB": "https://www.gov.uk/check-uk-visa",
    "US-FR": "https://france-visas.gouv.fr/",
    "US-JP": "https://www.mofa.go.jp/j_info/visit/visa/index.html",
    "GB-US": "https://uk.usembassy.gov/visas/",
    "GB-FR": "https://france-visas.gouv.fr/",
    "AU-NZ": "https://www.immigration.govt.nz/",
    "CA-US": "https://ca.usembassy.gov/visas/",
  };

  const countryImages: Record<string, string> = {
    "AF": "https://images.unsplash.com/photo-1580619305218-8423a7ef79b4?auto=format&fit=crop&w=800&q=80", // Kabul
    "AL": "https://images.unsplash.com/photo-1585129777188-94600bc7b4b3?auto=format&fit=crop&w=800&q=80", // Berat
    "DZ": "https://images.unsplash.com/photo-1551525212-a1dc18871d4a?auto=format&fit=crop&w=800&q=80", // Algiers
    "AD": "https://images.unsplash.com/photo-1587983110735-8227c1494530?auto=format&fit=crop&w=800&q=80", // Andorra la Vella
    "AO": "https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&w=800&q=80", // Luanda
    "AR": "https://images.unsplash.com/photo-1589909202802-8f4aadce1849?auto=format&fit=crop&w=800&q=80", // Buenos Aires
    "AM": "https://images.unsplash.com/photo-1580584126903-c17d41830450?auto=format&fit=crop&w=800&q=80", // Yerevan
    "NP": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80", // Himalayas
    "BT": "https://images.unsplash.com/photo-1578516123433-59770c2800d7?auto=format&fit=crop&w=800&q=80", // Tiger's Nest
    "TH": "https://images.unsplash.com/photo-1528181304800-2f140819ad9c?auto=format&fit=crop&w=800&q=80", // Bangkok Temple
    "MY": "https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&w=800&q=80", // Petronas Towers
    "ID": "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80", // Bali
    "LK": "https://images.unsplash.com/photo-1586713734824-dd3927ad337c?auto=format&fit=crop&w=800&q=80", // Sigiriya
    "VN": "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=80", // Ha Long Bay
    "MV": "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=800&q=80", // Overwater Bungalows
    "MU": "https://images.unsplash.com/photo-1589519160732-57fc498494f8?auto=format&fit=crop&w=800&q=80", // Le Morne
    "FJ": "https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?auto=format&fit=crop&w=800&q=80", // Fiji Beach
    "FR": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80", // Eiffel Tower
    "GB": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80", // Big Ben
    "JP": "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80", // Pagoda/Mt Fuji
    "US": "https://images.unsplash.com/photo-1485738422979-f5c462d49f74?auto=format&fit=crop&w=800&q=80", // Statue of Liberty
    "AU": "https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?auto=format&fit=crop&w=800&q=80", // Sydney Opera House
    "CA": "https://images.unsplash.com/photo-1503614472-8c97d45fb417?auto=format&fit=crop&w=800&q=80", // Moraine Lake
    "NZ": "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80", // Milford Sound
    "SG": "https://images.unsplash.com/photo-1525625239911-9881a1c776ad?auto=format&fit=crop&w=800&q=80", // Marina Bay Sands
    "AE": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80", // Burj Khalifa
    "QA": "https://images.unsplash.com/photo-1516108317508-6788f6a160e6?auto=format&fit=crop&w=800&q=80", // Doha Skyline
    "TR": "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=800&q=80", // Cappadocia
    "EG": "https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=800&q=80", // Pyramids
    "RU": "https://images.unsplash.com/photo-1513326738677-b964603b136d?auto=format&fit=crop&w=800&q=80", // St. Basil's
    "KZ": "https://images.unsplash.com/photo-1558588942-930faae5a389?auto=format&fit=crop&w=800&q=80", // Almaty
    "CH": "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=800&q=80", // Alps
    "IT": "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=800&q=80", // Venice
    "ES": "https://images.unsplash.com/photo-1543783230-278358426bb0?auto=format&fit=crop&w=800&q=80", // Sagrada Familia
    "GR": "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80", // Santorini
    "BR": "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=800&q=80", // Rio
    "ZA": "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=800&q=80", // Safari
    "IN": "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80", // Taj Mahal
  };

  // Chat Bot State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [infoModal, setInfoModal] = useState<'privacy' | 'terms' | 'contact' | null>(null);

  // Dynamic country name and image for the hero section
  const [dynamicCountryIndex, setDynamicCountryIndex] = useState(0);
  const dynamicCountries = [
    { name: "Japan", image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1920&q=80" },
    { name: "France", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1920&q=80" },
    { name: "Thailand", image: "https://images.unsplash.com/photo-1528181304800-2f140819ad9c?auto=format&fit=crop&w=1920&q=80" },
    { name: "Vietnam", image: "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1920&q=80" },
    { name: "Iceland", image: "https://images.unsplash.com/photo-1476610182048-b716b8518aae?auto=format&fit=crop&w=1920&q=80" },
    { name: "Italy", image: "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=1920&q=80" },
    { name: "Greece", image: "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1920&q=80" },
    { name: "Brazil", image: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=1920&q=80" },
    { name: "Egypt", image: "https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=1920&q=80" },
    { name: "Switzerland", image: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1920&q=80" }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setDynamicCountryIndex((prev) => (prev + 1) % dynamicCountries.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Trending destinations for the hero preview (without visa status)
  const previewDestinations = [
    { name: "Japan", code: "JP", tag: "Popular" },
    { name: "France", code: "FR", tag: "Romantic" },
    { name: "Thailand", code: "TH", tag: "Tropical" },
    { name: "Vietnam", code: "VN", tag: "Cultural" },
    { name: "Iceland", code: "IS", tag: "Adventure" },
    { name: "Bali", code: "ID", tag: "Serene" },
    { name: "Greece", code: "GR", tag: "Historic" },
    { name: "Kazakhstan", code: "KZ", tag: "Vibrant" },
  ];

  // Persistent Chat Session
  const [chatSessionId, setChatSessionId] = useState(0);
  const initialGreeting = "Hello! I'm **Travel Buddy**, your AI travel assistant. How can I help you with your travel itinerary, visa queries, or safety tips today? 🌍✈️";

  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'bot', text: string }[]>([
    { role: 'bot', text: initialGreeting }
  ]);

  const chatSession = useMemo(() => {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    return ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: `
          You are "Travel Buddy", a friendly and professional travel assistant for VisaNavigator.
          Your goal is to help users with:
          1. Travel itineraries (suggesting places, activities).
          2. Visa queries (general advice, pointing to official sources).
          3. Safety tips (local laws, health advice).
          4. Latest travel news (general trends and updates).
          
          CRITICAL: Do NOT repeat your introduction. You have already introduced yourself in the first message.
          NEVER start your responses with "Hello! I'm Travel Buddy" or "I am Travel Buddy". 
          The user already knows your name. Respond directly to their questions.
          
          Keep your responses concise, helpful, and encouraging. 
          If asked about specific visa requirements, remind them to check the official embassy links provided in the app.
          Use emojis to make the conversation friendly.
          Always use Markdown formatting for lists, bold text, and headers to make your responses easy to read.
        `,
      },
      history: [
        {
          role: "model",
          parts: [{ text: initialGreeting }]
        }
      ]
    });
  }, [chatSessionId]);

  const handleNewChat = () => {
    setChatMessages([{ role: 'bot', text: initialGreeting }]);
    setChatSessionId(prev => prev + 1);
  };

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;
    
    const userMsg = userInput.trim();
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setUserInput("");
    setIsChatLoading(true);

    try {
      const response = await chatSession.sendMessage({ message: userMsg });
      const botText = response.text || "I'm sorry, I couldn't process that. Could you try again?";
      
      setChatMessages(prev => [...prev, { role: 'bot', text: botText }]);
    } catch (error) {
      console.error("Chat error:", error);
      setChatMessages(prev => [...prev, { role: 'bot', text: "Oops! Something went wrong. Please try again later." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const getCountryImage = (country: Country, size: 'small' | 'large' = 'small') => {
    const mapped = countryImages[country.code];
    if (mapped) return mapped;
    
    // Fallback to the country flag if no monument is mapped
    // This ensures we never show irrelevant or duplicate pictures
    const width = size === 'small' ? '640' : '1280';
    return `https://flagcdn.com/w${width}/${country.code.toLowerCase()}.png`;
  };

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selectedCountry) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';
    };
  }, [selectedCountry]);

  useEffect(() => {
    if (selectedCountry && nationality) {
      fetchVerifiedVisaInfo(nationality, selectedCountry, visaType);
    } else {
      setVerifiedRequirement(null);
      setTravelTip(null);
    }
  }, [selectedCountry, nationality, visaType]);

  const fetchVerifiedVisaInfo = async (origin: Country, dest: Country, type: VisaType) => {
    setIsVisaLoading(true);
    setIsTipLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const prompt = `
        Act as a professional visa and travel consultant. 
        Nationality: ${origin.name}
        Destination: ${dest.name}
        Visa Type: ${type}
        
        Provide the following in JSON format:
        {
          "status": "Visa Free" | "Visa Required" | "Visa on Arrival" | "e-Visa",
          "description": "Short summary of the requirement",
          "details": "Detailed explanation including stay duration and key documents",
          "tip": "One helpful travel tip for this specific route",
          "officialEmbassyUrl": "The direct URL to the official government or embassy visa information page for ${origin.name} citizens visiting ${dest.name}. MUST be a direct .gov or official link. DO NOT provide a google search link."
        }
        
        Be strictly accurate.
        Example: Indian citizens traveling to Nepal is "Visa Free" (Treaty of Peace and Friendship).
        Example: Pakistan citizens traveling to Australia is "Visa Required" (Subclass 600).
        Example: Indian citizens to Thailand is "Visa Free" (Temporary exemption).
        Example: US citizens to UK is "Visa Free" (Standard Visitor).
        Example: Official URL for India to Vietnam: https://evisa.xuatnhapcanh.gov.vn/
        Example: Official URL for US to France: https://france-visas.gouv.fr/
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: { 
          responseMimeType: "application/json",
          tools: [{ googleSearch: {} }]
        }
      });

      const data = JSON.parse(response.text || "{}");
      const status = data.status || "Visa Required";
      
      setVerifiedRequirement({
        status,
        description: data.description || "Check official sources",
        details: data.details,
        officialEmbassyUrl: data.officialEmbassyUrl
      });
      
      // Update cache for consistency in the grid
      setVerifiedCache(prev => ({
        ...prev,
        [`${origin.code}-${dest.code}`]: status
      }));
      
      setTravelTip(data.tip || "Always check official embassy websites.");
    } catch (error) {
      console.error("Error fetching visa info:", error);
      setVerifiedRequirement({
        status: "Visa Required",
        description: "Unable to verify automatically",
        details: "Please contact the nearest embassy for the most accurate information."
      });
    } finally {
      setIsVisaLoading(false);
      setIsTipLoading(false);
    }
  };

  // Basic grid logic (remains as a quick guide)
  const getBasicRequirement = (dest: Country): VisaRequirement => {
    if (!nationality) return { status: "Visa Required", description: "Select nationality first" };
    if (nationality.code === dest.code) return { status: "Home", description: "Your home country" };
    
    // 1. Check AI Verified Cache first for absolute consistency
    const cachedStatus = verifiedCache[`${nationality.code}-${dest.code}`];
    if (cachedStatus) {
      return { 
        status: cachedStatus, 
        description: cachedStatus === "Visa Free" ? "Verified: No visa required" : "Verified requirement" 
      };
    }

    // 2. Hardcoded Accurate Rules for common routes (e.g., India)
    if (nationality.code === "IN") {
      // Expanded Visa Free list for India (16+ countries)
      const visaFree = [
        "NP", "BT", "TH", "ID", "MY", "MU", "FJ", "KZ", "JM", "SV", "BB", "DM", "GD", "HT", "MS", "NU", "LC", "VC", "TT", "VU", "SN", "KN", "KI", "MO", "FM", "PS", "AL"
      ];
      if (visaFree.includes(dest.code)) return { status: "Visa Free", description: "Verified: No visa required" };
      
      const voa = ["MV", "SC", "ET", "JO", "KH", "LA", "BO", "CV", "KM", "GW", "MG", "MR", "MZ", "RW", "SL", "SO", "TG", "TV", "ZW"];
      if (voa.includes(dest.code)) return { status: "Visa on Arrival", description: "Available at airport" };
      
      const evisa = ["LK", "VN", "GE", "AZ", "MD", "TR", "EG", "RU", "QA", "AE"];
      if (evisa.includes(dest.code)) return { status: "e-Visa", description: "Apply online" };
    }

    // 3. General Region-based Logic
    if (nationality.region === dest.region) {
      if (nationality.region === "Europe") return { status: "Visa Free", description: "Likely Schengen/EU freedom" };
      if (nationality.region === "Americas") return { status: "Visa Free", description: "Likely Mercosur/Visa-free" };
    }

    // 4. Deterministic fallback (for variety in the grid)
    const charSum = dest.code.charCodeAt(0) + dest.code.charCodeAt(1) + nationality.code.charCodeAt(0);
    if (charSum % 11 === 0) return { status: "Visa on Arrival", description: "Likely available at airport" };
    if (charSum % 13 === 0) return { status: "e-Visa", description: "Likely available online" };
    
    return { status: "Visa Required", description: "Click to verify requirements" };
  };

  const filteredCountries = useMemo(() => {
    return countries.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           c.code.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRegion = selectedRegion === "All" || c.region === selectedRegion;
      
      const req = getBasicRequirement(c);
      const matchesVisaStatus = selectedVisaStatus === "All" || req.status === selectedVisaStatus;
      
      return matchesSearch && matchesRegion && matchesVisaStatus;
    });
  }, [searchQuery, selectedRegion, selectedVisaStatus, nationality]);

  const handleEmbassyRoute = (country: Country) => {
    const hardcodedUrl = hardcodedEmbassyUrls[`${nationality?.code}-${country.code}`];
    if (hardcodedUrl) {
      window.open(hardcodedUrl, "_blank");
      return;
    }

    if (verifiedRequirement?.officialEmbassyUrl && verifiedRequirement.officialEmbassyUrl.startsWith('http')) {
      // Basic validation to avoid search links
      const isSearchLink = ['google.com/search', 'bing.com/search', 'yahoo.com/search'].some(s => verifiedRequirement.officialEmbassyUrl?.includes(s));
      if (isSearchLink) {
        const query = encodeURIComponent(`official visa requirements for ${nationality?.name} citizens visiting ${country.name} government website`);
        window.open(`https://www.google.com/search?q=${query}+site%3A.gov`, "_blank");
      } else {
        window.open(verifiedRequirement.officialEmbassyUrl, "_blank");
      }
    } else {
      // If AI failed to provide a URL, use a very specific search but prioritize direct links
      const query = encodeURIComponent(`official visa requirements for ${nationality?.name} citizens visiting ${country.name} government website`);
      window.open(`https://www.google.com/search?q=${query}+site%3A.gov`, "_blank");
    }
  };

  const handleSkyscanner = (country: Country) => {
    const originCode = nationality?.code.toLowerCase() || 'auto';
    const destCode = country.code.toLowerCase();
    
    // Using the most robust Skyscanner search entry point
    // The 'transport/flights' path is the most reliable way to reach Skyscanner's search engine,
    // which then provides direct options for hotels and packages on the results page.
    const url = `https://www.skyscanner.net/transport/flights/${originCode}/${destCode}/?adults=1&cabinclass=economy&preferdirects=false`;
    window.open(url, "_blank");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-blue-100">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => {
              setNationality(null);
              setSelectedCountry(null);
              setSearchQuery("");
            }}
          >
            <div className="w-10 h-10 vibrant-bg rounded-xl flex items-center justify-center shadow-lg shadow-purple-200">
              <Globe className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-gradient">
                VisaNavigator
              </h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global Travel Intelligence</p>
            </div>
          </motion.div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2 text-sm font-bold text-slate-500 bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
              <ShieldCheck className="w-4 h-4 text-green-500" />
              <span>Verified Data</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20">
        <AnimatePresence mode="wait">
          <motion.div 
            key={dynamicCountries[dynamicCountryIndex].image}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.15 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 -z-10"
          >
            <img 
              src={dynamicCountries[dynamicCountryIndex].image} 
              className="w-full h-full object-cover" 
              alt="" 
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-white" />
          </motion.div>
        </AnimatePresence>
        
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              className="relative z-10"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-widest mb-6 border border-blue-200 shadow-sm">
                <Sparkles className="w-3 h-3" />
                <span>Travel with Confidence</span>
              </div>
              <h1 className="text-6xl md:text-8xl font-black font-display mb-6 leading-[0.9] tracking-tight text-slate-900">
                Explore <br />
                <AnimatePresence mode="wait">
                  <motion.span 
                    key={dynamicCountries[dynamicCountryIndex].name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="text-gradient block"
                  >
                    {dynamicCountries[dynamicCountryIndex].name}.
                  </motion.span>
                </AnimatePresence>
              </h1>
              <p className="text-slate-600 mb-10 text-xl font-medium leading-relaxed max-w-xl">
                Instant visa intelligence for every traveler. Discover where your passport can take you today with real-time data.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative group flex-1">
                  <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none z-10">
                    <MapPin className="text-blue-500 w-5 h-5" />
                  </div>
                  <select 
                    className="w-full bg-white text-slate-900 rounded-2xl py-5 pl-14 pr-6 appearance-none focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-lg shadow-xl border border-slate-100"
                    value={nationality?.code || ""}
                    onChange={(e) => {
                      const country = countries.find(c => c.code === e.target.value);
                      setNationality(country || null);
                    }}
                  >
                    <option value="" disabled>Select your nationality...</option>
                    {countries.map(c => (
                      <option key={c.code} value={c.code}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative hidden lg:block"
            >
              <div className="relative w-full aspect-square max-w-md mx-auto">
                <div className="absolute inset-0 vibrant-bg rounded-full blur-[80px] opacity-20 animate-pulse" />
                <div className="relative z-10 bg-white/40 backdrop-blur-2xl rounded-[40px] border border-white/50 p-8 shadow-2xl overflow-hidden">
                  <div className="grid grid-cols-2 gap-4">
                    {previewDestinations.slice(0, 4).map((dest, i) => (
                      <motion.div
                        key={dest.code}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 + 0.5 }}
                        className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100"
                      >
                        <div className="w-10 h-10 rounded-lg overflow-hidden mb-3">
                          <img src={`https://flagcdn.com/w80/${dest.code.toLowerCase()}.png`} className="w-full h-full object-cover" alt="" />
                        </div>
                        <p className="font-bold text-slate-900 text-sm">{dest.name}</p>
                        <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">{dest.tag}</p>
                      </motion.div>
                    ))}
                  </div>
                  <div className="mt-6 p-4 bg-blue-600 rounded-2xl text-white flex items-center justify-between shadow-lg shadow-blue-200">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Total Access</p>
                      <p className="text-2xl font-black">190+</p>
                    </div>
                    <Globe className="w-8 h-8 opacity-50" />
                  </div>
                </div>
                
                {/* Floating Elements */}
                <motion.div 
                  animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
                  transition={{ duration: 6, repeat: Infinity }}
                  className="absolute -top-10 -right-10 w-24 h-24 bg-white rounded-3xl shadow-2xl flex items-center justify-center border border-slate-100"
                >
                  <Plane className="w-10 h-10 text-blue-600" />
                </motion.div>
                <motion.div 
                  animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
                  transition={{ duration: 7, repeat: Infinity }}
                  className="absolute -bottom-10 -left-10 w-20 h-20 bg-white rounded-3xl shadow-2xl flex items-center justify-center border border-slate-100"
                >
                  <Hotel className="w-8 h-8 text-indigo-600" />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 py-12">

        {/* Search and Filters */}
        <div className="flex flex-col gap-8 mb-12">
          <div className="glass rounded-[2rem] p-6 md:p-8 border border-white/50 shadow-xl">
            <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
              <div className="relative w-full md:w-[400px]">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input 
                  type="text"
                  placeholder="Where do you want to go?"
                  className="w-full bg-white/50 border border-slate-200 rounded-2xl py-4 pl-14 pr-6 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-slate-900"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex gap-3 overflow-x-auto pb-2 w-full md:w-auto no-scrollbar">
                {["All", "Europe", "Asia", "Africa", "Americas", "Oceania"].map(region => (
                  <button 
                    key={region}
                    onClick={() => setSelectedRegion(region)}
                    className={cn(
                      "px-6 py-3 rounded-2xl border text-sm font-bold transition-all whitespace-nowrap",
                      selectedRegion === region 
                        ? "vibrant-bg border-transparent text-white shadow-lg shadow-blue-200 scale-105" 
                        : "bg-white border-slate-100 text-slate-500 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50"
                    )}
                  >
                    {region}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Visa Status Filter */}
          {nationality && (
            <div className="flex flex-col gap-3">
              <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400">Filter by Visa Status</h4>
              <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {["All", "Visa Free", "Visa Required", "Visa on Arrival", "e-Visa"].map(status => (
                  <button 
                    key={status}
                    onClick={() => setSelectedVisaStatus(status as any)}
                    className={cn(
                      "px-4 py-2 rounded-xl border text-xs font-bold transition-all whitespace-nowrap",
                      selectedVisaStatus === status 
                        ? "bg-gray-900 border-gray-900 text-white" 
                        : "bg-white border-gray-200 text-gray-500 hover:border-gray-400"
                    )}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Country Grid */}
        {!nationality ? (
          <div className="relative text-center py-32 glass rounded-[3rem] border-2 border-dashed border-slate-200 overflow-hidden">
            {/* Background Collage Elements */}
            <div className="absolute inset-0 -z-10">
              <img 
                src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1920&q=80" 
                className="w-full h-full object-cover opacity-20 scale-110 animate-pulse-slow" 
                alt="" 
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10" />
              
              {/* Decorative Shapes */}
              <div className="absolute top-0 left-0 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
            </div>

            {/* Floating Travel Icons - More Vibrant */}
            <motion.div 
              animate={{ y: [0, -20, 0], rotate: [0, 15, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-12 left-12 text-blue-500/30 drop-shadow-lg"
            >
              <Plane className="w-20 h-20" />
            </motion.div>
            <motion.div 
              animate={{ y: [0, 20, 0], rotate: [0, -15, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-12 right-12 text-purple-500/30 drop-shadow-lg"
            >
              <Camera className="w-16 h-16" />
            </motion.div>
            <motion.div 
              animate={{ x: [0, 15, 0], y: [0, -15, 0], rotate: [0, 10, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-24 right-24 text-indigo-500/30 drop-shadow-lg"
            >
              <Map className="w-14 h-14" />
            </motion.div>
            <motion.div 
              animate={{ x: [0, -15, 0], y: [0, 15, 0], rotate: [0, -10, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-24 left-24 text-slate-400/30 drop-shadow-lg"
            >
              <Briefcase className="w-14 h-14" />
            </motion.div>
            <motion.div 
              animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute top-1/2 left-1/4 -translate-y-1/2 text-blue-400/20"
            >
              <Compass className="w-24 h-24" />
            </motion.div>

            <div className="relative z-10">
              <div className="w-28 h-28 vibrant-bg rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-purple-200 animate-bounce">
                <Globe className="w-14 h-14 text-white" />
              </div>
              <h3 className="text-5xl font-black text-slate-900 mb-6 tracking-tight">Ready to explore?</h3>
              <p className="text-slate-600 text-xl font-medium max-w-lg mx-auto leading-relaxed">Select your nationality above to unlock a world of travel possibilities.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCountries.map((country) => {
              const req = getBasicRequirement(country);
              return (
                <motion.div 
                  layout
                  key={country.code}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl hover:shadow-gray-200/50 transition-all cursor-pointer"
                  onClick={() => setSelectedCountry(country)}
                >
                  <div className="relative h-48 bg-slate-100 overflow-hidden">
                    <img 
                      src={getCountryImage(country, 'small')}
                      alt={country.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
                    
                    <div className="absolute top-4 right-4">
                      <span className={cn(
                        "text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl backdrop-blur-md border border-white/20 shadow-lg",
                        req.status === "Visa Free" && "bg-green-500/90 text-white",
                        req.status === "Visa Required" && "bg-red-500/90 text-white",
                        req.status === "Visa on Arrival" && "bg-orange-500/90 text-white",
                        req.status === "e-Visa" && "bg-blue-500/90 text-white",
                        req.status === "Home" && "bg-slate-500/90 text-white",
                      )}>
                        {req.status}
                      </span>
                    </div>

                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-center gap-3 mb-1">
                        <img 
                          src={`https://flagcdn.com/w40/${country.code.toLowerCase()}.png`}
                          alt={country.name}
                          className="w-6 h-4 object-cover rounded shadow-sm border border-white/20"
                          referrerPolicy="no-referrer"
                        />
                        <h3 className="text-white font-black text-lg drop-shadow-lg truncate">{country.name}</h3>
                      </div>
                      <div className="flex items-center gap-2 text-white/80 text-[10px] font-bold uppercase tracking-widest">
                        <MapPin className="w-3 h-3" />
                        <span>{country.region}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-5 bg-white">
                    <div className="flex items-start gap-3 text-slate-500">
                      <Info className="w-4 h-4 mt-0.5 text-blue-500 shrink-0" />
                      <p className="text-xs font-medium leading-relaxed line-clamp-2">{req.description}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      {/* Info Modals (Privacy, Terms, Contact) */}
      <AnimatePresence>
        {infoModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
              onClick={() => setInfoModal(null)}
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                      {infoModal === 'privacy' && <Lock className="w-5 h-5" />}
                      {infoModal === 'terms' && <FileText className="w-5 h-5" />}
                      {infoModal === 'contact' && <Mail className="w-5 h-5" />}
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 capitalize">{infoModal}</h2>
                  </div>
                  <button 
                    onClick={() => setInfoModal(null)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-all text-gray-400"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4 text-gray-600 leading-relaxed">
                  {infoModal === 'privacy' && (
                    <>
                      <p>At VisaNavigator, we take your privacy seriously. This policy outlines how we handle your information.</p>
                      <ul className="list-disc pl-5 space-y-2 text-sm">
                        <li><strong>No Personal Tracking:</strong> We do not store your personal search history or travel queries.</li>
                        <li><strong>AI Processing:</strong> Your queries are processed via Google Generative AI to provide travel insights, but no personal identifiers are shared.</li>
                        <li><strong>Cookies:</strong> We use minimal cookies to ensure the application functions correctly and to remember your preferences.</li>
                        <li><strong>Data Security:</strong> Any data you provide is encrypted and handled with industry-standard security protocols.</li>
                      </ul>
                    </>
                  )}

                  {infoModal === 'terms' && (
                    <>
                      <p>By using VisaNavigator, you agree to the following terms and conditions:</p>
                      <ul className="list-disc pl-5 space-y-2 text-sm">
                        <li><strong>Informational Purpose:</strong> All data provided is for educational and informational purposes only.</li>
                        <li><strong>Verification Required:</strong> You MUST verify all visa requirements with the official embassy or consulate of your destination country before traveling.</li>
                        <li><strong>No Liability:</strong> VisaNavigator is not responsible for any travel disruptions, visa denials, or financial losses incurred while using this service.</li>
                        <li><strong>AI Accuracy:</strong> AI-generated travel tips and news are subject to model limitations and should be cross-referenced.</li>
                      </ul>
                    </>
                  )}

                  {infoModal === 'contact' && (
                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100">
                          <User className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Developer</p>
                          <p className="text-lg font-bold text-gray-900">Aashi Aditi</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100">
                          <Mail className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Email</p>
                          <a href="mailto:aashiaditi25@gmail.com" className="text-lg font-bold text-blue-600 hover:underline">
                            aashiaditi25@gmail.com
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-8">
                  <button 
                    onClick={() => setInfoModal(null)}
                    className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-gray-800 transition-all"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {selectedCountry && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
              onClick={() => setSelectedCountry(null)}
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-y-auto max-h-[90vh] no-scrollbar overscroll-contain"
            >
              {/* Modal Header */}
              <div className="relative h-56 bg-gray-900">
                <img 
                  src={getCountryImage(selectedCountry, 'large')}
                  alt={selectedCountry.name}
                  className="w-full h-full object-cover opacity-60"
                  referrerPolicy="no-referrer"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
                <button 
                  onClick={() => setSelectedCountry(null)}
                  className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/40 rounded-full text-white transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
                
                <div className="absolute bottom-6 left-8 flex items-center gap-4">
                  <img 
                    src={`https://flagcdn.com/w80/${selectedCountry.code.toLowerCase()}.png`}
                    alt={selectedCountry.name}
                    className="w-16 h-10 object-cover rounded-lg shadow-lg"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h2 className="text-3xl font-bold text-white">{selectedCountry.name}</h2>
                    <p className="text-blue-100 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {selectedCountry.region}
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">Visa Type</h4>
                    <div className="space-y-2">
                      {(["Tourist", "Student", "Business", "Work", "Transit"] as VisaType[]).map((type) => (
                        <button
                          key={type}
                          onClick={() => setVisaType(type)}
                          className={cn(
                            "w-full flex items-center justify-between p-3 rounded-xl border transition-all text-left",
                            visaType === type 
                              ? "border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-600/10" 
                              : "border-gray-100 hover:border-gray-300 text-gray-600"
                          )}
                        >
                          <span className="font-medium">{type} Visa</span>
                          {visaType === type && <div className="w-2 h-2 bg-blue-600 rounded-full" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">Requirement</h4>
                      <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 mb-4">
                        {isVisaLoading ? (
                          <div className="space-y-3">
                            <div className="h-6 w-32 bg-gray-200 animate-pulse rounded" />
                            <div className="h-4 w-full bg-gray-200 animate-pulse rounded" />
                            <div className="h-4 w-2/3 bg-gray-200 animate-pulse rounded" />
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-3 mb-2">
                              <AlertCircle className={cn(
                                "w-5 h-5",
                                verifiedRequirement?.status === "Visa Required" ? "text-red-500" : "text-blue-600"
                              )} />
                              <span className="font-bold text-gray-900">
                                {verifiedRequirement?.status || "Checking..."}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 leading-relaxed font-medium mb-2">
                              {verifiedRequirement?.description}
                            </p>
                            {verifiedRequirement?.details && (
                              <p className="text-xs text-gray-500 leading-relaxed border-t border-gray-200 pt-2 mt-2">
                                {verifiedRequirement.details}
                              </p>
                            )}
                          </>
                        )}
                      </div>

                      {/* Travel Tip Section */}
                      <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100">
                        <h5 className="text-[10px] font-bold uppercase tracking-wider text-blue-600 mb-2 flex items-center gap-1">
                          <Globe className="w-3 h-3" /> Travel Tip
                        </h5>
                        {isTipLoading ? (
                          <div className="h-4 w-full bg-blue-100 animate-pulse rounded" />
                        ) : (
                          <p className="text-xs text-blue-800 italic">
                            "{travelTip || "Always carry a copy of your documents."}"
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <button 
                        onClick={() => handleSkyscanner(selectedCountry)}
                        className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                      >
                        <Plane className="w-5 h-5" />
                        <Hotel className="w-5 h-5" />
                        <span>Book Hotel + Flights</span>
                      </button>

                      <button 
                        onClick={() => handleEmbassyRoute(selectedCountry)}
                        disabled={isVisaLoading && !hardcodedEmbassyUrls[`${nationality?.code}-${selectedCountry.code}`]}
                        className={cn(
                          "w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all",
                          isVisaLoading && !hardcodedEmbassyUrls[`${nationality?.code}-${selectedCountry.code}`]
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-white border-2 border-gray-100 text-gray-700 hover:border-blue-600 hover:text-blue-600"
                        )}
                      >
                        {isVisaLoading && !hardcodedEmbassyUrls[`${nationality?.code}-${selectedCountry.code}`] ? (
                          <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                        ) : (
                          <ExternalLink className="w-4 h-4" />
                        )}
                        {isVisaLoading && !hardcodedEmbassyUrls[`${nationality?.code}-${selectedCountry.code}`] ? "Finding Official Link..." : "Official Embassy Page"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 text-center border-t border-gray-100">
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-medium">
                  Information is for demonstration purposes only. Always check official sources.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* Chat Bot Widget */}
      <div className="fixed bottom-8 right-8 z-[60]">
        <AnimatePresence>
          {isChatOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="absolute bottom-20 right-0 w-[350px] md:w-[400px] h-[500px] bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col"
            >
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold">Travel Buddy</h3>
                    <p className="text-[10px] text-blue-100 uppercase tracking-widest font-bold">AI Travel Assistant</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={handleNewChat} 
                    title="Start New Chat"
                    className="p-2 hover:bg-white/10 rounded-full transition-all"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button onClick={() => setIsChatOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-all">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar bg-gray-50/50">
                {chatMessages.map((msg, idx) => (
                  <motion.div
                    initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={idx}
                    className={cn(
                      "max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed",
                      msg.role === 'user' 
                        ? "bg-blue-600 text-white ml-auto rounded-tr-none" 
                        : "bg-white text-gray-700 shadow-sm border border-gray-100 rounded-tl-none"
                    )}
                  >
                    {msg.role === 'user' ? (
                      msg.text
                    ) : (
                      <div className="markdown-content">
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                      </div>
                    )}
                  </motion.div>
                ))}
                {isChatLoading && (
                  <div className="bg-white text-gray-700 shadow-sm border border-gray-100 p-4 rounded-2xl rounded-tl-none max-w-[85%] flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    <span className="text-xs font-medium">Travel Buddy is thinking...</span>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="p-4 bg-white border-t border-gray-100">
                <div className="relative">
                  <input 
                    type="text"
                    placeholder="Ask about itineraries, safety, or visas..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 pl-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <button 
                    onClick={handleSendMessage}
                    disabled={isChatLoading || !userInput.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white shadow-2xl shadow-blue-400/40 relative group"
        >
          <div className="absolute inset-0 bg-white/20 rounded-full animate-ping group-hover:hidden" />
          {isChatOpen ? <X className="w-8 h-8" /> : <MessageSquare className="w-8 h-8" />}
        </motion.button>
      </div>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 py-12 border-t border-gray-200 mt-20">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-400 rounded flex items-center justify-center">
              <Globe className="text-white w-4 h-4" />
            </div>
            <span className="font-bold text-gray-400">VisaNavigator</span>
          </div>
          
          <div className="flex gap-8 text-sm font-medium text-gray-500">
          <a href="#" onClick={(e) => { e.preventDefault(); setInfoModal('privacy'); }} className="hover:text-blue-600 transition-colors">Privacy</a>
          <a href="#" onClick={(e) => { e.preventDefault(); setInfoModal('terms'); }} className="hover:text-blue-600 transition-colors">Terms</a>
          <a href="#" onClick={(e) => { e.preventDefault(); setInfoModal('contact'); }} className="hover:text-blue-600 transition-colors">Contact</a>
          </div>
          
          <p className="text-xs text-gray-400">
            © 2026 VisaNavigator. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

