import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { LogOut, Save, Shield } from 'lucide-react';

export function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [environment, setEnvironment] = useState('sandbox');
  const [pagarmeKey, setPagarmeKey] = useState('');
  const [hasKeyConfigured, setHasKeyConfigured] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return onLogout();

      const response = await fetch('/api/admin/config', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) onLogout();
        throw new Error('Falha ao carregar configuração');
      }

      const data = await response.json();
      setEnvironment(data.environment);
      setHasKeyConfigured(data.pagarme_key_configured);
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Erro ao carregar configurações.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return onLogout();

      const response = await fetch('/api/admin/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          environment,
          pagarme_key: pagarmeKey // if empty, backend ignores it and preserves current
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Erro ao salvar configuração');
      }

      setMessage({ type: 'success', text: 'Configurações salvas com sucesso!' });
      setPagarmeKey(''); // clear field after save
      fetchConfig(); // refresh state
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onLogout();
  };

  if (loading) return <div className="p-8 text-center">Carregando painel...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-red-600" />
            <h1 className="text-xl font-bold text-gray-900">Painel Administrativo</h1>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors"
          >
            <LogOut className="h-5 w-5" /> Sair
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg p-6 max-w-2xl">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Integração Pagar.me</h2>
          
          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Ambiente</label>
              <select
                value={environment}
                onChange={(e) => setEnvironment(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md"
              >
                <option value="sandbox">Sandbox (Testes)</option>
                <option value="production">Produção (Valendo)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Secret Key da API V5
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  type="password"
                  value={pagarmeKey}
                  onChange={(e) => setPagarmeKey(e.target.value)}
                  placeholder={hasKeyConfigured ? "************************ (Configurada)" : "Insira sua Secret Key"}
                  className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-red-500 focus:border-red-500 sm:text-sm"
                />
              </div>
              <p className="mt-2 text-xs text-gray-500">
                A chave é criptografada no banco de dados. Deixe em branco se quiser manter a chave atual.
              </p>
            </div>

            {message.text && (
              <div className={`p-3 rounded-md text-sm ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                {message.text}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="flex items-center justify-center gap-2 w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Salvando...' : 'Salvar Configurações'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
