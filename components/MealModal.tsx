
import React, { useState, useRef, useEffect } from 'react';
import { Meal } from '../types';
import { X, Camera, Mic, Sparkles, ChevronRight, PlayCircle } from 'lucide-react';
import { parseMealMultimodal } from '../services/geminiService';

interface MealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (meal: Omit<Meal, 'id' | 'timestamp'>) => void;
  editingMeal?: Meal | null;
}

const MealModal: React.FC<MealModalProps> = ({ isOpen, onClose, onSave, editingMeal }) => {
  const [aiInput, setAiInput] = useState('');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [capturedAudio, setCapturedAudio] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [adWatchCount, setAdWatchCount] = useState(0);
  
  const [manualMeal, setManualMeal] = useState({
    name: '',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (!isOpen) {
      resetStates();
    }
  }, [isOpen]);

  useEffect(() => {
    if (editingMeal) {
      setManualMeal({
        name: editingMeal.name,
        calories: editingMeal.calories,
        protein: editingMeal.protein,
        carbs: editingMeal.carbs,
        fat: editingMeal.fat
      });
    }
  }, [editingMeal]);

  const resetStates = () => {
    setAiInput('');
    setCapturedImage(null);
    setCapturedAudio(null);
    setIsRecording(false);
    setIsLoadingAI(false);
    setManualMeal({ name: '', calories: 0, protein: 0, carbs: 0, fat: 0 });
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setCapturedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => setCapturedAudio(reader.result as string);
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      alert("No se pudo acceder al micrófono.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleWatchAd = () => {
    setIsLoadingAI(true);
    setTimeout(() => {
      setIsLoadingAI(false);
      setAdWatchCount(prev => prev + 1);
      alert("¡Anuncio visto! Has ganado 1 crédito de Análisis Premium.");
    }, 2000);
  };

  const handleMagicAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoadingAI(true);
    const result = await parseMealMultimodal({ 
      text: aiInput || undefined, 
      imageBase64: capturedImage || undefined,
      audioBase64: capturedAudio || undefined
    });
    setIsLoadingAI(false);
    if (result) {
      onSave(result);
      resetAndClose();
    } else {
      alert("La IA no pudo procesar tu entrada.");
    }
  };

  const resetAndClose = () => {
    resetStates();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xl z-[200] flex items-end sm:items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-[3rem] p-8 shadow-2xl animate-in slide-in-from-bottom duration-500 overflow-y-auto max-h-[90vh] no-scrollbar">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black tracking-tight">
            {editingMeal ? 'Ajustar Registro' : 'Añadir Comida'}
          </h2>
          <button onClick={resetAndClose} className="p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
            <X className="w-5 h-5"/>
          </button>
        </div>
        
        {!editingMeal ? (
          <form onSubmit={handleMagicAdd} className="space-y-6">
            <div className="relative">
              <textarea
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                placeholder="¿Qué comiste? Ej: 'Avena con fresas'..."
                className="w-full h-32 p-6 bg-gray-50 border-none rounded-[2rem] resize-none focus:ring-2 focus:ring-black text-gray-800 font-medium"
              />
              <div className="absolute bottom-4 right-6 flex items-center gap-1 opacity-30">
                <Sparkles className="w-3 h-3"/>
                <span className="text-[9px] font-black uppercase tracking-widest">IA Magic</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <button type="button" onClick={() => fileInputRef.current?.click()} className={`flex flex-col items-center gap-2 p-5 rounded-[2rem] border-2 border-dashed transition-all ${capturedImage ? 'border-green-500 bg-green-50' : 'border-gray-100 bg-gray-50'}`}>
                <Camera className="w-6 h-6"/>
                <span className="text-[9px] font-black uppercase text-gray-400">Foto</span>
              </button>
              <button type="button" onClick={isRecording ? stopRecording : startRecording} className={`flex flex-col items-center gap-2 p-5 rounded-[2rem] border-2 border-dashed transition-all ${isRecording ? 'border-red-500 animate-pulse' : 'border-gray-100 bg-gray-50'}`}>
                <Mic className="w-6 h-6"/>
                <span className="text-[9px] font-black uppercase text-gray-400">Voz</span>
              </button>
              <input type="file" accept="image/*" capture="environment" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
            </div>

            <button 
              type="button"
              onClick={handleWatchAd}
              className="w-full p-4 bg-orange-50 border border-orange-100 rounded-2xl flex items-center justify-between group hover:bg-orange-100 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="bg-orange-500 p-2 rounded-lg">
                  <PlayCircle className="w-4 h-4 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-black text-orange-600 uppercase leading-none mb-1">Doble de Créditos</p>
                  <p className="text-xs font-bold text-gray-700">Mira un video para análisis premium</p>
                </div>
              </div>
              <span className="bg-white text-orange-600 text-[10px] font-black px-2 py-1 rounded-md shadow-sm">GRATIS</span>
            </button>

            <button 
              type="submit" 
              disabled={isLoadingAI || (!aiInput.trim() && !capturedImage && !capturedAudio)} 
              className="w-full py-5 bg-black text-white font-black rounded-[2rem] shadow-xl flex items-center justify-center gap-3 transition-all disabled:opacity-30"
            >
              {isLoadingAI ? (
                <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>Analizar Comida <ChevronRight className="w-5 h-5"/></>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); onSave(manualMeal); resetAndClose(); }} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Nombre de la comida</label>
              <input type="text" value={manualMeal.name} onChange={e => setManualMeal({...manualMeal, name: e.target.value})} className="w-full p-5 bg-gray-50 rounded-2xl font-bold focus:ring-2 focus:ring-black" placeholder="Ej: Cena saludable" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Calorías (kcal)</label>
                <input 
                  type="number" 
                  value={manualMeal.calories === 0 ? '' : manualMeal.calories} 
                  onFocus={handleFocus} 
                  onChange={e => setManualMeal({...manualMeal, calories: e.target.value === '' ? 0 : Number(e.target.value)})} 
                  className="w-full p-5 bg-gray-50 rounded-2xl font-bold focus:ring-2 focus:ring-black appearance-none" 
                  placeholder="0"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Proteína (g)</label>
                <input 
                  type="number" 
                  value={manualMeal.protein === 0 ? '' : manualMeal.protein} 
                  onFocus={handleFocus} 
                  onChange={e => setManualMeal({...manualMeal, protein: e.target.value === '' ? 0 : Number(e.target.value)})} 
                  className="w-full p-5 bg-gray-50 rounded-2xl font-bold focus:ring-2 focus:ring-black appearance-none" 
                  placeholder="0"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Carbohidratos (g)</label>
                <input 
                  type="number" 
                  value={manualMeal.carbs === 0 ? '' : manualMeal.carbs} 
                  onFocus={handleFocus} 
                  onChange={e => setManualMeal({...manualMeal, carbs: e.target.value === '' ? 0 : Number(e.target.value)})} 
                  className="w-full p-5 bg-gray-50 rounded-2xl font-bold focus:ring-2 focus:ring-black appearance-none" 
                  placeholder="0"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Grasas (g)</label>
                <input 
                  type="number" 
                  value={manualMeal.fat === 0 ? '' : manualMeal.fat} 
                  onFocus={handleFocus} 
                  onChange={e => setManualMeal({...manualMeal, fat: e.target.value === '' ? 0 : Number(e.target.value)})} 
                  className="w-full p-5 bg-gray-50 rounded-2xl font-bold focus:ring-2 focus:ring-black appearance-none" 
                  placeholder="0"
                />
              </div>
            </div>
            <button type="submit" className="w-full py-5 mt-4 bg-black text-white font-black rounded-2xl shadow-lg">Guardar Cambios</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default MealModal;
