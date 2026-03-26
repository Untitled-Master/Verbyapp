import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import MainNavbar from '../../components/MainNavbar';
import { useAuth } from '../../context/AuthContext';
import { ref, update, get } from 'firebase/database';
import { database } from '../../lib/firebase';
import { toast } from 'sonner';
import { Coffee, ArrowLeft } from 'lucide-react';
import correctSound from '../../assets/correct.mp3';
import wrongSound from '../../assets/wrong.mp3';

const API_BASE = 'https://verby-back.vercel.app/api';

const PERSONS = ['je', 'tu', 'il', 'nous', 'vous', 'ils'];

const MODES = [
  { id: 'indicatif', name: 'Indicatif' },
  { id: 'subjonctif', name: 'Subjonctif' },
  { id: 'conditionnel', name: 'Conditionnel' },
  { id: 'imperatif', name: 'Impératif' },
];

const TENSES_BY_MODE = {
  indicatif: [
    'Présent', 'Passé composé', 'Imparfait', 'Plus-que-parfait',
    'Passé simple', 'Passé antérieur', 'Futur simple', 'Futur antérieur'
  ],
  subjonctif: ['Présent', 'Passé', 'Imparfait', 'Plus-que-parfait'],
  conditionnel: ['Présent', 'Passé première forme', 'Passé deuxième forme'],
  imperatif: ['Présent', 'Passé'],
};

const extractPersonFromConjugation = (conjugation) => {
  for (const person of PERSONS) {
    if (conjugation.startsWith(person + ' ')) {
      return { person, verbPart: conjugation.slice(person.length + 1) };
    }
    if (conjugation.startsWith("j'") && person === 'je') {
      return { person: 'je', verbPart: conjugation.slice(2) };
    }
    if (conjugation.startsWith("n'") && person === 'nous') {
      return { person: 'nous', verbPart: conjugation.slice(2) };
    }
    if (conjugation.startsWith("l'") && person === 'ils') {
      return { person: 'il/elle/on', verbPart: conjugation.slice(2) };
    }
    if (conjugation.startsWith("t'") && person === 'tu') {
      return { person: 'tu', verbPart: conjugation.slice(2) };
    }
    if (conjugation.startsWith("s'") && person === 'vous') {
      return { person: 'vous', verbPart: conjugation.slice(2) };
    }
    if (conjugation.startsWith("qu'")) {
      if (conjugation.startsWith("qu'il") || conjugation.startsWith("qu'elle") || conjugation.startsWith("qu'on")) {
        return { person: 'il/elle/on', verbPart: conjugation.slice(3) };
      }
    }
  }
  return null;
};

const ZenMode = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [gameState, setGameState] = useState('setup');
  const [selectedModes, setSelectedModes] = useState(['indicatif']);
  const [selectedTenses, setSelectedTenses] = useState(['Présent']);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [options, setOptions] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [loading, setLoading] = useState(false);

  const correctRef = useRef(0);
  const wrongRef = useRef(0);
  const fetchAbortRef = useRef(null);

  useEffect(() => {
    correctRef.current = correct;
    wrongRef.current = wrong;
  }, [correct, wrong]);

  const toggleMode = (modeId) => {
    setSelectedModes(prev => {
      if (prev.includes(modeId)) {
        if (prev.length === 1) return prev;
        return prev.filter(m => m !== modeId);
      }
      return [...prev, modeId];
    });
  };

  const toggleTense = (tense) => {
    setSelectedTenses(prev => {
      if (prev.includes(tense)) {
        if (prev.length === 1) return prev;
        return prev.filter(t => t !== tense);
      }
      return [...prev, tense];
    });
  };

  const getAvailableTenses = () => {
    const tenses = [];
    selectedModes.forEach(mode => {
      if (TENSES_BY_MODE[mode]) {
        tenses.push(...TENSES_BY_MODE[mode]);
      }
    });
    return [...new Set(tenses)];
  };

  const fetchRandomVerb = useCallback(async () => {
    if (fetchAbortRef.current) {
      fetchAbortRef.current.abort();
    }
    fetchAbortRef.current = new AbortController();
    
    try {
      const mode = selectedModes[Math.floor(Math.random() * selectedModes.length)];
      const response = await fetch(`${API_BASE}/random/${mode}`, {
        signal: fetchAbortRef.current.signal,
      });
      if (!response.ok) throw new Error('Failed to fetch verb');
      const data = await response.json();
      return data;
    } catch (err) {
      if (err.name === 'AbortError') return null;
      throw err;
    }
  }, [selectedModes]);

  const generateOptions = useCallback((correctAnswer, allConjugations) => {
    const correctExtracted = extractPersonFromConjugation(correctAnswer);
    const correctPronoun = correctExtracted?.person || correctAnswer.split(' ')[0];
    
    const incorrect = allConjugations
      .filter(c => c !== correctAnswer)
      .map(c => {
        const extracted = extractPersonFromConjugation(c);
        return extracted ? extracted.verbPart : c.split(' ').slice(1).join(' ');
      });
    
    const shuffled = incorrect.sort(() => Math.random() - 0.5);
    const wrongOptions = shuffled.slice(0, 3).map(verbPart => `${correctPronoun} ${verbPart}`);
    
    const correctOption = correctExtracted 
      ? `${correctPronoun} ${correctExtracted.verbPart}` 
      : correctAnswer;
    
    const choices = [correctOption, ...wrongOptions];
    return choices.sort(() => Math.random() - 0.5);
  }, []);

  const createQuestion = useCallback((verbData) => {
    const { verb, mode, tenses } = verbData;
    
    if (!tenses || typeof tenses !== 'object') return null;
    
    const availableTenseKeys = Object.keys(tenses).filter(t => selectedTenses.includes(t));
    if (availableTenseKeys.length === 0) return null;
    
    const randomTense = availableTenseKeys[Math.floor(Math.random() * availableTenseKeys.length)];
    const conjugations = tenses[randomTense];
    
    if (!conjugations || !Array.isArray(conjugations) || conjugations.length === 0) return null;
    
    const randomIndex = Math.floor(Math.random() * conjugations.length);
    const correctConjugation = conjugations[randomIndex];
    
    const extracted = extractPersonFromConjugation(correctConjugation);
    if (!extracted) return null;
    
    const { person, verbPart } = extracted;
    const normalizedCorrectAnswer = `${person} ${verbPart}`;
    
    return {
      verb,
      mode,
      tense: randomTense,
      person,
      correctAnswer: normalizedCorrectAnswer,
      options: generateOptions(correctConjugation, conjugations),
    };
  }, [generateOptions, selectedTenses]);

  const loadNextQuestion = useCallback(async (retryCount = 0) => {
    setLoading(true);
    setSelectedAnswer(null);
    
    if (retryCount > 5) {
      toast.error('Failed to load question. Please try again.');
      setLoading(false);
      return;
    }
    
    try {
      const verbData = await fetchRandomVerb();
      if (!verbData) {
        loadNextQuestion(retryCount + 1);
        return;
      }
      
      const question = createQuestion(verbData);
      if (!question) {
        loadNextQuestion(retryCount + 1);
        return;
      }
      
      setCurrentQuestion(question);
      setOptions(question.options);
      setLoading(false);
    } catch {
      loadNextQuestion(retryCount + 1);
    }
  }, [fetchRandomVerb, createQuestion]);

  const startGame = async () => {
    if (!user) {
      toast.error('Please log in to play');
      navigate('/login');
      return;
    }
    
    correctRef.current = 0;
    wrongRef.current = 0;
    setCorrect(0);
    setWrong(0);
    setGameState('playing');
    
    await loadNextQuestion();
  };

  const handleAnswer = async (answer) => {
    if (selectedAnswer || !currentQuestion) return;
    
    setSelectedAnswer(answer);
    const isCorrect = answer === currentQuestion.correctAnswer;
    
    if (isCorrect) {
      correctRef.current += 1;
      setCorrect(correctRef.current);
      new Audio(correctSound).play().catch(() => {});
    } else {
      wrongRef.current += 1;
      setWrong(wrongRef.current);
      new Audio(wrongSound).play().catch(() => {});
    }
    
    setTimeout(async () => {
      await loadNextQuestion();
    }, 600);
  };

  const endGame = async () => {
    if (fetchAbortRef.current) {
      fetchAbortRef.current.abort();
    }
    
    setGameState('ended');
    
    if (user && (correctRef.current > 0 || wrongRef.current > 0)) {
      try {
        const statsRef = ref(database, `users/${user.uid}/stats/zen`);
        const snapshot = await get(statsRef);
        const currentStats = snapshot.exists() ? snapshot.val() : { correct: 0, wrong: 0 };
        
        await update(ref(database), {
          [`users/${user.uid}/stats/zen`]: {
            correct: (currentStats.correct || 0) + correctRef.current,
            wrong: (currentStats.wrong || 0) + wrongRef.current,
          },
        });
      } catch (err) {
        console.error('Failed to save stats:', err);
      }
    }
  };

  if (gameState === 'setup') {
    const availableTenses = getAvailableTenses();
    
    return (
      <div className="min-h-screen font-mono bg-[#F0EFEB] text-[#333333]">
        <MainNavbar />
        <div className="max-w-xl mx-auto px-6 py-16 text-center">
          <div className="w-16 h-16 rounded-lg bg-[#6366F1] flex items-center justify-center mx-auto mb-6">
            <Coffee size={32} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-3">Zen Mode</h1>
          <p className="text-sm text-gray-500 mb-8 max-w-md mx-auto">
            Practice at your own pace. No timer, no pressure. Choose your modes and tenses, then play until you&apos;re satisfied.
          </p>
          
          <div className="bg-white border border-[#DEDDDA] rounded-lg p-6 mb-4 text-left">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Select Modes</h3>
            <div className="grid grid-cols-2 gap-3">
              {MODES.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => toggleMode(mode.id)}
                  className={`p-3 rounded-lg border text-sm font-bold transition-all ${
                    selectedModes.includes(mode.id)
                      ? 'bg-[#6366F1] text-white border-[#6366F1]'
                      : 'bg-white border-[#DEDDDA] hover:border-[#6366F1]'
                  }`}
                >
                  {mode.name}
                </button>
              ))}
            </div>
          </div>
          
          <div className="bg-white border border-[#DEDDDA] rounded-lg p-6 mb-6 text-left">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Select Tenses</h3>
              <button
                onClick={() => setSelectedTenses(availableTenses)}
                className="text-xs text-[#6366F1] hover:underline"
              >
                Select All
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {availableTenses.map((tense) => (
                <button
                  key={tense}
                  onClick={() => toggleTense(tense)}
                  className={`p-2 rounded border text-xs font-bold transition-all ${
                    selectedTenses.includes(tense)
                      ? 'bg-[#6366F1] text-white border-[#6366F1]'
                      : 'bg-white border-[#DEDDDA] hover:border-[#6366F1]'
                  }`}
                >
                  {tense}
                </button>
              ))}
            </div>
          </div>
          
          <button
            onClick={startGame}
            disabled={selectedModes.length === 0 || selectedTenses.length === 0}
            className="w-full max-w-xs mx-auto bg-[#6366F1] text-white px-8 py-3 rounded font-bold text-sm hover:bg-[#6366F1]/90 transition-colors disabled:opacity-50"
          >
            Start Practicing
          </button>
        </div>
      </div>
    );
  }

  if (gameState === 'ended') {
    const total = correct + wrong;
    const ratio = total > 0 ? Math.round((correct / total) * 100) : 0;
    
    return (
      <div className="min-h-screen font-mono bg-[#F0EFEB] text-[#333333]">
        <MainNavbar />
        <div className="max-w-lg mx-auto px-6 py-12">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold tracking-tight mb-1">Session Complete</h1>
            <p className="text-sm text-gray-500">Great practice session!</p>
          </div>
          
          <div className="bg-white border border-[#DEDDDA] rounded-lg p-6 mb-4">
            <div className="text-center mb-5">
              <div className="text-5xl font-bold text-[#6366F1] mb-1">{ratio}%</div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">Accuracy</div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-green-50 rounded p-3 text-center">
                <div className="text-2xl font-bold text-green-600">{correct}</div>
                <div className="text-[10px] text-green-600 uppercase tracking-wide">Correct</div>
              </div>
              <div className="bg-red-50 rounded p-3 text-center">
                <div className="text-2xl font-bold text-red-500">{wrong}</div>
                <div className="text-[10px] text-red-500 uppercase tracking-wide">Wrong</div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/arena')}
              className="flex-1 py-2.5 rounded border border-[#DEDDDA] text-xs font-bold hover:bg-[#EAE9E4] transition-colors"
            >
              Arena
            </button>
            <button
              onClick={() => setGameState('setup')}
              className="flex-1 py-2.5 rounded border border-[#DEDDDA] text-xs font-bold hover:bg-[#EAE9E4] transition-colors"
            >
              Settings
            </button>
            <button
              onClick={startGame}
              className="flex-1 py-2.5 rounded bg-[#6366F1] text-white text-xs font-bold hover:bg-[#6366F1]/90 transition-colors"
            >
              Play Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const total = correct + wrong;
  const ratio = total > 0 ? Math.round((correct / total) * 100) : 0;

  return (
    <div className="min-h-screen font-mono bg-[#F0EFEB] text-[#333333]">
      <MainNavbar />
      
      <div className="max-w-xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={endGame}
            className="p-2 rounded hover:bg-[#EAE9E4] transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <span className="text-sm font-bold text-green-600">{correct}</span>
              <span className="text-xs text-gray-400">/</span>
              <span className="text-sm font-bold text-red-500">{wrong}</span>
            </div>
          </div>
          
          <div className="text-sm font-bold text-[#6366F1]">
            {ratio}%
          </div>
        </div>
        
        {loading ? (
          <div className="text-center py-20 text-sm text-gray-400">Loading...</div>
        ) : currentQuestion ? (
          <div>
            <div className="text-center mb-8">
              <div className="text-[10px] text-gray-400 uppercase tracking-widest mb-2 font-bold">
                {currentQuestion.mode} · {currentQuestion.tense}
              </div>
              <div className="text-4xl font-bold tracking-tight mb-2">
                {currentQuestion.verb}
              </div>
              <div className="text-sm text-gray-500">
                {currentQuestion.person} ...
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {options.map((option, index) => {
                const isSelected = selectedAnswer === option;
                const isCorrect = option === currentQuestion.correctAnswer;
                const showResult = selectedAnswer !== null;
                
                let bgClass = 'bg-white border border-[#DEDDDA] hover:border-[#6366F1]';
                if (showResult) {
                  if (isCorrect) {
                    bgClass = 'bg-green-500 text-white border-green-500';
                  } else if (isSelected && !isCorrect) {
                    bgClass = 'bg-red-500 text-white border-red-500';
                  } else {
                    bgClass = 'bg-gray-100 text-gray-400 border-transparent';
                  }
                }
                
                const verbPart = option.split(' ').slice(1).join(' ');
                
                return (
                  <button
                    key={index}
                    onClick={() => handleAnswer(option)}
                    disabled={selectedAnswer !== null}
                    className={`p-4 rounded-lg text-left transition-all ${bgClass}`}
                  >
                    <span className="text-lg">{verbPart}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ZenMode;
