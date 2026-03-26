import { Link } from 'react-router-dom';
import MainNavbar from '../../components/MainNavbar';
import { Search, GraduationCap } from 'lucide-react';

const Tools = () => {
  const tools = [
    {
      id: 'search',
      name: 'Verb Search',
      description: 'Search for any French verb and view its complete conjugation across all moods and tenses.',
      icon: Search,
      color: '#6366F1',
      href: '/tools/search',
    },
    {
      id: 'flashcards',
      name: 'Flashcards',
      description: 'Practice verb conjugations with flashcards. Test your memory and track your progress.',
      icon: GraduationCap,
      color: '#EB3514',
      comingSoon: true,
    },
  ];

  return (
    <div className="min-h-screen font-mono bg-[#F0EFEB] text-[#333333]">
      <MainNavbar />
      
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Tools</h1>
          <p className="text-sm text-gray-500">Useful tools to help you master French verbs</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tools.map((tool) => {
            const Icon = tool.icon;
            const isDisabled = tool.comingSoon;
            
            const cardContent = (
              <div
                className={`p-6 bg-[#F0EFEB] border border-[#DEDDDA] rounded-lg transition-all ${
                  isDisabled 
                    ? 'opacity-60 cursor-not-allowed' 
                    : 'hover:border-[#6366F1] hover:bg-[#EAE9E4] cursor-pointer'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0 bg-white border border-[#DEDDDA]"
                    style={{ color: tool.color }}
                  >
                    <Icon size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-[#333333]">{tool.name}</h3>
                      {isDisabled && (
                        <span className="text-xs font-bold text-[#EB3514] uppercase tracking-wide">
                          Coming Soon
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">{tool.description}</p>
                  </div>
                </div>
              </div>
            );
            
            if (isDisabled) {
              return <div key={tool.id}>{cardContent}</div>;
            }
            
            return (
              <Link key={tool.id} to={tool.href}>
                {cardContent}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Tools;
