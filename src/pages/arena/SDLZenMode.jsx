import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import MainNavbar from '../../components/MainNavbar';
import { useAuth } from '../../context/AuthContext';
import { ref, update, get } from 'firebase/database';
import { database } from '../../lib/firebase';
import { toast } from 'sonner';
import { Brain, ArrowLeft, BookOpen } from 'lucide-react';
import correctSound from '../../assets/correct.mp3';
import wrongSound from '../../assets/wrong.mp3';
import sdlQuestions from '../../assets/Questions/sdl.json';

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

const TOPICS = [
  'conjugaison', 'articles', 'interrogation', 'accord', 'temps du passé',
  'possessifs', 'futur', 'pronoms', 'pronoms relatifs', 'subjonctif',
  'conditionnel', 'prépositions', 'connecteurs logiques', 'concession',
  'concordance des temps', 'infinitif', 'syntaxe', 'negation', 'idiomes',
  'vocabulaire', 'adverbes', 'gérondif', 'quantité', 'registre', 'indicatif'
];

const SDLZenMode = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [gameState, setGameState] = useState('setup');
  const [selectedLevels, setSelectedLevels] = useState(['A1']);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [usedQuestionIds, setUsedQuestionIds] = useState(new Set());

  const correctRef = useRef(0);
  const wrongRef = useRef(0);

  useEffect(() => {
    correctRef.current = correct;
    wrongRef.current = wrong;
  }, [correct, wrong]);

  const getFilteredQuestions = useCallback(() => {
    return sdlQuestions.filter(q => {
      const levelMatch = selectedLevels.length === 0 || selectedLevels.includes(q.level);
      const topicMatch = selectedTopics.length === 0 || selectedTopics.includes(q.topic);
      return levelMatch && topicMatch && !usedQuestionIds.has(q.id);
    });
  }, [selectedLevels, selectedTopics, usedQuestionIds]);

  const toggleLevel = (level) => {
    setSelectedLevels(prev => {
      if (prev.includes(level)) {
        if (prev.length === 1) return prev;
        return prev.filter(l => l !== level);
      }
      return [...prev, level];
    });
  };

  const toggleTopic = (topic) => {
    setSelectedTopics(prev => {
      if (prev.includes(topic)) {
        return prev.filter(t => t !== topic);
      }
      return [...prev, topic];
    });
  };

  const selectAllLevels = () => {
    setSelectedLevels([...LEVELS]);
  };

  const selectAllTopics = () => {
    setSelectedTopics([...TOPICS]);
  };

  const clearTopics = () => {
    setSelectedTopics([]);
  };

  const loadNextQuestion = useCallback(() => {
    setShowExplanation(false);
    setSelectedAnswer(null);

    const available = getFilteredQuestions();

    if (available.length === 0) {
      if (usedQuestionIds.size >= sdlQuestions.length) {
        setUsedQuestionIds(new Set());
        return loadNextQuestion();
      }
      toast.error('No more questions available with current filters');
      return;
    }

    const randomIndex = Math.floor(Math.random() * available.length);
    const q = available[randomIndex];

    const correctIndex = ['A', 'B', 'C', 'D'].indexOf(q.correct_answer);
    const correctAnswer = q.options[correctIndex];
    const shuffledOptions = [...q.options].sort(() => Math.random() - 0.5);

    setCurrentQuestion({
      id: q.id,
      question: q.question,
      options: shuffledOptions,
      correctAnswer,
      correctIndex: shuffledOptions.indexOf(correctAnswer),
      level: q.level,
      topic: q.topic,
      explanation: q.explanation,
    });
    setUsedQuestionIds(prev => new Set([...prev, q.id]));
  }, [getFilteredQuestions, usedQuestionIds]);

  const startGame = async () => {
    if (!user) {
      toast.error('Please log in to play');
      navigate('/login');
      return;
    }

    if (selectedLevels.length === 0) {
      toast.error('Please select at least one level');
      return;
    }

    const available = sdlQuestions.filter(q => {
      const levelMatch = selectedLevels.includes(q.level);
      const topicMatch = selectedTopics.length === 0 || selectedTopics.includes(q.topic);
      return levelMatch && topicMatch;
    });

    if (available.length === 0) {
      toast.error('No questions available with current filters');
      return;
    }

    correctRef.current = 0;
    wrongRef.current = 0;
    setCorrect(0);
    setWrong(0);
    setUsedQuestionIds(new Set());
    setGameState('playing');

    loadNextQuestion();
  };

  const handleAnswer = async (answer, index) => {
    if (selectedAnswer !== null || !currentQuestion) return;

    const isCorrect = index === currentQuestion.correctIndex;
    setSelectedAnswer({ answer, index });

    if (isCorrect) {
      correctRef.current += 1;
      setCorrect(correctRef.current);
      new Audio(correctSound).play().catch(() => {});
    } else {
      wrongRef.current += 1;
      setWrong(wrongRef.current);
      new Audio(wrongSound).play().catch(() => {});
    }

    setShowExplanation(true);
  };

  const handleNext = async () => {
    await loadNextQuestion();
  };

  const endGame = async () => {
    setGameState('ended');

    if (user && (correctRef.current > 0 || wrongRef.current > 0)) {
      try {
        const statsRef = ref(database, `users/${user.uid}/stats/sdlzen`);
        const snapshot = await get(statsRef);
        const currentStats = snapshot.exists() ? snapshot.val() : { correct: 0, wrong: 0 };

        await update(ref(database), {
          [`users/${user.uid}/stats/sdlzen`]: {
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
    return (
      <div className="min-h-screen font-mono bg-[#F0EFEB] text-[#333333]">
        <MainNavbar />
        <div className="max-w-xl mx-auto px-6 py-16 text-center">
          <div className="w-16 h-16 rounded-lg bg-[#059669] flex items-center justify-center mx-auto mb-6">
            <Brain size={32} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-3">SDL Zen</h1>
          <p className="text-sm text-gray-500 mb-8 max-w-md mx-auto">
            Practice French grammar at your own pace. Choose your level and topics, then learn from explanations.
          </p>

          <div className="bg-white border border-[#DEDDDA] rounded-lg p-6 mb-4 text-left">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Select Levels</h3>
              <button
                onClick={selectAllLevels}
                className="text-xs text-[#059669] hover:underline"
              >
                Select All
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {LEVELS.map((level) => (
                <button
                  key={level}
                  onClick={() => toggleLevel(level)}
                  className={`p-3 rounded-lg border text-sm font-bold transition-all ${
                    selectedLevels.includes(level)
                      ? 'bg-[#059669] text-white border-[#059669]'
                      : 'bg-white border-[#DEDDDA] hover:border-[#059669]'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white border border-[#DEDDDA] rounded-lg p-6 mb-6 text-left">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Select Topics (Optional)</h3>
              <div className="flex gap-3">
                <button
                  onClick={selectAllTopics}
                  className="text-xs text-[#059669] hover:underline"
                >
                  All
                </button>
                <button
                  onClick={clearTopics}
                  className="text-xs text-gray-400 hover:underline"
                >
                  Clear
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {TOPICS.map((topic) => (
                <button
                  key={topic}
                  onClick={() => toggleTopic(topic)}
                  className={`p-2 rounded border text-xs font-bold transition-all truncate ${
                    selectedTopics.includes(topic)
                      ? 'bg-[#059669] text-white border-[#059669]'
                      : 'bg-white border-[#DEDDDA] hover:border-[#059669]'
                  }`}
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={startGame}
            disabled={selectedLevels.length === 0}
            className="w-full max-w-xs mx-auto bg-[#059669] text-white px-8 py-3 rounded font-bold text-sm hover:bg-[#059669]/90 transition-colors disabled:opacity-50"
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
              <div className="text-5xl font-bold text-[#059669] mb-1">{ratio}%</div>
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
              className="flex-1 py-2.5 rounded bg-[#059669] text-white text-xs font-bold hover:bg-[#059669]/90 transition-colors"
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

          <div className="text-sm font-bold text-[#059669]">
            {ratio}%
          </div>
        </div>

        {currentQuestion && (
          <div>
            <div className="text-center mb-4">
              <div className="inline-flex items-center gap-2 text-[10px] text-gray-400 uppercase tracking-widest mb-2 font-bold">
                <span className="bg-[#059669]/10 text-[#059669] px-2 py-0.5 rounded">{currentQuestion.level}</span>
                <span>{currentQuestion.topic}</span>
              </div>
            </div>

            <div className="bg-white border border-[#DEDDDA] rounded-lg p-6 mb-4">
              <h2 className="text-xl font-bold text-center mb-6">
                {currentQuestion.question}
              </h2>

              <div className="grid grid-cols-2 gap-3">
                {currentQuestion.options.map((option, index) => {
                  const isSelected = selectedAnswer?.index === index;
                  const isCorrect = index === currentQuestion.correctIndex;
                  const showResult = selectedAnswer !== null;

                  let bgClass = 'bg-white border border-[#DEDDDA] hover:border-[#059669]';
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

            {showExplanation && (
              <div className="bg-[#059669]/5 border border-[#059669]/20 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <BookOpen size={18} className="text-[#059669] shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[10px] font-bold text-[#059669] uppercase tracking-wider mb-1">Explanation</div>
                    <p className="text-sm text-gray-700">{currentQuestion.explanation}</p>
                  </div>
                </div>
              </div>
            )}

            {showExplanation && (
              <button
                onClick={handleNext}
                className="w-full py-3 rounded-lg bg-[#059669] text-white font-bold text-sm hover:bg-[#059669]/90 transition-colors"
              >
                Next Question
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SDLZenMode;
