import { createContext, useContext, useState, useEffect } from 'react';

const DevelopersContext = createContext();

const INITIAL_DEVELOPERS = [
  {
    id: 1,
    name: "Priya Sharma",
    expertise: ["React", "Node.js", "Solidity"],
    rate: 0.05,
    rating: 4.8,
    available: true,
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=500",
    bio: "Full-stack developer with 5 years of experience in web3 development.",
    completedSessions: 124,
    languages: ["English", "Hindi"],
    timezone: "UTC+5:30"
  },
  {
    id: 2,
    name: "Rahul Verma",
    expertise: ["Python", "Smart Contracts", "DeFi"],
    rate: 0.07,
    rating: 4.9,
    available: true,
    image: "https://images.unsplash.com/photo-1531891437562-4301cf35b7e4?w=500",
    bio: "Blockchain expert specializing in DeFi protocols and smart contracts.",
    completedSessions: 89,
    languages: ["English", "Hindi", "Punjabi"],
    timezone: "UTC+5:30"
  },
  {
    id: 3,
    name: "Arjun Patel",
    expertise: ["Rust", "Blockchain", "Web3"],
    rate: 0.08,
    rating: 4.7,
    available: true,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500",
    bio: "Systems engineer with deep expertise in blockchain architecture.",
    completedSessions: 156,
    languages: ["English", "Gujarati", "Hindi"],
    timezone: "UTC+5:30"
  },
  {
    id: 4,
    name: "Anjali Mehta",
    expertise: ["Ethereum", "Smart Contracts", "Frontend"],
    rate: 0.06,
    rating: 4.9,
    available: true,
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=500",
    bio: "Frontend developer with a passion for creating intuitive Web3 interfaces.",
    completedSessions: 92,
    languages: ["English", "Hindi", "Marathi"],
    timezone: "UTC+5:30"
  },
  {
    id: 5,
    name: "Vikram Singh",
    expertise: ["Solidity", "Security", "DeFi"],
    rate: 0.09,
    rating: 5.0,
    available: true,
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500",
    bio: "Smart contract security expert with auditing experience.",
    completedSessions: 203,
    languages: ["English", "Hindi", "Bengali"],
    timezone: "UTC+5:30"
  }
];

export function DevelopersProvider({ children }) {
  const [developers, setDevelopers] = useState(() => {
    // Load developers from localStorage or use initial data
    const savedDevelopers = localStorage.getItem('developers');
    return savedDevelopers ? JSON.parse(savedDevelopers) : INITIAL_DEVELOPERS;
  });

  // Save to localStorage whenever developers change
  useEffect(() => {
    localStorage.setItem('developers', JSON.stringify(developers));
  }, [developers]);

  const addDeveloper = (newDeveloper) => {
    setDevelopers(prev => {
      const updated = [...prev, {
        ...newDeveloper,
        id: prev.length + 1,
        rating: newDeveloper.rating || 0,
        completedSessions: newDeveloper.completedSessions || 0,
        available: true,
        createdAt: new Date().toISOString()
      }];
      return updated;
    });
  };

  const getDeveloperByWallet = (walletAddress) => {
    return developers.find(dev => dev.walletAddress === walletAddress);
  };

  const updateDeveloper = (id, updates) => {
    setDevelopers(prev => prev.map(dev => 
      dev.id === id ? { ...dev, ...updates } : dev
    ));
  };

  return (
    <DevelopersContext.Provider value={{ 
      developers, 
      addDeveloper, 
      getDeveloperByWallet,
      updateDeveloper 
    }}>
      {children}
    </DevelopersContext.Provider>
  );
}

export const useDevelopers = () => {
  const context = useContext(DevelopersContext);
  if (!context) {
    throw new Error('useDevelopers must be used within a DevelopersProvider');
  }
  return context;
}; 