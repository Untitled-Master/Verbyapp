import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import MainNavbar from '../../components/MainNavbar';
import { useAuth } from '../../context/AuthContext';
import { ref, update, get } from 'firebase/database';
import { database } from '../../lib/firebase';
import { toast } from 'sonner';
import { BookOpen, ArrowLeft } from 'lucide-react';
import correctSound from '../../assets/correct.mp3';
import wrongSound from '../../assets/wrong.mp3';
import tenSecondsSound from '../../assets/10.mp3';
import doneSound from '../../assets/done.mp3';
import sdlQuestions from '../../assets/Questions/sdl.json';

const GAME_DURATION = 60;

const SDLBlitz = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [gameState, setGameState] = useState('idle');
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [currentRating, setCurrentRating] = useState(1200);
  const [gameResults, setGameResults] = useState(null);

  const timerRef = useRef(null);
  const scoreRef = useRef(0);
  const streakRef = useRef(0);
  const maxStreakRef = useRef(0);
  const totalAnsweredRef = useRef(0);
  const correctAnswersRef = useRef(0);
  const gameEndedRef = useRef(false);
  const ratingChangeRef = useRef(0);
  const consecutiveCorrectRef = useRef(0);
  const usedQuestionIdsRef = useRef(new Set());

  useEffect(() => {
    if (user) {
      const fetchRating = async () => {
        const statsRef = ref(database, `users/${user.uid}/stats/sdl`);
        const snapshot = await get(statsRef);
        const rating = snapshot.exists() ? (snapshot.val().rating || 1200) : 1200;
        setCurrentRating(rating);
      };
      fetchRating();
    }
  }, [user]);

   
  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            if (endGameRef.current) {
              endGameRef.current(
                scoreRef.current,
                correctAnswersRef.current,
                totalAnsweredRef.current,
                maxStreakRef.current,
                ratingChangeRef.current
              );
            }
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

  const calculatePerQuestionRating = (isCorrect, consecutiveCorrect) => {
    if (isCorrect) {
      return consecutiveCorrect >= 2 ? 4 : 2;
    }
    return -2;
  };

  const getRandomQuestions = useCallback((count) => {
    const availableQuestions = sdlQuestions.filter(q => !usedQuestionIdsRef.current.has(q.id));
    if (availableQuestions.length < count) {
      usedQuestionIdsRef.current.clear();
      return sdlQuestions;
    }
    const shuffled = [...availableQuestions].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }, []);

  const loadNextQuestion = useCallback(() => {
    const questions = getRandomQuestions(1);
    if (questions.length === 0) {
      toast.error('No more questions available');
      return;
    }

    const q = questions[0];
    usedQuestionIdsRef.current.add(q.id);

    const correctIndex = ['A', 'B', 'C', 'D'].indexOf(q.correct_answer);
    const correctAnswer = q.options[correctIndex];

    const shuffledOptions = [...q.options].sort(() => Math.random() - 0.5);
    const newCorrectIndex = shuffledOptions.indexOf(correctAnswer);

    setCurrentQuestion({
      id: q.id,
      question: q.question,
      correctAnswer,
      correctIndex: newCorrectIndex,
      level: q.level,
      topic: q.topic,
      explanation: q.explanation,
      options: shuffledOptions,
      correctAnswerDisplay: q.correct_answer,
    });
  }, [getRandomQuestions]);

  const startGame = async () => {
    if (!user) {
      toast.error('Please log in to play');
      navigate('/login');
      return;
    }

    gameEndedRef.current = false;
    usedQuestionIdsRef.current.clear();
    scoreRef.current = 0;
    streakRef.current = 0;
    maxStreakRef.current = 0;
    totalAnsweredRef.current = 0;
    correctAnswersRef.current = 0;
    ratingChangeRef.current = 0;
    consecutiveCorrectRef.current = 0;

    setGameState('playing');
    setTimeLeft(GAME_DURATION);
    setScore(0);
    setStreak(0);
    setTotalAnswered(0);
    setCorrectAnswers(0);
    setGameResults(null);

    loadNextQuestion();
  };

  const handleAnswer = async (answer, index) => {
    if (selectedAnswer !== null || !currentQuestion) return;

    setSelectedAnswer({ answer, index });
    const isCorrect = index === currentQuestion.correctIndex;

    if (isCorrect) {
      consecutiveCorrectRef.current += 1;
      const ratingChange = calculatePerQuestionRating(true, consecutiveCorrectRef.current);
      scoreRef.current += ratingChange;
      streakRef.current += 1;
      if (streakRef.current > maxStreakRef.current) {
        maxStreakRef.current = streakRef.current;
      }
      totalAnsweredRef.current += 1;
      correctAnswersRef.current += 1;
      ratingChangeRef.current += ratingChange;
      new Audio(correctSound).play().catch(() => {});

      setScore(scoreRef.current);
      setStreak(streakRef.current);
      setTotalAnswered(totalAnsweredRef.current);
      setCorrectAnswers(correctAnswersRef.current);
    } else {
      consecutiveCorrectRef.current = 0;
      const ratingChange = calculatePerQuestionRating(false, 0);
      scoreRef.current += ratingChange;
      if (scoreRef.current < 0) scoreRef.current = 0;
      totalAnsweredRef.current += 1;
      ratingChangeRef.current += ratingChange;
      new Audio(wrongSound).play().catch(() => {});

      setScore(scoreRef.current);
      setTotalAnswered(totalAnsweredRef.current);
    }

    setTimeout(() => {
      setSelectedAnswer(null);
      loadNextQuestion();
    }, 800);
  };

  const endGameRef = useRef(null);

  const endGame = useCallback(async (finalScore, correct, total, bestStreak, ratingChange) => {
    if (gameEndedRef.current) return;
    gameEndedRef.current = true;

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    setGameState('ended');

    const newRating = Math.max(1200, currentRating + ratingChange);
    ratingChangeRef.current = ratingChange;

    setGameResults({
      score: finalScore,
      correct,
      total,
      bestStreak,
      ratingChange,
      newRating,
    });

    if (user) {
      try {
        const statsRef = ref(database, `users/${user.uid}/stats/sdl`);
        const snapshot = await get(statsRef);
        const currentStats = snapshot.exists() ? snapshot.val() : { rating: 1200, games: 0, wins: 0 };

        const updates = {
          [`users/${user.uid}/stats/sdl`]: {
            rating: newRating,
            games: (currentStats.games || 0) + 1,
            wins: correct > (total / 2) ? (currentStats.wins || 0) + 1 : currentStats.wins || 0,
          },
        };

        const gameId = Date.now().toString();
        updates[`users/${user.uid}/gameHistory/sdl/${gameId}`] = {
          timestamp: Date.now(),
          score: finalScore,
          correct,
          total,
          ratingChange,
        };

        const today = new Date().toISOString().split('T')[0];
        const ratingHistoryRef = ref(database, `users/${user.uid}/ratingHistory/${today}`);
        const ratingHistorySnapshot = await get(ratingHistoryRef);
        const currentHistory = ratingHistorySnapshot.exists() ? ratingHistorySnapshot.val() : {};
        updates[`users/${user.uid}/ratingHistory/${today}`] = {
          ...currentHistory,
          sdl: newRating,
        };

        await update(ref(database), updates);
      } catch (err) {
        console.error('Failed to save results:', err);
      }
    }
  }, [user, currentRating]);

  endGameRef.current = endGame;

  if (gameState === 'idle') {
    return (
      <div className="min-h-screen font-mono bg-[#F0EFEB] text-[#333333]">
        <MainNavbar />
        <div className="max-w-xl mx-auto px-6 py-16 text-center">
          <div className="w-16 h-16 rounded-lg bg-[#6366F1] flex items-center justify-center mx-auto mb-6">
            <BookOpen size={32} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-3">Structure de la Langue</h1>
          <p className="text-sm text-gray-500 mb-8 max-w-md mx-auto">
            Test your French grammar and language structure skills. Grammar, articles, pronouns, tenses, and more!
          </p>

          <div className="bg-white border border-[#DEDDDA] rounded-lg p-5 mb-6 text-left">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">How it works</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <span className="text-[#6366F1] font-bold">60s</span>
                <span className="text-gray-600">Answer as many grammar questions as possible</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#6366F1] font-bold">+2 pts</span>
                <span className="text-gray-600">For each correct answer</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#6366F1] font-bold">+4 pts</span>
                <span className="text-gray-600">For consecutive correct answers</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#6366F1] font-bold">-2 pts</span>
                <span className="text-gray-600">For wrong answers</span>
              </li>
            </ul>
          </div>

          <div className="text-xs text-gray-500 mb-6">
            <span className="text-[#333333] font-bold">{currentRating}</span> current rating
          </div>

          <button
            onClick={startGame}
            className="w-full max-w-xs mx-auto bg-[#6366F1] text-white px-8 py-3 rounded font-bold text-sm hover:bg-[#6366F1]/90 transition-colors"
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
            <p className="text-sm text-gray-500">
              {gameResults.correct}/{gameResults.total} correct answers
            </p>
          </div>

          <div className="bg-white border border-[#DEDDDA] rounded-lg p-6 mb-4">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-[#6366F1]">{gameResults.score}</div>
                <div className="text-[10px] text-gray-400 uppercase tracking-wide">Score</div>
              </div>
              <div className="text-center">
                <div className={`text-3xl font-bold ${gameResults.ratingChange >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {gameResults.ratingChange >= 0 ? '+' : ''}{gameResults.ratingChange}
                </div>
                <div className="text-[10px] text-gray-400 uppercase tracking-wide">Rating</div>
              </div>
            </div>

            <div className="text-center mb-4">
              <div className="text-5xl font-bold">{gameResults.newRating}</div>
              <div className="text-xs text-gray-400 uppercase tracking-wide">New Rating</div>
            </div>

            <div className="text-center text-xs text-gray-400">
              Best streak: {gameResults.bestStreak}
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
              className="flex-1 py-2.5 rounded bg-[#6366F1] text-white text-xs font-bold hover:bg-[#6366F1]/90 transition-colors"
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
              <span className="text-sm font-bold">{score} pts</span>
            </div>
            {streak > 0 && (
              <div className="flex items-center gap-1 text-xs">
                <span>🔥</span>
                <span className="font-bold">{streak}</span>
              </div>
            )}
          </div>

          <div className={`px-4 py-2 rounded-lg font-bold text-2xl ${
            timeLeft <= 10 ? 'bg-red-500 text-white' : 'bg-[#6366F1] text-white'
          }`}>
            {timeLeft}s
          </div>
        </div>

        {currentQuestion && (
          <div>
            <div className="text-center mb-4">
              <div className="inline-flex items-center gap-2 text-[10px] text-gray-400 uppercase tracking-widest mb-2 font-bold">
                <span className="bg-[#6366F1]/10 text-[#6366F1] px-2 py-0.5 rounded">{currentQuestion.level}</span>
                <span>{currentQuestion.topic}</span>
              </div>
            </div>

            <div className="bg-white border border-[#DEDDDA] rounded-lg p-6 mb-6">
              <h2 className="text-xl font-bold text-center mb-6">
                {currentQuestion.question}
              </h2>

              <div className="grid grid-cols-2 gap-3">
                {currentQuestion.options.map((option, index) => {
                  const isSelected = selectedAnswer?.index === index;
                  const isCorrect = index === currentQuestion.correctIndex;
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

                  const optionLetter = ['A', 'B', 'C', 'D'][index];

                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswer(option, index)}
                      disabled={selectedAnswer !== null}
                      className={`p-4 rounded-lg text-left transition-all ${bgClass}`}
                    >
                      <span className="text-xs font-bold mr-2 opacity-50">{optionLetter}.</span>
                      <span className="text-sm">{option}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 text-center text-xs text-gray-400">
              {totalAnswered} · {correctAnswers} correct
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SDLBlitz;
