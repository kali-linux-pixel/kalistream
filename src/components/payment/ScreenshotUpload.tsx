"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Upload, X, Eye, AlertCircle, CheckCircle, Image as ImageIcon } from "lucide-react";

interface ScreenshotUploadProps {
  onFileSelect: (file: File, preview: string) => void;
  onFileRemove?: () => void;
  acceptedTypes?: string[];
  maxSizeMB?: number;
  className?: string;
}

export function ScreenshotUpload({
  onFileSelect,
  onFileRemove,
  acceptedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"],
  maxSizeMB = 5,
  className = ""
}: ScreenshotUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  }, []);

  const validateFile = (file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return `Tipo de archivo no soportado. Se permiten: ${acceptedTypes.join(', ')}`;
    }
    
    if (file.size > maxSizeBytes) {
      return `El archivo es demasiado grande. Máximo ${maxSizeMB}MB`;
    }
    
    return null;
  };

  const handleFile = (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      setStatus('error');
      return;
    }

    setError(null);
    setStatus('uploading');

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const previewUrl = e.target?.result as string;
      setPreview(previewUrl);
      onFileSelect(file, previewUrl);
      
      // Simulate upload progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          setStatus('success');
        }
        setUploadProgress(progress);
      }, 200);
    };
    reader.readAsDataURL(file);
  };

  const removeFile = () => {
    setPreview(null);
    setStatus('idle');
    setUploadProgress(0);
    setError(null);
    onFileRemove?.();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <motion.div
        className={`relative glass rounded-2xl p-8 border-2 transition-all cursor-pointer ${
          dragActive
            ? 'border-cyan-400 bg-cyan-500/10'
            : status === 'error'
            ? 'border-red-400 bg-red-500/10'
            : status === 'success'
            ? 'border-green-400 bg-green-500/10'
            : 'border-white/10 hover:border-white/20'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileDialog
        }
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes.join(',')}
          onChange={handleFileInput}
          className="hidden"
        />

        <div className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mx-auto w-16 h-16 bg-white/10 rounded-full flex items-center justify-center"
          >
            {status === 'uploading' ? (
              <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Upload className="w-8 h-8 text-cyan-400" />
            )}
          </motion.div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-white">
              {status === 'uploading' && 'Subiendo captura...'}
              {status === 'success' && '¡Captura subida!'}
              {status === 'error' && 'Error al subir'}
              {status === 'idle' && 'Subir captura de pago'}
            </h3>
            
            <p className="text-sm text-white/70">
              {status === 'idle' && 'Arrastra y suelta tu captura o haz clic para seleccionar'}
              {status === 'uploading' && `${uploadProgress.toFixed(0)}% completado`}
              {status === 'success' && 'Tu captura ha sido subida exitosamente'}
              {status === 'error' && error}
            </p>

            {status === 'idle' && (
              <p className="text-xs text-white/50">
                Formatos: JPG, PNG, WebP • Máximo: {maxSizeMB}MB
              </p>
            )}
          </div>

          {status === 'idle' && (
            <motion.button
              type="button"
              className="px-6 py-2 bg-cyan-500/20 text-cyan-300 rounded-lg text-sm font-medium hover:bg-cyan-500/30 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Seleccionar archivo
            </motion.button>
          )}
        </div>

        {/* Progress Bar */}
        <AnimatePresence>
          {status === 'uploading' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: '4px' }}
              exit={{ opacity: 0, height: 0 }}
              className="absolute bottom-0 left-0 right-0"
            >
              <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-cyan-400 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Preview */}
      <AnimatePresence>
        {preview && status === 'success' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass rounded-2xl p-6 border border-green-400/30"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <h4 className="text-white font-medium">Captura lista para enviar</h4>
              </div>
              <motion.button
                type="button"
                onClick={removeFile}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 text-white/60 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            <div className="relative">
              <img
                src={preview}
                alt="Payment screenshot preview"
                className="w-full max-h-64 object-contain rounded-lg bg-black/20"
              />
              
              {/* Overlay info */}
              <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1">
                <div className="flex items-center gap-2 text-xs text-white">
                  <Eye className="w-3 h-3" />
                  <span>Vista previa</span>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-white/70">Archivo válido</span>
              <span className="text-white/60">{formatFileSize(preview.length * 0.75)}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Display */}
      <AnimatePresence>
        {status === 'error' && error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass rounded-2xl p-4 border border-red-400/30"
          >
            <div className="flex items-center gap-2 text-red-300">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm">{error}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Tips */}
      <div className="glass rounded-xl p-4 border border-white/10">
        <h4 className="text-white font-medium mb-2 flex items-center gap-2">
          <ImageIcon className="w-4 h-4" />
          Requerimientos de la captura
        </h4>
        <ul className="text-sm text-white/70 space-y-1">
          <li>• Debe mostrar claramente el monto pagado</li>
          <li>• Incluir fecha y hora de la transacción</li>
          <li>• Mostrar el método de pago usado</li>
          <li>• Sin recortes ni fotos borrosas</li>
        </ul>
      </div>
    </div>
  );
}