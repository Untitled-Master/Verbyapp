import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import MainNavbar from '../../components/MainNavbar';
import { useAuth } from '../../context/AuthContext';
import { ref, update, get } from 'firebase/database';
import { database } from '../../lib/firebase';
import { toast } from 'sonner';
import { Flame, ArrowLeft, X, Check } from 'lucide-react';
import correctSound from '../../assets/correct.mp3';
import wrongSound from '../../assets/wrong.mp3';

const API_BASE = 'https://verby-back.vercel.app/api';

const PERSONS = ['je', 'tu', 'il', 'nous', 'vous', 'ils'];

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

const VerbyStreak = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [gameState, setGameState] = useState('idle');
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [options, setOptions] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [streak, setStreak] = useState(0);
  const [highStreak, setHighStreak] = useState(0);
  const [loading, setLoading] = useState(false);
  const [gameResults, setGameResults] = useState(null);

  const streakRef = useRef(0);
  const highStreakRef = useRef(0);
  const fetchAbortRef = useRef(null);
  const gameEndedRef = useRef(false);

  useEffect(() => {
    if (user) {
      const fetchStats = async () => {
        const statsRef = ref(database, `users/${user.uid}/stats/streak`);
        const snapshot = await get(statsRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          const best = data.bestStreak || 0;
          setHighStreak(best);
          highStreakRef.current = best;
        }
      };
      fetchStats();
    }
  }, [user]);

  const fetchRandomVerb = useCallback(async () => {
    if (fetchAbortRef.current) {
      fetchAbortRef.current.abort();
    }
    fetchAbortRef.current = new AbortController();
    
    try {
      const response = await fetch(`${API_BASE}/random/indicatif`, {
        signal: fetchAbortRef.current.signal,
      });
      if (!response.ok) throw new Error('Failed to fetch verb');
      const data = await response.json();
      return data;
    } catch (err) {
      if (err.name === 'AbortError') return null;
      throw err;
    }
  }, []);

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
    
    const tenseKeys = Object.keys(tenses);
    if (tenseKeys.length === 0) return null;
    
    const randomTense = tenseKeys[Math.floor(Math.random() * tenseKeys.length)];
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
  }, [generateOptions]);

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
    
    gameEndedRef.current = false;
    streakRef.current = 0;
    
    setGameState('playing');
    setStreak(0);
    setGameResults(null);
    
    await loadNextQuestion();
  };

  const handleAnswer = async (answer) => {
    if (selectedAnswer || !currentQuestion) return;
    
    setSelectedAnswer(answer);
    const isCorrect = answer === currentQuestion.correctAnswer;
    
    if (isCorrect) {
      streakRef.current += 1;
      setStreak(streakRef.current);
      if (streakRef.current > highStreakRef.current) {
        highStreakRef.current = streakRef.current;
        setHighStreak(streakRef.current);
      }
      new Audio(correctSound).play().catch(() => {});
      
      setTimeout(async () => {
        await loadNextQuestion();
      }, 400);
    } else {
      new Audio(wrongSound).play().catch(() => {});
      
      const finalStreak = streakRef.current;
      const isNewBest = finalStreak > (highStreakRef.current - (finalStreak === 0 ? 0 : finalStreak)) || finalStreak > highStreakRef.current;
      
      setGameResults({
        streak: finalStreak,
        isNewBest: isNewBest || finalStreak > 0,
      });
      
      if (finalStreak > highStreakRef.current) {
        highStreakRef.current = finalStreak;
        setHighStreak(finalStreak);
      }
      
      await saveResults(finalStreak);
      setGameState('ended');
    }
  };

  const saveResults = async (finalStreak) => {
    if (!user) return;
    
    try {
      const statsRef = ref(database, `users/${user.uid}/stats/streak`);
      const snapshot = await get(statsRef);
      const currentData = snapshot.exists() ? snapshot.val() : {};
      const currentBest = currentData.bestStreak || 0;
      
      const updates = {
        [`users/${user.uid}/stats/streak`]: {
          bestStreak: Math.max(currentBest, finalStreak),
          lastStreak: finalStreak,
          games: (currentData.games || 0) + 1,
        },
      };
      
      if (finalStreak > 0) {
        const gameId = Date.now().toString();
        updates[`users/${user.uid}/gameHistory/streak/${gameId}`] = {
          timestamp: Date.now(),
          streak: finalStreak,
          bestStreak: Math.max(currentBest, finalStreak),
        };
      }
      
      await update(ref(database), updates);
    } catch (err) {
      console.error('Failed to save results:', err);
    }
  };

  if (gameState === 'idle') {
    return (
      <div className="min-h-screen font-mono bg-[#F0EFEB] text-[#333333]">
        <MainNavbar />
        <div className="max-w-xl mx-auto px-6 py-16 text-center">
          <div className="w-16 h-16 rounded-lg bg-[#EB3514] flex items-center justify-center mx-auto mb-6">
            <Flame size={32} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-3">Verby Streak</h1>
          <p className="text-sm text-gray-500 mb-8 max-w-md mx-auto">
            How long can you go? Keep conjugating verbs until you make a mistake. One wrong answer ends it all.
          </p>
          
          <div className="bg-[#F0EFEB] border border-[#DEDDDA] rounded-lg p-5 mb-6 text-left">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">How it works</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <Flame size={14} className="mt-0.5 text-[#EB3514]" />
                <span className="text-gray-600">Conjugate verbs correctly to build your streak</span>
              </li>
              <li className="flex items-start gap-3">
                <X size={14} className="mt-0.5 text-[#EB3514]" />
                <span className="text-gray-600">One mistake ends the game</span>
              </li>
              <li className="flex items-start gap-3">
                <Check size={14} className="mt-0.5 text-[#EB3514]" />
                <span className="text-gray-600">Your best streak is saved and shown on your profile</span>
              </li>
            </ul>
          </div>
          
          <div className="text-xs text-gray-500 mb-6">
            <span className="text-[#333333] font-bold">{highStreak}</span> best streak
          </div>
          
          <button
            onClick={startGame}
            className="w-full max-w-xs mx-auto bg-[#EB3514] text-white px-8 py-3 rounded font-bold text-sm hover:bg-[#EB3514]/90 transition-colors"
          >
            Start Game
          </button>
        </div>
      </div>
    );
  }

  if (gameState === 'ended' && gameResults) {
    return (
      <div className="min-h-screen font-mono bg-[#F0EFEB] text-[#333333]">
        <MainNavbar />
        <div className="max-w-lg mx-auto px-6 py-12">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold tracking-tight mb-1">Game Over</h1>
            <p className="text-sm text-gray-500">You made a mistake</p>
          </div>
          
          <div className="bg-white border border-[#DEDDDA] rounded-lg p-6 mb-4">
            <div className="text-center mb-5">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Flame size={32} className="text-[#EB3514]" />
                <div className="text-5xl font-bold text-[#333333]">{gameResults.streak}</div>
              </div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">streak</div>
            </div>
            
            {gameResults.streak > 0 && gameResults.streak >= highStreakRef.current && (
              <div className="bg-green-50 border border-green-200 rounded p-3 text-center mb-4">
                <span className="text-sm font-bold text-green-600">New Best Streak!</span>
              </div>
            )}
            
            <div className="text-center text-xs text-gray-500">
              Best Streak: <span className="font-bold text-[#333333]">{highStreakRef.current}</span>
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
              onClick={startGame}
              className="flex-1 py-2.5 rounded bg-[#EB3514] text-white text-xs font-bold hover:bg-[#EB3514]/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-mono bg-[#F0EFEB] text-[#333333]">
      <MainNavbar />
      
      <div className="max-w-xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => {
              if (fetchAbortRef.current) fetchAbortRef.current.abort();
              setGameState('idle');
            }}
            className="p-2 rounded hover:bg-[#EAE9E4] transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Flame size={14} className="text-[#EB3514]" />
              <span className="font-bold text-sm">{streak}</span>
            </div>
          </div>
          
          <div className="text-xs text-gray-400">
            Best: {highStreak}
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
                
                let bgClass = 'bg-white border border-[#DEDDDA] hover:border-[#333333]';
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

export default VerbyStreak;
