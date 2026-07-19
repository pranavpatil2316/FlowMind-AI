import React, { useState, useRef } from 'react';
import { 
  FileText, 
  Upload, 
  X, 
  Activity, 
  Sparkles, 
  Plus, 
  Check, 
  AlertCircle,
  TrendingUp,
  FileCheck
} from 'lucide-react';
import axios from 'axios';
import { useTasks } from '../context/TaskContext';

const PdfSummarizer = () => {
  const { addTasks, addSuggestion } = useTasks();
  
  // File Upload states
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Output result states
  const [summary, setSummary] = useState('');
  const [keyPoints, setKeyPoints] = useState([]);
  const [actionItems, setActionItems] = useState([]);
  const [isMock, setIsMock] = useState(false);
  const [generated, setGenerated] = useState(false);
  
  // Checklist tracker inside summarizer
  const [checkedActions, setCheckedActions] = useState({});
  const [selectedActionsToImport, setSelectedActionsToImport] = useState([]);
  const [imported, setImported] = useState(false);

  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'application/pdf') {
        setFile(droppedFile);
        setErrorMsg('');
      } else {
        setErrorMsg('Only PDF files are supported.');
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
        setErrorMsg('');
      } else {
        setErrorMsg('Only PDF files are supported.');
      }
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setGenerated(false);
    setSummary('');
    setKeyPoints([]);
    setActionItems([]);
    setImported(false);
    setSelectedActionsToImport([]);
    setCheckedActions({});
  };

  const handleAnalyzePdf = async (e) => {
    e.preventDefault();
    if (!file || loading) return;

    setLoading(true);
    setGenerated(false);
    setImported(false);
    setErrorMsg('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('/api/pdf', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const data = response.data;
      setSummary(data.summary || '');
      setKeyPoints(data.key_points || []);
      
      const items = data.action_items || [];
      setActionItems(items);
      setSelectedActionsToImport(items);
      
      setIsMock(data.is_mock || false);
      setGenerated(true);

      addSuggestion(`Summarized PDF document: ${file.name}`);

    } catch (error) {
      console.error('PDF Summarizer Error:', error);
      setErrorMsg(error.response?.data?.detail || 'Failed to parse the PDF. Ensure backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  const toggleActionCheckbox = (item) => {
    setCheckedActions(prev => ({
      ...prev,
      [item]: !prev[item]
    }));
  };

  const toggleImportSelection = (item) => {
    setSelectedActionsToImport(prev => 
      prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item]
    );
  };

  const handleImportTasks = () => {
    if (selectedActionsToImport.length === 0) return;
    
    const tasksToImport = selectedActionsToImport.map(item => ({
      title: item,
      description: `Action item extracted from PDF: ${file.name}`,
      priority: 'Medium',
      duration: '30 mins'
    }));

    addTasks(tasksToImport);
    setImported(true);
  };

  return (
    <div className="space-y-6 w-full animate-slide-up">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Upload Zone */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-5 rounded-2xl border border-white/5 space-y-5">
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">Document Upload</h3>
              <p className="text-[11px] text-slate-400 mt-1">Upload a PDF document to summarize concepts and extract key tasks.</p>
            </div>

            {/* Drag and Drop Zone */}
            {!file ? (
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current.click()}
                className={`border border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                  dragActive 
                    ? 'border-violet-500 bg-violet-600/5' 
                    : 'border-white/10 hover:border-violet-500/50 bg-white/[0.01]'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf"
                  className="hidden"
                  aria-label="Upload PDF Document"
                />
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 mx-auto mb-3 animate-float-slow">
                  <Upload size={18} />
                </div>
                <h4 className="text-xs font-bold text-slate-200">Drag and drop file here</h4>
                <p className="text-[10px] text-slate-500 mt-1">or click to browse local files</p>
                <p className="text-[9px] text-slate-600 mt-4 font-bold">Supports PDF up to 10MB</p>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl border border-white/5 bg-slate-950/40 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileText size={16} className="text-cyan-400 shrink-0" />
                  <div className="truncate">
                    <span className="font-bold text-slate-200 block truncate leading-none">{file.name}</span>
                    <span className="text-[10px] text-slate-500 font-bold block mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                </div>
                <button
                  onClick={handleRemoveFile}
                  className="p-1 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Error Message */}
            {errorMsg && (
              <div className="flex items-start gap-1.5 p-2.5 rounded-lg bg-red-500/10 border border-red-500/25 text-[10px] text-red-400 font-bold">
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Analyze Button */}
            {file && (
              <button
                onClick={handleAnalyzePdf}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 active:scale-[0.98] disabled:bg-violet-600/30 disabled:text-slate-500 text-xs font-bold text-white shadow-lg shadow-violet-500/25 transition-all"
              >
                {loading ? (
                  <>
                    <Activity size={14} className="animate-spin" />
                    <span>Analyzing PDF Content...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    <span>Summarize Document</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Right Side: Output Summary Cards */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Output placeholder */}
          {!generated && !loading && (
            <div className="glass-card py-28 text-center rounded-2xl border border-white/5 flex flex-col items-center justify-center animate-fade-in">
              <div className="w-12 h-12 rounded-2xl bg-slate-900/60 border border-white/5 flex items-center justify-center text-slate-400 mb-4 animate-float">
                <FileText size={20} />
              </div>
              <h3 className="text-sm font-bold text-white">Document Intelligence Workspace</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-[280px] leading-relaxed">
                Upload a PDF document on the left to extract concept summaries, key insights, and actionable task checkers.
              </p>
            </div>
          )}

          {loading && (
            <div className="glass-card py-28 text-center rounded-2xl border border-white/5 flex flex-col items-center justify-center animate-fade-in">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center mb-4 animate-spin">
                <Activity size={20} />
              </div>
              <h3 className="text-sm font-bold text-white animate-pulse">Running Optical OCR & AI Brain...</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-[280px] leading-relaxed">
                Parsing document segments and generating vector embeddings for text summarization.
              </p>
            </div>
          )}

          {generated && !loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
              
              {/* Summary and Key Points */}
              <div className="glass-card p-5 md:p-6 rounded-2xl border border-white/5 space-y-5">
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wide">Document Analysis</h3>
                  {isMock && (
                    <div className="mt-2 flex items-start gap-1 p-2 rounded bg-amber-500/10 border border-amber-500/20 text-[9px] text-amber-400">
                      <AlertCircle size={12} className="shrink-0 mt-0.5" />
                      <span>Demo Summary. Add Gemini API Key to summarize actual text.</span>
                    </div>
                  )}
                </div>

                {/* Summary text */}
                <div className="space-y-1.5">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide block">Concept Summary</span>
                  <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-semibold">
                    {summary}
                  </p>
                </div>

                {/* Bullet Points */}
                {keyPoints.length > 0 && (
                  <div className="space-y-3 pt-3 border-t border-white/[0.04]">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide block">Core Insights</span>
                    <ul className="space-y-3">
                      {keyPoints.map((point, idx) => (
                        <li key={idx} className="flex gap-2.5 text-[11px] text-slate-300 leading-relaxed font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Action items checklist */}
              {actionItems.length > 0 && (
                <div className="glass-card p-5 md:p-6 rounded-2xl border border-white/5 flex flex-col justify-between h-full">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                      <div className="flex items-center gap-1.5">
                        <FileCheck size={16} className="text-cyan-400" />
                        <h3 className="text-sm font-bold text-white tracking-wide">Action Items</h3>
                      </div>
                      
                      {imported ? (
                        <span className="flex items-center gap-0.5 text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/15">
                          <Check size={11} />
                          <span>Imported</span>
                        </span>
                      ) : (
                        <button
                          onClick={handleImportTasks}
                          disabled={selectedActionsToImport.length === 0}
                          className="flex items-center gap-1 text-[10px] text-violet-400 hover:text-white disabled:text-slate-600 disabled:bg-transparent font-bold bg-violet-500/10 hover:bg-violet-600 border border-violet-500/20 px-2.5 py-1.5 rounded-xl transition-all active:scale-95"
                        >
                          <Plus size={11} />
                          <span>Import Selected ({selectedActionsToImport.length})</span>
                        </button>
                      )}
                    </div>

                    <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                      {actionItems.map((item, idx) => {
                        const isChecked = !!checkedActions[item];
                        const isImportSelected = selectedActionsToImport.includes(item);

                        return (
                          <div 
                            key={idx} 
                            className={`p-3 rounded-xl bg-white/[0.01] border flex items-start gap-3 transition-colors ${
                              isChecked 
                                ? 'border-emerald-500/10 bg-emerald-500/[0.01] opacity-70' 
                                : 'border-white/[0.03] hover:border-white/10'
                            }`}
                          >
                            {/* Left checkbox */}
                            <button
                              onClick={() => toggleActionCheckbox(item)}
                              className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                                isChecked 
                                  ? 'bg-emerald-500 border-emerald-500 text-slate-950' 
                                  : 'border-slate-700 hover:border-slate-500'
                              }`}
                            >
                              {isChecked && <Check size={10} strokeWidth={3.5} />}
                            </button>

                            {/* Middle text */}
                            <span 
                              className={`text-[11px] font-semibold leading-relaxed flex-1 ${
                                isChecked ? 'line-through text-slate-500' : 'text-slate-300'
                              }`}
                            >
                              {item}
                            </span>

                            {/* Right checkbox */}
                            {!imported && (
                              <input
                                type="checkbox"
                                checked={isImportSelected}
                                onChange={() => toggleImportSelection(item)}
                                className="rounded border-slate-750 text-violet-600 focus:ring-violet-500 shrink-0 mt-0.5 cursor-pointer"
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="p-3 bg-white/[0.015] border border-white/[0.04] rounded-xl text-[10px] text-slate-400 mt-4 leading-relaxed flex gap-2 font-semibold">
                    <TrendingUp size={13} className="text-cyan-400 shrink-0 mt-0.5" />
                    <span>Select the boxes on the right to import specific action items directly into your active Task Manager list.</span>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default PdfSummarizer;
