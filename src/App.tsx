import React, { useState } from 'react';
import { Play, Code2, CheckCircle2, XCircle, Loader2, Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TestCaseResult {
  input: string;
  expected: string;
  actual: string;
  passed: boolean;
  stderr: string | null;
  compile_output: string | null;
  time: string | null;
}

export default function App() {
  const [code, setCode] = useState('print("Hello, World!")');
  const [language, setLanguage] = useState('python');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<TestCaseResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runCode = async () => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch('/api/run-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          language,
          testCases: [
            { input: '', expectedOutput: 'Hello, World!' }
          ]
        })
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Server error (${response.status}): ${text || response.statusText}`);
      }

      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setResults(data.results);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-zinc-300 font-sans selection:bg-emerald-500/30">
      {/* Header */}
      <header className="border-b border-white/5 bg-black/20 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Code2 className="w-5 h-5 text-black" />
            </div>
            <h1 className="text-lg font-semibold tracking-tight text-white">RunIt</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-zinc-900 border border-white/10 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
            >
              <option value="python">Python 3</option>
              <option value="cpp">C++ (GCC 9)</option>
              <option value="javascript">JavaScript (Node.js)</option>
              <option value="typescript">TypeScript</option>
              <option value="java">Java (OpenJDK 13)</option>
              <option value="c">C (GCC 9)</option>
              <option value="go">Go</option>
              <option value="rust">Rust</option>
              <option value="kotlin">Kotlin</option>
              <option value="csharp">C#</option>
            </select>
            
            <button
              onClick={runCode}
              disabled={loading}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold px-4 py-1.5 rounded-md transition-all shadow-lg shadow-emerald-500/10"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
              Run Code
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-80px)]">
        {/* Editor Area */}
        <div className="flex flex-col gap-4">
          <div className="flex-1 bg-zinc-900/50 rounded-xl border border-white/5 overflow-hidden flex flex-col">
            <div className="px-4 py-2 bg-white/5 border-b border-white/5 flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-widest text-zinc-500">Source Code</span>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="flex-1 w-full bg-transparent p-6 font-mono text-sm resize-none focus:outline-none text-emerald-50/90 leading-relaxed"
              spellCheck={false}
            />
          </div>
        </div>

        {/* Output Area */}
        <div className="flex flex-col gap-4">
          <div className="flex-1 bg-zinc-900/50 rounded-xl border border-white/5 overflow-hidden flex flex-col">
            <div className="px-4 py-2 bg-white/5 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-zinc-500" />
                <span className="text-xs font-mono uppercase tracking-widest text-zinc-500">Execution Output</span>
              </div>
            </div>
            
            <div className="flex-1 p-6 overflow-y-auto">
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="h-full flex flex-col items-center justify-center gap-4 text-zinc-500"
                  >
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                    <p className="text-sm animate-pulse">Executing on Judge0...</p>
                  </motion.div>
                ) : results ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    {results.map((res, i) => (
                      <div key={i} className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {res.passed ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                            ) : (
                              <XCircle className="w-5 h-5 text-rose-500" />
                            )}
                            <span className={`font-semibold ${res.passed ? 'text-emerald-500' : 'text-rose-500'}`}>
                              {res.passed ? 'Test Case Passed' : 'Test Case Failed'}
                            </span>
                          </div>
                          {res.time && (
                            <span className="text-xs font-mono text-zinc-500 bg-white/5 px-2 py-1 rounded">
                              {res.time}s
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Expected Output</span>
                            <pre className="bg-black/40 p-3 rounded-lg text-xs font-mono border border-white/5 min-h-[40px]">
                              {res.expected || '(empty)'}
                            </pre>
                          </div>
                          <div className="space-y-1.5">
                            <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Actual Output</span>
                            <pre className={`bg-black/40 p-3 rounded-lg text-xs font-mono border border-white/5 min-h-[40px] ${res.passed ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {res.actual || '(empty)'}
                            </pre>
                          </div>
                        </div>

                        {(res.stderr || res.compile_output) && (
                          <div className="space-y-1.5">
                            <span className="text-[10px] uppercase tracking-wider text-rose-500/70 font-bold">Error Logs</span>
                            <pre className="bg-rose-500/5 p-3 rounded-lg text-xs font-mono border border-rose-500/10 text-rose-300 whitespace-pre-wrap">
                              {res.stderr || res.compile_output}
                            </pre>
                          </div>
                        )}
                      </div>
                    ))}
                  </motion.div>
                ) : error ? (
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-sm flex items-start gap-3"
                  >
                    <XCircle className="w-5 h-5 shrink-0" />
                    <div>
                      <p className="font-bold mb-1">Execution Error</p>
                      <p className="opacity-80">{error}</p>
                      <p className="mt-2 text-xs opacity-60 italic">Ensure JUDGE0_HOST is correctly configured in your environment.</p>
                    </div>
                  </motion.div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-zinc-600 gap-3">
                    <Terminal className="w-12 h-12 opacity-20" />
                    <p className="text-sm italic">Click "Run Code" to see results</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
