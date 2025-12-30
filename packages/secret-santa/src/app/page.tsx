'use client';

import { useState } from 'react';

export default function SecretSanta() {
  const [participants, setParticipants] = useState<string[]>([]);
  const [inputName, setInputName] = useState('');
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [revealedFor, setRevealedFor] = useState<string | null>(null);
  const [error, setError] = useState('');

  const addParticipant = () => {
    const trimmedName = inputName.trim();
    if (!trimmedName) {
      setError('Please enter a name');
      return;
    }
    if (participants.includes(trimmedName)) {
      setError('This name is already in the list');
      return;
    }
    if (participants.length >= 20) {
      setError('Maximum 20 participants allowed');
      return;
    }
    setParticipants([...participants, trimmedName]);
    setInputName('');
    setError('');
  };

  const removeParticipant = (name: string) => {
    setParticipants(participants.filter(p => p !== name));
    setAssignments({});
    setRevealedFor(null);
  };

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const drawNames = () => {
    if (participants.length < 2) {
      setError('You need at least 2 participants');
      return;
    }

    let attempts = 0;
    const maxAttempts = 100;
    let validDraw = false;
    let newAssignments: Record<string, string> = {};

    while (!validDraw && attempts < maxAttempts) {
      attempts++;
      const shuffled = shuffleArray([...participants]);
      newAssignments = {};
      validDraw = true;

      for (let i = 0; i < participants.length; i++) {
        const giver = participants[i];
        const receiver = shuffled[i];
        
        if (giver === receiver) {
          validDraw = false;
          break;
        }
        newAssignments[giver] = receiver;
      }
    }

    if (validDraw) {
      setAssignments(newAssignments);
      setRevealedFor(null);
      setError('');
    } else {
      setError('Could not generate a valid draw. Please try again.');
    }
  };

  const revealAssignment = (name: string) => {
    setRevealedFor(name);
  };

  const hideAssignment = () => {
    setRevealedFor(null);
  };

  const resetDraw = () => {
    setAssignments({});
    setRevealedFor(null);
  };

  const exportResults = () => {
    const results = Object.entries(assignments)
      .map(([giver, receiver]) => `${giver} → ${receiver}`)
      .join('\n');
    
    const blob = new Blob([results], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'secret-santa-results.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyResults = async () => {
    const results = Object.entries(assignments)
      .map(([giver, receiver]) => `${giver} → ${receiver}`)
      .join('\n');
    
    try {
      await navigator.clipboard.writeText(results);
      alert('Results copied to clipboard!');
    } catch (err) {
      alert('Failed to copy results');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-green-900 to-red-950 py-12 px-4 relative overflow-hidden">
      {/* Christmas decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white/5 to-transparent"></div>
        <div className="absolute top-10 left-10 text-6xl opacity-10">❄️</div>
        <div className="absolute top-20 right-20 text-5xl opacity-10">⭐</div>
        <div className="absolute bottom-20 left-20 text-5xl opacity-10">🎄</div>
        <div className="absolute bottom-10 right-10 text-6xl opacity-10">❄️</div>
        <div className="absolute top-1/2 left-1/4 text-4xl opacity-10">✨</div>
        <div className="absolute top-1/3 right-1/3 text-4xl opacity-10">🎁</div>
      </div>

      <div className="max-w-3xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-200 via-yellow-200 to-green-200 mb-4 drop-shadow-lg" style={{ fontFamily: 'var(--font-playfair)' }}>
            🎅 Secret Santa
          </h1>
          <p className="text-green-100 text-lg font-light tracking-wide">Organize your gift exchange with holiday magic</p>
        </div>

        {/* Add Participant Section */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 mb-8 border-2 border-red-200">
          <h2 className="text-2xl font-semibold text-red-900 mb-6 flex items-center gap-2">
            <span>🎄</span>
            <span>Add Participants ({participants.length}/20)</span>
          </h2>
          
          <div className="flex gap-3 mb-6">
            <input
              type="text"
              value={inputName}
              onChange={(e) => setInputName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addParticipant()}
              placeholder="Enter a name..."
              className="flex-1 px-5 py-3 border-2 border-green-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-800 text-lg transition-all"
              maxLength={30}
            />
            <button
              onClick={addParticipant}
              className="px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Add
            </button>
          </div>

          {error && (
            <div className="text-red-800 text-sm mb-4 bg-red-100 border-l-4 border-red-600 p-4 rounded-lg">
              ⚠️ {error}
            </div>
          )}

          {/* Participants List */}
          {participants.length > 0 && (
            <div className="space-y-3">
              {participants.map((name) => (
                <div
                  key={name}
                  className="flex items-center justify-between bg-gradient-to-r from-green-50 to-red-50 px-5 py-3 rounded-xl border border-green-200 hover:border-red-300 transition-all"
                >
                  <span className="text-gray-800 font-medium text-lg">🎁 {name}</span>
                  <button
                    onClick={() => removeParticipant(name)}
                    className="text-red-600 hover:text-red-800 font-semibold px-3 py-1 rounded-lg hover:bg-red-100 transition-all"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Draw Button */}
        {participants.length >= 2 && Object.keys(assignments).length === 0 && (
          <button
            onClick={drawNames}
            className="w-full py-5 bg-gradient-to-r from-green-600 via-green-700 to-green-800 text-white rounded-2xl hover:from-green-700 hover:via-green-800 hover:to-green-900 transition-all font-bold text-xl shadow-2xl hover:shadow-green-500/50 transform hover:scale-105 border-2 border-green-400"
          >
            ✨ Draw Names ✨
          </button>
        )}

        {/* Results Section */}
        {Object.keys(assignments).length > 0 && (
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border-2 border-green-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-green-900 flex items-center gap-2">
                <span>🎁</span>
                <span>Results - Click to Reveal</span>
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={resetDraw}
                  className="px-5 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all text-sm font-semibold shadow-lg"
                >
                  🔄 Re-draw
                </button>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              {participants.map((name) => (
                <div key={name}>
                  <button
                    onClick={() => revealedFor === name ? hideAssignment() : revealAssignment(name)}
                    className="w-full text-left px-6 py-4 bg-gradient-to-r from-red-50 to-green-50 hover:from-red-100 hover:to-green-100 rounded-xl transition-all border-2 border-red-300 hover:border-green-400 shadow-md hover:shadow-lg transform hover:scale-[1.02]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-800 text-lg">{name}</span>
                      <span className="text-red-700 font-bold">
                        {revealedFor === name ? '👁️ Hide' : '🎁 Reveal'}
                      </span>
                    </div>
                    {revealedFor === name && (
                      <div className="mt-3 pt-3 border-t-2 border-green-300">
                        <span className="text-green-800 font-bold text-lg">
                          ✨ Gives to: {assignments[name]}
                        </span>
                      </div>
                    )}
                  </button>
                </div>
              ))}
            </div>

            {/* Export Options */}
            <div className="flex gap-3 pt-6 border-t-2 border-gray-200">
              <button
                onClick={copyResults}
                className="flex-1 px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-semibold shadow-lg hover:shadow-xl"
              >
                📋 Copy Results
              </button>
              <button
                onClick={exportResults}
                className="flex-1 px-5 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all font-semibold shadow-lg hover:shadow-xl"
              >
                💾 Download
              </button>
            </div>
          </div>
        )}

        {/* Instructions */}
        {participants.length === 0 && (
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 text-center text-gray-700 border-2 border-yellow-200">
            <div className="text-6xl mb-4">🎄</div>
            <p className="text-xl font-semibold mb-3 text-green-900">Start by adding participants above</p>
            <p className="text-base text-gray-600">You need at least 2 people to draw names</p>
          </div>
        )}
      </div>
    </div>
  );
}






