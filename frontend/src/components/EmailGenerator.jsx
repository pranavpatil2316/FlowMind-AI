import React, { useState } from 'react';
import { 
  Mail, 
  Sparkles, 
  Copy, 
  Check, 
  AlertCircle,
  Activity,
  FileText
} from 'lucide-react';
import axios from 'axios';
import { useTasks } from '../context/TaskContext';

const EmailGenerator = () => {
  const { addSuggestion } = useTasks();
  
  // Input parameters
  const [prompt, setPrompt] = useState('Requesting a 3-day project extension due to API integration blockages.');
  const [tone, setTone] = useState('Professional');
  const [recipient, setRecipient] = useState('Manager');
  const [loading, setLoading] = useState(false);
  
  // Output result
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isMock, setIsMock] = useState(false);
  const [generated, setGenerated] = useState(false);
  
  // Copy indicators
  const [copySubjectOk, setCopySubjectOk] = useState(false);
  const [copyBodyOk, setCopyBodyOk] = useState(false);
  const [copyAllOk, setCopyAllOk] = useState(false);

  const handleGenerateEmail = async (e) => {
    e.preventDefault();
    if (!prompt.trim() || loading) return;

    setLoading(true);
    setGenerated(false);
    setSubject('');
    setBody('');

    const finalPrompt = `Write an email to my ${recipient}. Tone: ${tone}. Context details: ${prompt}`;

    try {
      const response = await axios.post('/api/email', {
        prompt: finalPrompt
      });

      const data = response.data;
      setSubject(data.subject || 'Project Update Request');
      setBody(data.body || '');
      setIsMock(data.is_mock || false);
      setGenerated(true);

      addSuggestion(`Generated a ${tone} email to your ${recipient}.`);

    } catch (error) {
      console.error('Email error:', error);
      setSubject('Connection Error');
      setBody('Could not reach the AI email generator. Check backend connectivity.');
      setGenerated(true);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, setOkState) => {
    navigator.clipboard.writeText(text);
    setOkState(true);
    setTimeout(() => setOkState(false), 2000);
  };

  const copyFullEmail = () => {
    const fullText = `Subject: ${subject}\n\n${body}`;
    copyToClipboard(fullText, setCopyAllOk);
  };

  return (
    <div className="space-y-6 w-full animate-slide-up">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Setup Form */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-5 rounded-2xl border border-white/5 space-y-5">
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">Outreach parameters</h3>
              <p className="text-[11px] text-slate-400 mt-1">Specify email details, recipient, and the tone of correspondence.</p>
            </div>

            <form onSubmit={handleGenerateEmail} className="space-y-4.5">
              {/* Context Prompt */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Email Context Details</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. Asking for project delay explanation"
                  required
                  rows={4}
                  className="w-full px-3.5 py-2.5 text-sm glass-input resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Tone Select */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tone</label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs glass-input bg-slate-950/80 cursor-pointer"
                  >
                    <option value="Professional">Professional</option>
                    <option value="Casual">Casual</option>
                    <option value="Formal">Formal</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
                {/* Recipient Select */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Recipient</label>
                  <select
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs glass-input bg-slate-950/80 cursor-pointer"
                  >
                    <option value="Manager">Manager</option>
                    <option value="Client">Client</option>
                    <option value="Team members">Team members</option>
                    <option value="Partner">Partner</option>
                  </select>
                </div>
              </div>

              {/* Generate Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 active:scale-[0.98] disabled:bg-violet-600/30 disabled:text-slate-500 text-xs font-bold text-white shadow-lg shadow-violet-500/25 transition-all"
              >
                {loading ? (
                  <>
                    <Activity size={14} className="animate-spin" />
                    <span>Drafting Email...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    <span>Generate Email Draft</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Output Result */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main output placeholder */}
          {!generated && !loading && (
            <div className="glass-card py-28 text-center rounded-2xl border border-white/5 flex flex-col items-center justify-center animate-fade-in">
              <div className="w-12 h-12 rounded-2xl bg-slate-900/60 border border-white/5 flex items-center justify-center text-slate-400 mb-4 animate-float">
                <Mail size={20} />
              </div>
              <h3 className="text-sm font-bold text-white">Smart Email Draft Output</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-[280px] leading-relaxed">
                Provide outreach parameters on the left to review, structure, and copy generated emails.
              </p>
            </div>
          )}

          {loading && (
            <div className="glass-card py-28 text-center rounded-2xl border border-white/5 flex flex-col items-center justify-center animate-fade-in">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center mb-4 animate-spin">
                <Activity size={20} />
              </div>
              <h3 className="text-sm font-bold text-white animate-pulse">Consulting AI Writer...</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-[280px] leading-relaxed">
                Assembling professional salutations and formatting structural paragraphs.
              </p>
            </div>
          )}

          {generated && !loading && (
            <div className="glass-card p-5 md:p-6 rounded-2xl border border-white/5 space-y-5 flex flex-col h-full justify-between animate-fade-in">
              
              {/* Output Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wide">Generated Email Draft</h3>
                  {isMock && (
                    <div className="mt-1 flex items-start gap-1 p-1 rounded bg-amber-500/10 border border-amber-500/20 text-[9px] text-amber-400 w-fit">
                      <AlertCircle size={11} className="shrink-0 mt-0.5" />
                      <span>Demo Draft. Configure Gemini API for customized letters.</span>
                    </div>
                  )}
                </div>
                
                {/* Copy Full Email Button */}
                <button
                  onClick={copyFullEmail}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all active:scale-95 ${
                    copyAllOk
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-white/5 border-white/5 hover:border-violet-500/30 text-slate-300 hover:text-white'
                  }`}
                >
                  {copyAllOk ? <Check size={13} /> : <Copy size={13} />}
                  <span>{copyAllOk ? 'Copied Full Email' : 'Copy Full Email'}</span>
                </button>
              </div>

              {/* Subject Field Display */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Subject</span>
                  <button
                    onClick={() => copyToClipboard(subject, setCopySubjectOk)}
                    className="text-[10px] text-violet-400 hover:text-white flex items-center gap-1.5 transition-colors font-bold"
                  >
                    {copySubjectOk ? <Check size={11} /> : <Copy size={11} />}
                    <span>{copySubjectOk ? 'Copied' : 'Copy Subject'}</span>
                  </button>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950/40 border border-white/5 text-xs md:text-sm text-white font-bold leading-normal">
                  {subject}
                </div>
              </div>

              {/* Body Field Display */}
              <div className="space-y-2 flex-1 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Message Body</span>
                  <button
                    onClick={() => copyToClipboard(body, setCopyBodyOk)}
                    className="text-[10px] text-violet-400 hover:text-white flex items-center gap-1.5 transition-colors font-bold"
                  >
                    {copyBodyOk ? <Check size={11} /> : <Copy size={11} />}
                    <span>{copyBodyOk ? 'Copied' : 'Copy Body'}</span>
                  </button>
                </div>
                <div className="p-4 rounded-xl bg-slate-950/40 border border-white/5 text-xs md:text-sm text-slate-200 font-medium leading-relaxed whitespace-pre-wrap font-sans min-h-[220px] flex-1">
                  {body}
                </div>
              </div>
              
              <div className="p-3.5 rounded-xl bg-cyan-500/5 border border-cyan-500/10 text-[10px] text-cyan-400 flex items-start gap-2.5 leading-relaxed mt-2 font-semibold">
                <FileText size={14} className="shrink-0 mt-0.5 text-cyan-400" />
                <span>You can edit the placeholders (like <strong>[Your Name]</strong>) after copying the draft into your mailing client.</span>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default EmailGenerator;
