"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle } from "lucide-react";
import { useAuthSession } from "@/components/layout/auth-provider";
import { PaymentForm } from "@/components/payment/PaymentForm";
import { ScreenshotUpload } from "@/components/payment/ScreenshotUpload";
import { QRPaymentCard } from "@/components/payment/QRPaymentCard";
import { createPayment } from "@/firebase/firestore";
import { deleteUploadedFile, uploadFileWithProgress } from "@/firebase/storage";

export default function PremiumPage() {
  const { user } = useAuthSession();
  const [selectedPlan, setSelectedPlan] = useState<"basic" | "plus" | "ultra">("plus");
  const [selectedDuration, setSelectedDuration] = useState("1 mes");
  const [selectedMethod, setSelectedMethod] = useState<"Yape" | "Plin" | "Transferencia">("Yape");
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [uploadedPath, setUploadedPath] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"form" | "upload" | "qr" | "success">("form");
  const [paymentData, setPaymentData] = useState<{
    plan: string;
    duration: string;
    method: string;
    amount: string;
  } | null>(null);

  const planPrices: Record<string, Record<string, string>> = {
    basic: {
      "2 dias": "S/ 2",
      "1 semana": "S/ 4",
      "1 mes": "S/ 12",
      "1 ano": "S/ 60",
      "Ultra Elite": "S/ 80"
    },
    plus: {
      "2 dias": "S/ 4",
      "1 semana": "S/ 8",
      "1 mes": "S/ 25",
      "1 ano": "S/ 120",
      "Ultra Elite": "S/ 150"
    },
    ultra: {
      "2 dias": "S/ 6",
      "1 semana": "S/ 12",
      "1 mes": "S/ 40",
      "1 ano": "S/ 200",
      "Ultra Elite": "S/ 250"
    }
  };

  const handlePlanSubmit = (data: {
    plan: string;
    duration: string;
    method: string;
    amount: string;
  }) => {
    setPaymentData(data);
    setSelectedPlan(data.plan as "basic" | "plus" | "ultra");
    setSelectedDuration(data.duration);
    setSelectedMethod(data.method as "Yape" | "Plin" | "Transferencia");
    setStep("upload");
  };

  const handleScreenshotUpload = (file: File, preview: string) => {
    setScreenshotFile(file);
    setScreenshotPreview(preview);
  };

  const handleScreenshotRemove = () => {
    setScreenshotFile(null);
    setScreenshotPreview(null);
    if (uploadedPath) {
      deleteUploadedFile(uploadedPath);
      setUploadedPath(null);
    }
  };

  const handlePaymentSubmit = async () => {
    if (!user || !screenshotFile) return;

    setLoading(true);
    try {
      const { url: screenshotUrl, path } = await uploadFileWithProgress({
        uid: user.uid,
        file: screenshotFile,
        kind: "payment",
        onProgress: (percent) => setUploadProgress(percent),
      });
      setUploadedPath(path);

      await createPayment({
        uid: user.uid,
        email: user.email || "",
        username: user.displayName?.split(' ')[0] || "usuario",
        method: selectedMethod,
        plan: selectedPlan,
        duration: selectedDuration,
        price: currentPrice.replace("S/ ", ""),
        screenshotUrl,
        status: "pending",
        createdAt: new Date().toISOString(),
        ipAddress: "", // TODO: Get real IP from client
        userAgent: navigator.userAgent
      });

      setStep("success");
    } catch (err) {
      console.error("Error al enviar el pago:", err);
      alert("Error al enviar el pago. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToForm = () => {
    setStep("form");
  };

  const handleBackToUpload = () => {
    setStep("upload");
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass rounded-2xl p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold text-white mb-4">Inicia sesión</h2>
          <p className="text-white/70 mb-6">Debes iniciar sesión para acceder a los planes premium.</p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Ir a Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">Planes Premium</h1>
          <p className="text-xl text-white/70">Desbloquea toda la experiencia KaliStream</p>
        </motion.div>

        <div className="glass rounded-3xl p-8 border border-white/10">
          <AnimatePresence mode="wait">
            {step === "form" && (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <PaymentForm
                  onSubmit={handlePlanSubmit}
                  loading={loading}
                />
              </motion.div>
            )}

            {step === "upload" && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white">Subir captura</h2>
                    <button
                      onClick={handleBackToForm}
                      className="text-white/70 hover:text-white transition-colors"
                    >
                      ← Volver
                    </button>
                  </div>

                  {/* Order Summary */}
                  {paymentData && (
                    <div className="glass rounded-xl p-6 border border-white/10">
                      <h3 className="text-lg font-semibold text-white mb-4">Resumen del pedido</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-white/70">Plan</span>
                          <span className="text-white font-medium">{paymentData.plan.toUpperCase()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-white/70">Duración</span>
                          <span className="text-white font-medium">{paymentData.duration}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-white/70">Método</span>
                          <span className="text-white font-medium">{paymentData.method}</span>
                        </div>
                        <div className="border-t border-white/20 pt-3">
                          <div className="flex justify-between items-center">
                            <span className="text-white/70">Total</span>
                            <span className="text-2xl font-bold text-white">{paymentData.amount}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <ScreenshotUpload
                    onFileSelect={handleScreenshotUpload}
                    onFileRemove={handleScreenshotRemove}
                    className="w-full"
                  />

                  <div className="flex gap-4">
                    <button
                      onClick={handleBackToForm}
                      className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                    >
                      Volver
                    </button>
                    <button
                      onClick={handlePaymentSubmit}
                      disabled={!screenshotFile || loading}
                      className="flex-1 px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? "Procesando..." : "Continuar al pago"}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {step === "qr" && (
              <motion.div
                key="qr"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center space-y-6">
                  <h2 className="text-2xl font-bold text-white">Escanea para pagar</h2>
                  <p className="text-white/70">Escanea el código con tu app y confirma el pago</p>
                  
                  {paymentData && (
                    <QRPaymentCard
                      method={selectedMethod}
                      amount={paymentData.amount.replace("S/ ", "")}
                      username={user.displayName?.split(' ')[0] || "usuario"}
                      showQR={true}
                    />
                  )}
                </div>
              </motion.div>
            )}

            {step === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center py-12"
              >
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-green-400" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">¡Solicitud enviada!</h2>
                <p className="text-xl text-white/70 mb-8">
                  Tu solicitud de pago está siendo revisada. Recibirás una notificación cuando sea aprobada.
                </p>
                <div className="space-y-4">
                  <div className="glass rounded-xl p-6 border border-white/10 max-w-md mx-auto">
                    <h3 className="text-lg font-semibold text-white mb-4">Detalles de tu solicitud</h3>
                    <div className="space-y-2 text-left">
                      <div className="flex justify-between">
                        <span className="text-white/70">Plan:</span>
                        <span className="text-white font-medium">{selectedPlan.toUpperCase()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Duración:</span>
                        <span className="text-white font-medium">{selectedDuration}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Método:</span>
                        <span className="text-white font-medium">{selectedMethod}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Monto:</span>
                        <span className="text-white font-medium">{paymentData?.amount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Estado:</span>
                        <span className="text-yellow-400 font-medium">Pendiente</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setStep("form")}
                    className="px-8 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium transition-colors"
                  >
                    Solicitar otro plan
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
