
import React, { useState, useRef, useEffect } from 'react';
import { Medication } from '../types';
import { askAssistant } from '../services/geminiService';
import { SparklesIcon } from './Icons';

interface AssistantViewProps {
  medications: Medication[];
}

const AssistantView: React.FC<AssistantViewProps> = ({ medications }) => {
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', text: string}[]>([
    { role: 'assistant', text: 'Olá, mãe! Sou o seu Assistente Cuidador. Tem alguma dúvida sobre seus remédios?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    const response = await askAssistant(userMsg, medications);
    
    setMessages(prev => [...prev, { role: 'assistant', text: response }]);
    setIsLoading(false);
  };

  const suggestions = [
    "Para que serve a Losartana?",
    "Esqueci meu remédio, o que eu faço?",
    "Dicas para não esquecer as doses"
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] animate-in slide-in-from-bottom duration-500">
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] p-4 rounded-2xl ${
              msg.role === 'user' 
                ? 'bg-rose-500 text-white rounded-tr-none' 
                : 'bg-white text-slate-700 shadow-sm border border-slate-100 rounded-tl-none'
            }`}>
              {msg.role === 'assistant' && (
                <div className="flex items-center gap-1 mb-1">
                  <SparklesIcon />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-rose-500">Assistente</span>
                </div>
              )}
              <p className="text-sm leading-relaxed">{msg.text}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm flex gap-1">
              <div className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-bounce delay-100"></div>
              <div className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-bounce delay-200"></div>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      <div className="mt-4">
        {messages.length < 3 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {suggestions.map((s, i) => (
              <button 
                key={i} 
                onClick={() => setInput(s)}
                className="text-xs bg-white border border-slate-200 px-3 py-2 rounded-full text-slate-600 hover:border-rose-400 active:scale-95 transition-all"
              >
                {s}
              </button>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <input 
            type="text" 
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleSend()}
            placeholder="Pergunte algo aqui..."
            className="flex-1 bg-white border-slate-200 border rounded-2xl p-4 text-sm focus:ring-2 focus:ring-rose-500 outline-none shadow-sm"
          />
          <button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-rose-500 text-white w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg active:scale-90 transition-all disabled:opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssistantView;
