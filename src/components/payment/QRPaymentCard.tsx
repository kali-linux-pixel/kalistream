"use client";

import { motion } from "motion/react";
import { CreditCard, QrCode, Smartphone } from "lucide-react";

interface QRPaymentCardProps {
  method: "Yape" | "Plin" | "Transferencia";
  amount: string;
  username?: string;
  showQR?: boolean;
}

export function QRPaymentCard({ method, amount, username, showQR = false }: QRPaymentCardProps) {
  const getMethodIcon = (method: string) => {
    switch (method) {
      case "Yape":
        return (
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">Y</span>
          </div>
        );
      case "Plin":
        return (
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">P</span>
          </div>
        );
      case "Transferencia":
        return (
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Smartphone className="w-5 h-5 text-white" />
          </div>
        );
      default:
        return <CreditCard className="w-8 h-8 text-cyan-400" />;
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case "Yape":
        return "from-green-500/20 to-green-600/20 border-green-500/30";
      case "Plin":
        return "from-blue-500/20 to-blue-600/20 border-blue-500/30";
      case "Transferencia":
        return "from-purple-500/20 to-purple-600/20 border-purple-500/30";
      default:
        return "from-cyan-500/20 to-cyan-600/20 border-cyan-500/30";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`glass ${getMethodColor(method)} rounded-2xl p-6 border relative overflow-hidden`}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/5 to-transparent rounded-full -mr-16 -mt-16" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-white/5 to-transparent rounded-full -ml-12 -mb-12" />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {getMethodIcon(method)}
            <div>
              <h3 className="text-lg font-semibold text-white">{method}</h3>
              <p className="text-sm text-white/70">Escanea para pagar</p>
            </div>
          </div>
          <QrCode className="w-8 h-8 text-white/50" />
        </div>

        {/* Amount */}
        <div className="mb-6">
          <p className="text-sm text-white/70 mb-2">Monto a pagar</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">S/ {amount}</span>
            <span className="text-sm text-white/60">PEN</span>
          </div>
        </div>

        {/* Username */}
        {username && (
          <div className="mb-6">
            <p className="text-sm text-white/70 mb-2">Usuario</p>
            <p className="text-sm font-medium text-white/90">@{username}</p>
          </div>
        )}

        {/* QR Code */}
        {showQR && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="bg-white/10 rounded-xl p-4 flex justify-center items-center"
          >
            <div className="w-48 h-48 bg-white rounded-lg flex items-center justify-center">
              <div className="text-center">
                <QrCode className="w-24 h-24 text-gray-400 mx-auto mb-2" />
                <p className="text-xs text-gray-500">QR Code {method}</p>
                <p className="text-xs text-gray-500 font-medium">S/ {amount}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Instructions */}
        <div className="space-y-2">
          <p className="text-sm text-white/80">
            {method === "Yape" && "Abre Yape, escanea el código y confirma el pago"}
            {method === "Plin" && "Abre Plin, escanea el código y confirma el pago"}
            {method === "Transferencia" && "Realiza la transferencia al número mostrado"}
          </p>
          <p className="text-xs text-white/60">
            {method === "Transferencia" && "Número: +51 987 654 321"}
          </p>
        </div>

        {/* Security badge */}
        <div className="mt-6 pt-4 border-t border-white/20">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full" />
            <p className="text-xs text-white/70">Pago seguro y encriptado</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}