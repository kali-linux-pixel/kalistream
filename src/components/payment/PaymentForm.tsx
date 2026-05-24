"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CreditCard, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { QRPaymentCard } from "./QRPaymentCard";

interface PaymentPlan {
  id: string;
  name: string;
  description: string;
  duration: string;
  price: string;
  features: string[];
  popular?: boolean;
}

interface PaymentFormProps {
  onSubmit: (data: {
    plan: string;
    duration: string;
    method: string;
    amount: string;
  }) => void;
  loading?: boolean;
}

export function PaymentForm({ onSubmit, loading = false }: PaymentFormProps) {
  const [selectedPlan, setSelectedPlan] = useState("plus");
  const [selectedDuration, setSelectedDuration] = useState("1 mes");
  const [selectedMethod, setSelectedMethod] = useState("Yape");
  const [showQR, setShowQR] = useState(false);

  // Dynamic pricing based on plan and duration
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

  const plans: PaymentPlan[] = [
    {
      id: "basic",
      name: "BASIC",
      description: "Perfecto para principiantes",
      duration: "1 mes",
      price: planPrices.basic["1 mes"],
      features: ["Calidad 720p", "Continuar viendo", "Soporte básico"]
    },
    {
      id: "plus",
      name: "PLUS",
      description: "La opción más popular",
      duration: "1 mes",
      price: planPrices.plus["1 mes"],
      popular: true,
      features: ["Calidad 1080p", "Auto siguiente", "Sin anuncios", "Soporte prioritario"]
    },
    {
      id: "ultra",
      name: "ULTRA",
      description: "Para los verdaderos fans",
      duration: "1 mes",
      price: planPrices.ultra["1 mes"],
      features: ["4K Ultra HD", "Descargas", "Estrenos exclusivos", "Soporte VIP", "Contenido extra"]
    }
  ];

  const paymentMethods = [
    { id: "Yape", name: "Yape", color: "green" },
    { id: "Plin", name: "Plin", color: "blue" },
    { id: "Transferencia", name: "Transferencia", color: "purple" }
  ];

  const durations = ["2 dias", "1 semana", "1 mes", "1 ano", "Ultra Elite"];

  const currentPrice = planPrices[selectedPlan][selectedDuration];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      plan: selectedPlan,
      duration: selectedDuration,
      method: selectedMethod,
      amount: currentPrice.replace("S/ ", "")
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Plans Selection */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Elige tu plan</h2>
        <p className="text-white/70">Selecciona el plan que mejor se adapte a tus necesidades</p>
        
        <div className="grid gap-4 md:grid-cols-3">
          {plans.map((plan) => (
            <motion.div
              key={plan.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`glass rounded-2xl p-6 border-2 cursor-pointer transition-all ${
                selectedPlan === plan.id
                  ? "border-cyan-400 shadow-lg shadow-cyan-400/20"
                  : "border-white/10 hover:border-white/20"
              } ${plan.popular ? "ring-2 ring-cyan-400/50" : ""}`}
              onClick={() => setSelectedPlan(plan.id)}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-cyan-500 text-white text-xs px-3 py-1 rounded-full">
                    POPULAR
                  </span>
                </div>
              )}
              
              <div className="text-center">
                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-white/70 text-sm mb-4">{plan.description}</p>
                
                <div className="mb-4">
                  <span className="text-3xl font-bold text-white">{plan.price}</span>
                  <span className="text-white/60 text-sm">/mes</span>
                </div>
                
                <ul className="text-left space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-white/80">
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Duration and Method Selection */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Duration Selection */}
        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Duración
          </h3>
          <div className="grid gap-2">
            {durations.map((duration) => (
              <motion.button
                key={duration}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`p-3 rounded-lg text-left transition-all ${
                  selectedDuration === duration
                    ? "bg-cyan-500/20 border border-cyan-400/50"
                    : "bg-white/5 hover:bg-white/10 border border-white/10"
                }`}
                onClick={() => setSelectedDuration(duration)}
              >
                <span className="text-white font-medium">{duration}</span>
                <span className="text-white/60 text-sm ml-auto block">
                  {planPrices[selectedPlan][duration]}
                </span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Method Selection */}
        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Método de pago</h3>
          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <motion.button
                key={method.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full p-4 rounded-xl flex items-center gap-3 transition-all ${
                  selectedMethod === method.id
                    ? "bg-gradient-to-r from-white/10 to-white/5 border border-white/20"
                    : "bg-white/5 hover:bg-white/10 border border-white/10"
                }`}
                onClick={() => setSelectedMethod(method.id)}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  method.color === "green" ? "bg-green-500" :
                  method.color === "blue" ? "bg-blue-500" : "bg-purple-500"
                }`}>
                  <span className="text-white font-bold text-sm">{method.name.charAt(0)}</span>
                </div>
                <span className="text-white font-medium">{method.name}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* QR Payment Card */}
      <AnimatePresence>
        {showQR && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-8"
          >
            <QRPaymentCard
              method={selectedMethod as "Yape" | "Plin" | "Transferencia"}
              amount={currentPrice.replace("S/ ", "")}
              username="kalistream_user"
              showQR={true}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Order Summary */}
        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Resumen del pedido</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-white/70">Plan</span>
              <span className="text-white font-medium">{plans.find(p => p.id === selectedPlan)?.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">Duración</span>
              <span className="text-white font-medium">{selectedDuration}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">Método</span>
              <span className="text-white font-medium">{selectedMethod}</span>
            </div>
            <div className="border-t border-white/20 pt-3">
              <div className="flex justify-between items-center">
                <span className="text-white/70">Total</span>
                <span className="text-2xl font-bold text-white">{currentPrice}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-semibold py-4 rounded-xl hover:from-cyan-600 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Procesando...</span>
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              <span>Pagar ahora - {currentPrice}</span>
            </>
          )}
        </motion.button>

        {/* Security Notice */}
        <div className="flex items-center gap-2 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
          <CheckCircle className="w-5 h-5 text-green-400" />
          <p className="text-sm text-green-300">
            Tu pago está protegido con encriptación SSL. 100% seguro.
          </p>
        </div>
      </form>
    </div>
  );
}