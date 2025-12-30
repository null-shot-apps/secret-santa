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
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-green-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-red-600 mb-2">
            🎅 Secret Santa
          </h1>
          <p className="text-gray-600">Organize your gift exchange easily</p>
        </div>

        {/* Add Participant Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Add Participants ({participants.length}/20)
          </h2>
          
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={inputName}
              onChange={(e) => setInputName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addParticipant()}
              placeholder="Enter a name..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-800"
              maxLength={30}
            />
            <button
              onClick={addParticipant}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Add
            </button>
          </div>

          {error && (
            <div className="text-red-600 text-sm mb-4 bg-red-50 p-3 rounded">
              {error}
            </div>
          )}

          {/* Participants List */}
          {participants.length > 0 && (
            <div className="space-y-2">
              {participants.map((name) => (
                <div
                  key={name}
                  className="flex items-center justify-between bg-gray-50 px-4 py-2 rounded-lg"
                >
                  <span className="text-gray-800">{name}</span>
                  <button
                    onClick={() => removeParticipant(name)}
                    className="text-red-500 hover:text-red-700 font-medium"
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
            className="w-full py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-bold text-lg shadow-md"
          >
            🎁 Draw Names
          </button>
        )}

        {/* Results Section */}
        {Object.keys(assignments).length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Results - Click to Reveal
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={resetDraw}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
                >
                  Re-draw
                </button>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              {participants.map((name) => (
                <div key={name}>
                  <button
                    onClick={() => revealedFor === name ? hideAssignment() : revealAssignment(name)}
                    className="w-full text-left px-4 py-3 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border-2 border-red-200"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-800">{name}</span>
                      <span className="text-red-600">
                        {revealedFor === name ? '👁️ Hide' : '🎁 Reveal'}
                      </span>
                    </div>
                    {revealedFor === name && (
                      <div className="mt-2 pt-2 border-t border-red-300">
                        <span className="text-green-700 font-semibold">
                          → Gives to: {assignments[name]}
                        </span>
                      </div>
                    )}
                  </button>
                </div>
              ))}
            </div>

            {/* Export Options */}
            <div className="flex gap-2 pt-4 border-t border-gray-200">
              <button
                onClick={copyResults}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                📋 Copy Results
              </button>
              <button
                onClick={exportResults}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                💾 Download
              </button>
            </div>
          </div>
        )}

        {/* Instructions */}
        {participants.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-600">
            <p className="mb-2">👆 Start by adding participants above</p>
            <p className="text-sm">You need at least 2 people to draw names</p>
          </div>
        )}
      </div>
    </div>
  );
}

