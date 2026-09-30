import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Lock, ArrowLeft, Eye, EyeOff } from 'lucide-react';

export function AdminLogin({ onLoginSuccess }: { onLoginSuccess: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError('Credenciais inválidas ou sem acesso.');
      setLoading(false);
    } else {
      onLoginSuccess();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-900 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Premium Background */}
      <div className="absolute inset-0 z-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center" />
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-zinc-900 via-zinc-900/80 to-zinc-900/40" />

      <div className="max-w-md w-full space-y-8 bg-zinc-800/80 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-zinc-700/50 z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <button
          type="button"
          onClick={() => window.location.hash = ''}
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar ao site
        </button>

        <div>
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-500/10 border border-red-500/20">
            <Lock className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-editorial tracking-tight text-white">
            Acesso Restrito
          </h2>
          <p className="mt-2 text-center text-sm text-zinc-400">
            Área administrativa exclusiva do Concórdia Grill.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div>
              <label className="sr-only">E-mail</label>
              <input
                type="email"
                required
                className="appearance-none block w-full px-4 py-3 border border-zinc-600 bg-zinc-900/50 text-white rounded-xl placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm transition-all"
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="relative">
              <label className="sr-only">Senha</label>
              <input
                type={showPassword ? "text" : "password"}
                required
                className="appearance-none block w-full px-4 py-3 pr-12 border border-zinc-600 bg-zinc-900/50 text-white rounded-xl placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm transition-all"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center px-4 text-zinc-400 hover:text-zinc-300 transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="text-red-400 text-sm text-center bg-red-500/10 p-3 rounded-lg border border-red-500/20 animate-in shake">
              {error}
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold uppercase tracking-wider rounded-xl text-white bg-[#e03131] hover:bg-[#c92a2a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900 focus:ring-red-500 disabled:opacity-50 transition-all shadow-[0_8px_30px_rgba(224,49,49,0.3)] hover:shadow-[0_8px_30px_rgba(224,49,49,0.5)] hover:-translate-y-0.5 active:translate-y-0"
            >
              {loading ? 'Validando...' : 'Entrar no Sistema'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
