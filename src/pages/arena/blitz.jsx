import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import MainNavbar from '../../components/MainNavbar';
import { useAuth } from '../../context/AuthContext';
import { ref, update, get } from 'firebase/database';
import { database } from '../../lib/firebase';
import { toast } from 'sonner';
import { Zap, ArrowLeft, Trophy, Target, Clock, X, Check } from 'lucide-react';
import correctSound from '../../assets/correct.mp3';
import wrongSound from '../../assets/wrong.mp3';
import tenSecondsSound from '../../assets/10.mp3';
import doneSound from '../../assets/done.mp3';

const API_BASE = 'https://verby-back.vercel.app/api';
const GAME_DURATION = 60;

const PERSONS = ['je', 'tu', 'il', 'nous', 'vous', 'ils'];

const getPersonLabel = (key) => {
  const labels = {
    je: 'je',
    tu: 'tu',
    'il/elle/on': 'il/elle/on',
    nous: 'nous',
    vous: 'vous',
    'ils/elles': 'ils/elles',
  };
  return labels[key] || key;
};

const calculatePerQuestionRating = (isCorrect, consecutiveCorrect) => {
  if (isCorrect) {
    return consecutiveCorrect >= 2 ? 4 : 2;
  }
  return -2;
};

const Blitz = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [gameState, setGameState] = useState('idle');

  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [options, setOptions] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [, setMaxStreak] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentRating, setCurrentRating] = useState(1200);
  const [gameResults, setGameResults] = useState(null);
  
  const timerRef = useRef(null);
  const fetchAbortRef = useRef(null);
  const ratingRef = useRef(1200);
  const scoreRef = useRef(0);
  const streakRef = useRef(0);
  const maxStreakRef = useRef(0);
  const totalAnsweredRef = useRef(0);
  const correctAnswersRef = useRef(0);
  const historyRef = useRef([]);
  const gameEndedRef = useRef(false);
  const ratingChangeRef = useRef(0);
  const consecutiveCorrectRef = useRef(0);

  useEffect(() => {
    if (user) {
      const fetchRating = async () => {
        const statsRef = ref(database, `users/${user.uid}/stats/blitz`);
        const snapshot = await get(statsRef);
        const rating = snapshot.exists() ? (snapshot.val().rating || 1200) : 1200;
        setCurrentRating(rating);
        ratingRef.current = rating;
      };
      fetchRating();
    }
  }, [user]);

  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            endGame(
              scoreRef.current,
              correctAnswersRef.current,
              totalAnsweredRef.current,
              maxStreakRef.current,
              historyRef.current
            );
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState]);

  useEffect(() => {
    if (gameState === 'playing' && timeLeft === 10) {
      new Audio(tenSecondsSound).play().catch(() => {});
    }
  }, [timeLeft, gameState]);

  useEffect(() => {
    if (gameState === 'ended') {
      new Audio(doneSound).play().catch(() => {});
    }
  }, [gameState]);

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
      personLabel: getPersonLabel(person),
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
    scoreRef.current = 0;
    streakRef.current = 0;
    maxStreakRef.current = 0;
    totalAnsweredRef.current = 0;
    correctAnswersRef.current = 0;
    historyRef.current = [];
    ratingChangeRef.current = 0;
    consecutiveCorrectRef.current = 0;
    
    setGameState('playing');
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setTotalAnswered(0);
    setCorrectAnswers(0);
    setHistory([]);
    setTimeLeft(GAME_DURATION);
    setGameResults(null);
    
    await loadNextQuestion();
  };

  const handleAnswer = async (answer) => {
    if (selectedAnswer || !currentQuestion) return;
    
    setSelectedAnswer(answer);
    const isCorrect = answer === currentQuestion.correctAnswer;
    
    let questionRatingChange = 0;
    
    if (isCorrect) {
      const newConsecutive = consecutiveCorrectRef.current + 1;
      consecutiveCorrectRef.current = newConsecutive;
      questionRatingChange = calculatePerQuestionRating(true, newConsecutive - 1);
      
      const newStreak = streakRef.current + 1;
      streakRef.current = newStreak;
      maxStreakRef.current = Math.max(maxStreakRef.current, newStreak);
      correctAnswersRef.current += 1;
      scoreRef.current += 10 + (streakRef.current * 2);
      setScore(scoreRef.current);
      setStreak(streakRef.current);
      setMaxStreak(maxStreakRef.current);
      setCorrectAnswers(correctAnswersRef.current);
      new Audio(correctSound).play().catch(() => {});
    } else {
      consecutiveCorrectRef.current = 0;
      questionRatingChange = -2;
      streakRef.current = 0;
      setStreak(0);
      setCorrectAnswers(correctAnswersRef.current);
      new Audio(wrongSound).play().catch(() => {});
    }
    
    ratingChangeRef.current += questionRatingChange;
    
    historyRef.current = [...historyRef.current, {
      verb: currentQuestion.verb,
      mode: currentQuestion.mode,
      tense: currentQuestion.tense,
      person: currentQuestion.person,
      correct: isCorrect,
      given: answer,
      expected: currentQuestion.correctAnswer,
      ratingChange: questionRatingChange,
    }];
    setHistory(historyRef.current);
    setTotalAnswered(totalAnsweredRef.current + 1);
    totalAnsweredRef.current += 1;
    
    setTimeout(async () => {
      await loadNextQuestion();
    }, 600);
  };

  const endGame = async (finalScore, finalCorrect, finalTotal, finalMaxStreak, finalHistory) => {
    if (gameEndedRef.current) return;
    gameEndedRef.current = true;
    
    if (timerRef.current) clearInterval(timerRef.current);
    if (fetchAbortRef.current) fetchAbortRef.current.abort();
    
    setGameState('ended');
    setHistory(finalHistory);
    
    const ratingChange = ratingChangeRef.current;
    const baseRating = ratingRef.current || 1200;
    const newRating = baseRating + ratingChange;
    
    setGameResults({
      score: finalScore,
      correct: finalCorrect,
      total: finalTotal,
      accuracy: finalTotal > 0 ? Math.round((finalCorrect / finalTotal) * 100) : 0,
      maxStreak: finalMaxStreak,
      ratingChange,
      newRating,
    });
    
    try {
      const gameId = Date.now().toString();
      
      const gamesSnap = await get(ref(database, `users/${user.uid}/stats/blitz/games`));
      const winsSnap = await get(ref(database, `users/${user.uid}/stats/blitz/wins`));
      const totalGamesSnap = await get(ref(database, `users/${user.uid}/achievements/totalGames`));
      const totalWinsSnap = await get(ref(database, `users/${user.uid}/achievements/totalWins`));
      
      const currentGames = gamesSnap.val() || 0;
      const currentWins = winsSnap.val() || 0;
      const currentTotalGames = totalGamesSnap.val() || 0;
      const currentTotalWins = totalWinsSnap.val() || 0;
      
      const isWin = finalTotal > 0 && finalCorrect > finalTotal / 2;
      
      const updates = {
        [`users/${user.uid}/stats/blitz`]: {
          rating: newRating,
          games: currentGames + 1,
          wins: isWin ? currentWins + 1 : currentWins,
        },
        [`users/${user.uid}/gameHistory/blitz/${gameId}`]: {
          timestamp: Date.now(),
          score: finalScore,
          correct: finalCorrect,
          total: finalTotal,
          accuracy: finalTotal > 0 ? Math.round((finalCorrect / finalTotal) * 100) : 0,
          maxStreak: finalMaxStreak,
          ratingChange,
        },
        [`users/${user.uid}/achievements/totalGames`]: currentTotalGames + 1,
      };
      
      if (isWin) {
        updates[`users/${user.uid}/achievements/totalWins`] = currentTotalWins + 1;
      }
      
      const today = new Date().toISOString().split('T')[0];
      updates[`users/${user.uid}/ratingHistory/${today}/blitz`] = newRating;
      
      await update(ref(database), updates);
      setCurrentRating(newRating);
      ratingRef.current = newRating;
      
    } catch (err) {
      console.error('Failed to save game results:', err);
    }
  };

  if (gameState === 'idle') {
    return (
      <div className="min-h-screen font-mono bg-[#F0EFEB] text-[#333333]">
        <MainNavbar />
        <div className="max-w-xl mx-auto px-6 py-16 text-center">
          <div className="w-16 h-16 rounded-lg bg-[#333333] flex items-center justify-center mx-auto mb-6">
            <Zap size={32} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-3">Blitz Mode</h1>
          <p className="text-sm text-gray-500 mb-8 max-w-md mx-auto">
            60 seconds. Race against time to conjugate as many verbs correctly as you can. Build your streak for bonus points!
          </p>
          
          <div className="bg-[#F0EFEB] border border-[#DEDDDA] rounded-lg p-5 mb-6 text-left">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">How it works</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <Clock size={14} className="mt-0.5 text-[#EB3514]" />
                <span className="text-gray-600">60 seconds to answer as many questions as possible</span>
              </li>
              <li className="flex items-start gap-3">
                <Target size={14} className="mt-0.5 text-[#EB3514]" />
                <span className="text-gray-600">10 points per correct answer + streak bonus</span>
              </li>
              <li className="flex items-start gap-3">
                <Zap size={14} className="mt-0.5 text-[#EB3514]" />
                <span className="text-gray-600">+2 bonus per consecutive correct answer</span>
              </li>
              <li className="flex items-start gap-3">
                <Trophy size={14} className="mt-0.5 text-[#EB3514]" />
                <span className="text-gray-600">50%+ accuracy = gain ELO</span>
              </li>
            </ul>
          </div>
          
          <div className="text-xs text-gray-500 mb-6">
            <span className="text-[#333333] font-bold">{currentRating}</span> ELO
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
    const isPositive = gameResults.ratingChange >= 0;
    return (
      <div className="min-h-screen font-mono bg-[#F0EFEB] text-[#333333]">
        <MainNavbar />
        <div className="max-w-lg mx-auto px-6 py-12">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold tracking-tight mb-1">Game Over</h1>
            <p className="text-sm text-gray-500">Time&apos;s up</p>
          </div>
          
          <div className="bg-white border border-[#DEDDDA] rounded-lg p-6 mb-4">
            <div className="text-center mb-5">
              <div className="text-5xl font-bold text-[#333333] mb-1">{gameResults.score}</div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">points</div>
            </div>
            
            <div className="grid grid-cols-4 gap-3 mb-4">
              <div className="bg-[#F0EFEB] rounded p-3 text-center">
                <div className="text-xl font-bold">{gameResults.correct}/{gameResults.total}</div>
                <div className="text-[10px] text-gray-500 uppercase tracking-wide">Correct</div>
              </div>
              <div className="bg-[#F0EFEB] rounded p-3 text-center">
                <div className="text-xl font-bold">{gameResults.accuracy}%</div>
                <div className="text-[10px] text-gray-500 uppercase tracking-wide">Accuracy</div>
              </div>
              <div className="bg-[#F0EFEB] rounded p-3 text-center">
                <div className="text-xl font-bold">{gameResults.maxStreak}</div>
                <div className="text-[10px] text-gray-500 uppercase tracking-wide">Streak</div>
              </div>
              <div className="bg-[#F0EFEB] rounded p-3 text-center">
                <div className={`text-xl font-bold ${isPositive ? 'text-green-600' : 'text-red-500'}`}>
                  {isPositive ? '+' : ''}{gameResults.ratingChange}
                </div>
                <div className="text-[10px] text-gray-500 uppercase tracking-wide">ELO</div>
              </div>
            </div>
            
            <div className="text-center text-xs text-gray-500">
              New Rating: <span className="font-bold text-[#333333]">{gameResults.newRating}</span>
            </div>
          </div>
          
          {history.length > 0 && (
            <div className="bg-white border border-[#DEDDDA] rounded-lg p-4 mb-4">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">History</h3>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {history.map((item, index) => (
                  <div 
                    key={index} 
                    className={`flex items-center justify-between p-2 rounded text-xs ${
                      item.correct ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {item.correct ? <Check size={12} /> : <X size={12} />}
                      <span className="font-bold">{item.verb}</span>
                      <span className="text-gray-400">{item.tense} · {item.person}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {!item.correct && (
                        <span className="text-[10px]">{item.expected.split(' ')[1]}</span>
                      )}
                      <span className={`text-[10px] font-bold ${item.ratingChange > 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {item.ratingChange > 0 ? '+' : ''}{item.ratingChange}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
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
              Play Again
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
              if (timerRef.current) clearInterval(timerRef.current);
              setGameState('idle');
            }}
            className="p-2 rounded hover:bg-[#EAE9E4] transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Zap size={14} className="text-[#EB3514]" />
              <span className="font-bold text-sm">{score}</span>
            </div>
            {streak > 0 && (
              <div className="flex items-center gap-1 text-xs">
                <span>🔥</span>
                <span className="font-bold">{streak}</span>
              </div>
            )}
          </div>
          
          <div className={`px-4 py-2 rounded-lg font-bold text-2xl ${
            timeLeft <= 10 ? 'bg-red-500 text-white' : 'bg-[#333333] text-white'
          }`}>
            {timeLeft}s
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
            
            <div className="mt-6 text-center text-xs text-gray-400">
              {totalAnswered} · {correctAnswers} correct
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Blitz;
