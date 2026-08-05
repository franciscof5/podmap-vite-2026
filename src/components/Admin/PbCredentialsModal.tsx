import React, { useState } from 'react';
import { Database, Key, Mail, Globe, Check, X, ShieldAlert, Activity, AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';
import { getPbCredentials, savePbCredentials, runPocketBaseDiagnostics, PbDiagnosticStep } from '../../services/pocketbase';

interface PbCredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export function PbCredentialsModal({ isOpen, onClose, onSaved }: PbCredentialsModalProps) {
  const current = getPbCredentials();
  const [url, setUrl] = useState(current.url);
  const [email, setEmail] = useState(current.email);
  const [password, setPassword] = useState(current.password);
  const [isSaved, setIsSaved] = useState(false);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [diagnosticSteps, setDiagnosticSteps] = useState<PbDiagnosticStep[] | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    savePbCredentials(email.trim(), password.trim(), url.trim());
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onSaved();
      onClose();
    }, 600);
  };

  const handleRunDiagnostics = async () => {
    // Save current form inputs first so test runs against input values
    savePbCredentials(email.trim(), password.trim(), url.trim());
    setIsDiagnosing(true);
    setDiagnosticSteps(null);
    try {
      const results = await runPocketBaseDiagnostics();
      setDiagnosticSteps(results);
    } catch (err: any) {
      setDiagnosticSteps([
        {
          name: 'Erro Desconhecido',
          status: 'error',
          message: err?.message || String(err),
        },
      ]);
    } finally {
      setIsDiagnosing(false);
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
    >
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative space-y-5 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-yellow-400/10 border border-yellow-500/30 flex items-center justify-center text-yellow-400 shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Configurar & Debugar PocketBase</h3>
            <p className="text-xs text-zinc-400">Autenticação de administrador / superuser em produção</p>
          </div>
        </div>

        <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-xl text-amber-200 text-xs flex gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>
            Verifique se a conta de Superuser foi criada no seu PocketBase (<strong>{url}/_/</strong>).
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-yellow-400" />
              URL do PocketBase
            </label>
            <input
              type="text"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://pocket.f5sites.com.br"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-yellow-400" />
              E-mail de Admin / Superuser
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="francisco@f5sites.com"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-yellow-400" />
              Senha do Admin / Superuser
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-400"
            />
          </div>

          {/* Diagnostic Tool Box */}
          <div className="pt-2 border-t border-zinc-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-yellow-400" />
                Diagnóstico de Conexão & CORS
              </span>
              <button
                type="button"
                onClick={handleRunDiagnostics}
                disabled={isDiagnosing}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-yellow-400 border border-yellow-500/30 text-xs font-bold flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50"
              >
                {isDiagnosing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Testando...
                  </>
                ) : (
                  <>
                    <Activity className="w-3.5 h-3.5" />
                    Diagnosticar Conexão
                  </>
                )}
              </button>
            </div>

            {/* Diagnostic Results Display */}
            {diagnosticSteps && (
              <div className="space-y-2 mt-3 bg-zinc-950 p-3.5 rounded-xl border border-zinc-800/80">
                {diagnosticSteps.map((step, idx) => (
                  <div key={idx} className="text-xs space-y-1 border-b border-zinc-900 pb-2 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between font-semibold">
                      <span className="text-zinc-200">{step.name}</span>
                      {step.status === 'success' ? (
                        <span className="text-emerald-400 flex items-center gap-1 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> OK
                        </span>
                      ) : step.status === 'warning' ? (
                        <span className="text-amber-400 flex items-center gap-1 font-bold">
                          <AlertTriangle className="w-3.5 h-3.5" /> Atenção
                        </span>
                      ) : (
                        <span className="text-rose-400 flex items-center gap-1 font-bold">
                          <AlertTriangle className="w-3.5 h-3.5" /> Erro
                        </span>
                      )}
                    </div>
                    <p className="text-zinc-400 font-mono text-[11px]">{step.message}</p>
                    {step.details && (
                      <div className="p-2 bg-zinc-900 rounded border border-zinc-800 text-[11px] text-amber-300/90 leading-relaxed">
                        {step.details}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-yellow-400 text-black hover:bg-yellow-300 flex items-center gap-1.5 transition active:scale-95 shadow-lg shadow-yellow-500/20"
            >
              {isSaved ? (
                <>
                  <Check className="w-4 h-4" />
                  Salvo!
                </>
              ) : (
                'Salvar Credenciais'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
