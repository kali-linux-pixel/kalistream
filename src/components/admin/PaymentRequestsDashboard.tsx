"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  Download,
  Eye,
  AlertTriangle,
  DollarSign,
  Calendar,
  User,
  Globe,
  Smartphone,
  Shield
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface PaymentRequest {
  id: string;
  uid: string;
  username: string;
  email: string;
  plan: string;
  duration: string;
  method: "Yape" | "Plin" | "Transferencia";
  amount: string;
  screenshotUrl: string;
  status: "pending" | "approved" | "rejected" | "expired";
  createdAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

interface PaymentRequestsDashboardProps {
  userRole: string;
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
  loading?: boolean;
}

export function PaymentRequestsDashboard({
  userRole,
  onApprove,
  onReject,
  loading = false
}: PaymentRequestsDashboardProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [methodFilter, setMethodFilter] = useState<string>("all");
  const [selectedRequest, setSelectedRequest] = useState<PaymentRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectionModal, setShowRejectionModal] = useState(false);

  // Mock data - in real app, this would come from Firestore
  const mockRequests: PaymentRequest[] = [
    {
      id: "1",
      uid: "user1",
      username: "john_doe",
      email: "john@example.com",
      plan: "plus",
      duration: "1 mes",
      method: "Yape",
      amount: "25",
      screenshotUrl: "/placeholder.jpg",
      status: "pending",
      createdAt: "2026-05-23T10:30:00Z"
    },
    {
      id: "2",
      uid: "user2",
      username: "jane_smith",
      email: "jane@example.com",
      plan: "ultra",
      duration: "1 ano",
      method: "Plin",
      amount: "200",
      screenshotUrl: "/placeholder.jpg",
      status: "pending",
      createdAt: "2026-05-23T09:15:00Z"
    },
    {
      id: "3",
      uid: "user3",
      username: "bob_wilson",
      email: "bob@example.com",
      plan: "basic",
      duration: "1 semana",
      method: "Transferencia",
      amount: "8",
      screenshotUrl: "/placeholder.jpg",
      status: "approved",
      createdAt: "2026-05-22T14:20:00Z",
      reviewedBy: "admin1",
      reviewedAt: "2026-05-22T14:25:00Z"
    }
  ];

  const filteredRequests = useMemo(() => {
    return mockRequests.filter(request => {
      const matchesSearch = request.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           request.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || request.status === statusFilter;
      const matchesMethod = methodFilter === "all" || request.method === methodFilter;
      
      return matchesSearch && matchesStatus && matchesMethod;
    });
  }, [mockRequests, searchTerm, statusFilter, methodFilter]);

  const stats = useMemo(() => {
    const total = mockRequests.length;
    const pending = mockRequests.filter(r => r.status === "pending").length;
    const approved = mockRequests.filter(r => r.status === "approved").length;
    const rejected = mockRequests.filter(r => r.status === "rejected").length;
    const totalAmount = mockRequests
      .filter(r => r.status === "approved")
      .reduce((sum, r) => sum + parseFloat(r.amount), 0);

    return { total, pending, approved, rejected, totalAmount };
  }, [mockRequests]);

  const handleApprove = (id: string) => {
    onApprove(id);
    setSelectedRequest(null);
  };

  const handleReject = (id: string) => {
    if (rejectionReason.trim()) {
      onReject(id, rejectionReason);
      setRejectionReason("");
      setShowRejectionModal(false);
      setSelectedRequest(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: { bg: "bg-yellow-500/20", text: "text-yellow-300", border: "border-yellow-500/30", icon: Clock },
      approved: { bg: "bg-green-500/20", text: "text-green-300", border: "border-green-500/30", icon: CheckCircle },
      rejected: { bg: "bg-red-500/20", text: "text-red-300", border: "border-red-500/30", icon: XCircle },
      expired: { bg: "bg-gray-500/20", text: "text-gray-300", border: "border-gray-500/30", icon: AlertTriangle }
    };

    const variant = variants[status as keyof typeof variants] || variants.pending;
    const Icon = variant.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${variant.bg} ${variant.text} ${variant.border}`}>
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getPlanBadge = (plan: string) => {
    const colors = {
      basic: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      plus: "bg-purple-500/20 text-purple-300 border-purple-500/30",
      ultra: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30"
    };

    return (
      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${colors[plan as keyof typeof colors] || colors.basic}`}>
        {plan.toUpperCase()}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: es });
    } catch {
      return "Fecha inválida";
    }
  };

  if (userRole !== "admin" && userRole !== "owner") {
    return (
      <div className="glass rounded-2xl p-8 text-center">
        <Shield className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">Acceso no autorizado</h3>
        <p className="text-white/70">Solo los administradores pueden ver las solicitudes de pago.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Solicitudes de Pago</h2>
          <p className="text-white/70">Gestiona las aprobaciones de pagos premium</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Exportar CSV</span>
        </motion.button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { title: "Total Solicitudes", value: stats.total, icon: CreditCard, color: "text-cyan-400" },
          { title: "Pendientes", value: stats.pending, icon: Clock, color: "text-yellow-400" },
          { title: "Aprobados", value: stats.approved, icon: CheckCircle, color: "text-green-400" },
          { title: "Ingresos", value: `S/ ${stats.totalAmount.toFixed(2)}`, icon: DollarSign, color: "text-purple-400" }
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass rounded-xl p-4 border border-white/10"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">{stat.title}</p>
                <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
              </div>
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="glass rounded-xl p-4 border border-white/10">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Buscar por usuario o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-cyan-400"
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-cyan-400"
            >
              <option value="all">Todos los estados</option>
              <option value="pending">Pendientes</option>
              <option value="approved">Aprobados</option>
              <option value="rejected">Rechazados</option>
              <option value="expired">Expirados</option>
            </select>
            
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-cyan-400"
            >
              <option value="all">Todos los métodos</option>
              <option value="Yape">Yape</option>
              <option value="Plin">Plin</option>
              <option value="Transferencia">Transferencia</option>
            </select>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="glass rounded-xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-white/70">Usuario</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-white/70">Plan</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-white/70">Duración</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-white/70">Método</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-white/70">Monto</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-white/70">Estado</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-white/70">Fecha</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-white/70">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <AnimatePresence>
                {filteredRequests.map((request) => (
                  <motion.tr
                    key={request.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">
                            {request.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-white font-medium">{request.username}</p>
                          <p className="text-white/60 text-sm">{request.email}</p>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      {getPlanBadge(request.plan)}
                    </td>
                    
                    <td className="px-6 py-4">
                      <span className="text-white/90">{request.duration}</span>
                    </td>
                    
                    <td className="px-6 py-4">
                      <span className="text-white/90">{request.method}</span>
                    </td>
                    
                    <td className="px-6 py-4">
                      <span className="text-cyan-400 font-semibold">S/ {request.amount}</span>
                    </td>
                    
                    <td className="px-6 py-4">
                      {getStatusBadge(request.status)}
                    </td>
                    
                    <td className="px-6 py-4">
                      <span className="text-white/70 text-sm">{formatDate(request.createdAt)}</span>
                    </td>
                    
                    <td className="px-6 py-4">
                      {request.status === "pending" && (
                        <div className="flex gap-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleApprove(request.id)}
                            className="p-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg transition-colors"
                            disabled={loading}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </motion.button>
                          
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              setSelectedRequest(request);
                              setShowRejectionModal(true);
                            }}
                            className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors"
                            disabled={loading}
                          >
                            <XCircle className="w-4 h-4" />
                          </motion.button>
                        </div>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        
        {filteredRequests.length === 0 && (
          <div className="text-center py-12">
            <CreditCard className="w-12 h-12 text-white/30 mx-auto mb-4" />
            <p className="text-white/60">No se encontraron solicitudes de pago</p>
          </div>
        )}
      </div>

      {/* Rejection Modal */}
      <AnimatePresence>
        {showRejectionModal && selectedRequest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setShowRejectionModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass rounded-2xl p-6 max-w-md w-full mx-4 border border-white/20"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-semibold text-white mb-4">Rechazar solicitud</h3>
              <p className="text-white/70 mb-4">
                ¿Estás seguro de que deseas rechazar la solicitud de <span className="text-white font-medium">{selectedRequest.username}</span>?
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Motivo de rechazo
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Especifica el motivo del rechazo..."
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-cyan-400"
                    rows={3}
                  />
                </div>
                
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowRejectionModal(false)}
                    className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                  >
                    Cancelar
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleReject(selectedRequest.id)}
                    disabled={!rejectionReason.trim() || loading}
                    className="flex-1 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Rechazar
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}