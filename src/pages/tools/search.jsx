import { useState, useCallback } from 'react';
import MainNavbar from '../../components/MainNavbar';
import { Search, BookOpen, X } from 'lucide-react';

const API_BASE = 'https://verby-back.vercel.app/api';

const VerbSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [verbData, setVerbData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [error, setError] = useState('');

  const fetchSuggestions = useCallback(async (query) => {
    if (query.length < 1) {
      setSuggestions([]);
      return;
    }
    
    setLoadingSuggestions(true);
    try {
      const response = await fetch(`${API_BASE}/search/${query}`);
      if (response.ok) {
        const data = await response.json();
        setSuggestions(Array.isArray(data) ? data : []);
      } else {
        setSuggestions([]);
      }
    } catch {
      setSuggestions([]);
    }
    setLoadingSuggestions(false);
  }, []);

  const fetchVerbConjugation = async (verb) => {
    setLoading(true);
    setError('');
    setSuggestions([]);
    try {
      const response = await fetch(`${API_BASE}/conjugate/${verb}`);
      if (!response.ok) {
        if (response.status === 404) {
          setError(`Verb "${verb}" not found`);
        } else {
          throw new Error('Failed to fetch');
        }
        setVerbData(null);
        setLoading(false);
        return;
      }
      const data = await response.json();
      setVerbData(data);
      setSearchTerm(verb);
      setError('');
    } catch {
      setError('Failed to fetch verb. Please try again.');
      setVerbData(null);
    }
    setLoading(false);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value.length >= 1) {
      fetchSuggestions(value);
    } else {
      setSuggestions([]);
    }
  };

  const handleSelectVerb = (verb) => {
    fetchVerbConjugation(verb);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSuggestions([]);
    setVerbData(null);
    setError('');
  };

  const formatConjugations = (conjugations) => {
    if (!Array.isArray(conjugations)) return null;
    return conjugations.map((c, i) => (
      <span key={i} className="inline-block bg-[#F0EFEB] px-2 py-1 rounded mr-2 mb-2 text-sm">
        {c}
      </span>
    ));
  };

  return (
    <div className="min-h-screen font-mono bg-[#F0EFEB] text-[#333333]">
      <MainNavbar />
      
      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-[#6366F1] flex items-center justify-center">
              <Search size={20} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Verb Search</h1>
          </div>
          <p className="text-sm text-gray-500">Search for any French verb and view its complete conjugation</p>
        </div>

        <div className="mb-8 relative">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Type to search verbs (e.g., mang, être, avoir)"
                className="w-full pl-10 pr-10 py-3 rounded-lg border border-[#DEDDDA] bg-white focus:outline-none focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1]"
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {suggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-[#DEDDDA] rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {suggestions.map((verb, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectVerb(verb)}
                  className="w-full px-4 py-2 text-left hover:bg-[#F0EFEB] transition-colors first:rounded-t-lg last:rounded-b-lg"
                >
                  <span className="font-medium">{verb}</span>
                  <span className="text-xs text-gray-400 ml-2">- {verb.replace(/er$|ir$|re$/, '')}er/ir/re</span>
                </button>
              ))}
            </div>
          )}

          {loadingSuggestions && searchTerm.length >= 1 && suggestions.length === 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-[#DEDDDA] rounded-lg shadow-lg p-4">
              <p className="text-sm text-gray-400 text-center">Searching...</p>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg text-sm mb-6">
            {error}
          </div>
        )}

        {loading && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-sm">Loading conjugation...</p>
          </div>
        )}

        {verbData && !loading && (
          <div className="bg-white border border-[#DEDDDA] rounded-lg p-6">
            <div className="mb-6 pb-4 border-b border-[#DEDDDA]">
              <h2 className="text-3xl font-bold text-[#6366F1]">{verbData.verb}</h2>
              <p className="text-xs text-gray-400 uppercase tracking-wide mt-1">Verb Conjugation</p>
            </div>

            {verbData.conjugations && Object.entries(verbData.conjugations).map(([mood, tenses]) => (
              <div key={mood} className="mb-6">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">{mood}</h3>
                {Object.entries(tenses).map(([tense, conjugations]) => (
                  <div key={tense} className="mb-4">
                    <h4 className="text-xs font-semibold text-gray-400 mb-2">{tense}</h4>
                    <div className="flex flex-wrap">
                      {formatConjugations(conjugations)}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {!verbData && !loading && !error && suggestions.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <BookOpen size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-sm">Start typing to search for verbs</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerbSearch;
