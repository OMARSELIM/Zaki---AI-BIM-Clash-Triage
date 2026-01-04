import React, { useState, useEffect, useRef } from 'react';
import { Upload, Cpu, Download, Sparkles, Loader2, AlertTriangle, Play } from 'lucide-react';
import { RawClashData, EnrichedClash, ClashStatus, ClashSeverity, Discipline } from './types';
import { parseClashCSV, downloadCSV } from './utils/csv';
import { initializeGemini, analyzeClashBatch } from './services/geminiService';
import ClashStats from './components/ClashStats';
import ClashTable from './components/ClashTable';

const BATCH_SIZE = 10;

function App() {
  const [apiKey, setApiKey] = useState(process.env.API_KEY || '');
  const [clashes, setClashes] = useState<EnrichedClash[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  
  // Ref to track processing state across renders to stop if needed
  const shouldStopRef = useRef(false);

  useEffect(() => {
    // Auto-init if key is present
    if (process.env.API_KEY) {
       initializeGemini(process.env.API_KEY);
    }
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    processFile(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const processFile = (file: File | undefined) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const rawData = parseClashCSV(text);
      
      const initialEnriched: EnrichedClash[] = rawData.map(c => ({
        ...c,
        status: ClashStatus.PENDING,
        aiSeverity: ClashSeverity.UNKNOWN,
        aiResponsibility: Discipline.UNKNOWN,
        aiDescription: ''
      }));

      setClashes(initialEnriched);
      setProgress(0);
    };
    reader.readAsText(file);
  };

  const startAnalysis = async () => {
    if (clashes.length === 0) return;
    setIsProcessing(true);
    shouldStopRef.current = false;

    // Split into pending items
    const pendingClashes = clashes.filter(c => c.status === ClashStatus.PENDING);
    let processedCount = clashes.length - pendingClashes.length;

    // Process in batches
    for (let i = 0; i < pendingClashes.length; i += BATCH_SIZE) {
      if (shouldStopRef.current) break;

      const batch = pendingClashes.slice(i, i + BATCH_SIZE);
      
      // Update status to processing for UI feedback
      setClashes(prev => prev.map(c => 
        batch.find(b => b.id === c.id) 
          ? { ...c, status: ClashStatus.PROCESSING } 
          : c
      ));

      // Call AI
      const response = await analyzeClashBatch(batch);

      // Update with results
      setClashes(prev => prev.map(c => {
        const result = response?.results.find(r => r.id === c.id);
        if (result) {
          return {
            ...c,
            status: ClashStatus.COMPLETED,
            aiSeverity: result.severity,
            aiResponsibility: result.responsibility,
            aiDescription: result.description,
            aiReasoning: result.reasoning
          };
        }
        // If it was in the batch but failed/no result, mark failed or revert
        return batch.find(b => b.id === c.id) 
          ? { ...c, status: ClashStatus.FAILED } 
          : c;
      }));

      processedCount += batch.length;
      setProgress(Math.round((processedCount / clashes.length) * 100));
      
      // Small delay to be nice to the API
      await new Promise(r => setTimeout(r, 500));
    }

    setIsProcessing(false);
  };

  const handleExport = () => {
    const exportData = clashes.map(c => ({
      ID: c.id,
      'Item 1': c.item1,
      'Item 2': c.item2,
      Distance: c.distance,
      'AI Status': c.status,
      'AI Severity': c.aiSeverity,
      'AI Responsibility': c.aiResponsibility,
      'AI Description': c.aiDescription
    }));
    downloadCSV(exportData, 'zaki_triage_export.csv');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-slate-800">
      
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">Zaki <span className="text-indigo-600">AI</span></h1>
              <p className="text-xs text-gray-500 font-medium">BIM Clash Triage Tool</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {!process.env.API_KEY && (
               <div className="hidden md:flex items-center text-xs text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                 <AlertTriangle className="w-3 h-3 mr-1" />
                 Missing API Key
               </div>
            )}
             <a href="#" className="text-sm font-medium text-gray-500 hover:text-gray-900">Documentation</a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        {/* Upload Section - Only show if no data */}
        {clashes.length === 0 && (
          <div className="max-w-xl mx-auto mt-20">
             <div 
              className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-200 ease-in-out
                ${dragActive ? 'border-indigo-500 bg-indigo-50 scale-105' : 'border-gray-300 hover:border-indigo-400 bg-white'}
              `}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
             >
               <div className="bg-indigo-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                 <Upload className="w-8 h-8 text-indigo-600" />
               </div>
               <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Navisworks CSV</h3>
               <p className="text-gray-500 mb-6 text-sm">Drag and drop your clash report here, or click to browse.</p>
               
               <label className="relative inline-flex items-center justify-center px-6 py-3 overflow-hidden font-medium text-white transition duration-300 ease-out border-2 border-indigo-600 rounded-lg shadow-md group cursor-pointer">
                <span className="absolute inset-0 flex items-center justify-center w-full h-full text-white duration-300 -translate-x-full bg-indigo-700 group-hover:translate-x-0 ease">
                  <Upload className="w-5 h-5" />
                </span>
                <span className="absolute flex items-center justify-center w-full h-full text-indigo-600 transition-all duration-300 transform group-hover:translate-x-full ease bg-white">Import CSV</span>
                <span className="relative invisible">Import CSV</span>
                <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
              </label>
             </div>
             <p className="text-center text-xs text-gray-400 mt-6">
               Supports standard Navisworks HTML reports exported to CSV.
             </p>
          </div>
        )}

        {/* Dashboard View - Show if data exists */}
        {clashes.length > 0 && (
          <div className="flex flex-col h-[calc(100vh-140px)]">
            
            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
               <div>
                  <h2 className="text-2xl font-bold text-gray-900">Clash Report</h2>
                  <p className="text-sm text-gray-500">Loaded {clashes.length} items</p>
               </div>
               
               <div className="flex items-center gap-3">
                 {/* Progress Bar if processing */}
                 {isProcessing && (
                   <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm mr-2">
                      <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
                      <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-600 transition-all duration-300" style={{ width: `${progress}%` }}></div>
                      </div>
                      <span className="text-xs font-mono text-gray-600">{progress}%</span>
                   </div>
                 )}

                 {!isProcessing && progress < 100 && (
                   <button 
                    onClick={startAnalysis}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg shadow-sm transition-all font-medium"
                   >
                     <Play className="w-4 h-4 fill-current" />
                     Start AI Triage
                   </button>
                 )}

                 <button 
                  onClick={handleExport}
                  className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-4 py-2.5 rounded-lg shadow-sm transition-all font-medium"
                 >
                   <Download className="w-4 h-4" />
                   Export CSV
                 </button>
                 
                 <button 
                   onClick={() => setClashes([])}
                   className="text-gray-400 hover:text-red-500 px-2 transition-colors"
                   title="Clear Data"
                 >
                   <span className="sr-only">Clear</span>
                   ×
                 </button>
               </div>
            </div>

            {/* Stats Area */}
            <ClashStats clashes={clashes} />

            {/* Table Area */}
            <div className="flex-1 min-h-0">
               <ClashTable clashes={clashes} />
            </div>
            
          </div>
        )}

      </main>
    </div>
  );
}

export default App;
