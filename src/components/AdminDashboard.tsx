import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { LogOut, Save, Shield, LayoutDashboard, Users, Settings, DollarSign, ShoppingBag, TrendingUp, Search } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type Tab = 'dashboard' | 'orders' | 'settings';

interface Order {
  id: string;
  package_id: string;
  guests_adults: number;
  total_cents: number;
  customer_name: string;
  customer_email: string;
  status: string;
  created_at: string;
}

export function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  
  // Settings State
  const [environment, setEnvironment] = useState('sandbox');
  const [pagarmeKey, setPagarmeKey] = useState('');
  const [hasKeyConfigured, setHasKeyConfigured] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Data State
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return onLogout();

      const headers = { 'Authorization': `Bearer ${session.access_token}` };

      // Fetch Config
      const configRes = await fetch('/api/admin/config', { headers });
      if (!configRes.ok) {
        if (configRes.status === 401 || configRes.status === 403) onLogout();
        throw new Error('Falha ao carregar configuração');
      }
      const configData = await configRes.json();
      setEnvironment(configData.environment);
      setHasKeyConfigured(configData.pagarme_key_configured);

      // Fetch Orders
      const ordersRes = await fetch('/api/admin/orders', { headers });
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setOrders(ordersData);
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Erro ao carregar dados do servidor.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
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
        body: JSON.stringify({ environment, pagarme_key: pagarmeKey })
      });

      if (!response.ok) throw new Error('Erro ao salvar configuração');

      setMessage({ type: 'success', text: 'Configurações salvas com sucesso!' });
      setPagarmeKey('');
      fetchData(); 
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

  const formatBRL = (cents: number) => {
    return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  // KPIs Calculations
  const stats = useMemo(() => {
    const paidOrders = orders.filter(o => o.status === 'paid');
    const totalRevenueCents = paidOrders.reduce((sum, o) => sum + o.total_cents, 0);
    const avgTicket = paidOrders.length > 0 ? totalRevenueCents / paidOrders.length : 0;
    
    // Group by day for chart
    const chartDataMap = new Map<string, number>();
    // Pre-fill last 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      chartDataMap.set(d.toISOString().split('T')[0], 0);
    }
    
    paidOrders.forEach(o => {
      const dateKey = o.created_at.split('T')[0];
      if (chartDataMap.has(dateKey)) {
        chartDataMap.set(dateKey, chartDataMap.get(dateKey)! + (o.total_cents / 100));
      }
    });

    const chartData = Array.from(chartDataMap.entries()).map(([date, total]) => ({
      name: new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
      total
    }));

    return {
      totalRevenueCents,
      ordersCount: paidOrders.length,
      avgTicket,
      chartData
    };
  }, [orders]);


  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium text-sm animate-pulse">Carregando painel...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-zinc-950 text-zinc-300 flex flex-col hidden md:flex shrink-0">
        <div className="h-20 flex items-center px-6 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-red-500" />
            <h1 className="text-lg font-bold text-white tracking-tight">Concórdia Admin</h1>
          </div>
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'dashboard' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'hover:bg-zinc-900 hover:text-white'}`}
          >
            <LayoutDashboard className="w-5 h-5" />
            Visão Geral
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'orders' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'hover:bg-zinc-900 hover:text-white'}`}
          >
            <ShoppingBag className="w-5 h-5" />
            Vendas e Pedidos
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'settings' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'hover:bg-zinc-900 hover:text-white'}`}
          >
            <Settings className="w-5 h-5" />
            Integração Pagar.me
          </button>
        </nav>

        <div className="p-4 border-t border-zinc-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
          >
            <LogOut className="w-5 h-5" /> Sair do Sistema
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden bg-zinc-950 text-white h-16 flex items-center justify-between px-4">
           <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-red-500" />
            <span className="font-bold">Admin</span>
          </div>
          <button onClick={handleLogout} className="text-zinc-400"><LogOut className="w-5 h-5"/></button>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-8">
          
          {/* TAB: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Visão Geral</h2>
                <p className="text-gray-500 text-sm mt-1">Acompanhe as métricas do seu negócio.</p>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Faturamento Total</p>
                    <h3 className="text-2xl font-bold text-gray-900">{formatBRL(stats.totalRevenueCents)}</h3>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                    <ShoppingBag className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Vendas Concluídas</p>
                    <h3 className="text-2xl font-bold text-gray-900">{stats.ordersCount}</h3>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Ticket Médio</p>
                    <h3 className="text-2xl font-bold text-gray-900">{formatBRL(stats.avgTicket)}</h3>
                  </div>
                </div>
              </div>

              {/* Chart */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-base font-bold text-gray-900 mb-6">Faturamento nos últimos 7 dias</h3>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#e03131" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#e03131" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} tickFormatter={(val) => \`R$ \${val}\`} />
                      <Tooltip 
                        formatter={(value: number) => [\`R$ \${value.toFixed(2)}\`, 'Faturamento']}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Area type="monotone" dataKey="total" stroke="#e03131" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* TAB: ORDERS */}
          {activeTab === 'orders' && (
            <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Pedidos</h2>
                  <p className="text-gray-500 text-sm mt-1">Gerencie os clientes e pagamentos.</p>
                </div>
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input type="text" placeholder="Buscar pedido..." className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 w-full sm:w-64" />
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                        <th className="px-6 py-4 font-medium">Cliente</th>
                        <th className="px-6 py-4 font-medium">Pacote</th>
                        <th className="px-6 py-4 font-medium">Data</th>
                        <th className="px-6 py-4 font-medium">Valor</th>
                        <th className="px-6 py-4 font-medium text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {orders.length === 0 ? (
                         <tr>
                           <td colSpan={5} className="px-6 py-12 text-center text-gray-500 text-sm">Nenhum pedido encontrado.</td>
                         </tr>
                      ) : orders.map(order => (
                        <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900">{order.customer_name}</div>
                            <div className="text-xs text-gray-500">{order.customer_email}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 font-medium">{order.package_id}</div>
                            <div className="text-xs text-gray-500">{order.guests_adults} pessoas</div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {formatDate(order.created_at)}
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                            {formatBRL(order.total_cents)}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {order.status === 'paid' && <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Aprovado</span>}
                            {order.status === 'pending' && <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">Pendente</span>}
                            {order.status === 'failed' && <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Recusado</span>}
                            {order.status === 'canceled' && <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Cancelado</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="max-w-3xl space-y-6 animate-in fade-in duration-500">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Configurações Pagar.me</h2>
                <p className="text-gray-500 text-sm mt-1">Conecte sua conta para receber pagamentos.</p>
              </div>

              <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-6 md:p-8">
                <form onSubmit={handleSaveConfig} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900">Ambiente de Transação</label>
                    <select
                      value={environment}
                      onChange={(e) => setEnvironment(e.target.value)}
                      className="mt-2 block w-full pl-3 pr-10 py-3 text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 rounded-xl bg-gray-50"
                    >
                      <option value="sandbox">Sandbox (Modo de Testes)</option>
                      <option value="production">Produção (Pagamentos Reais)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900">
                      Secret Key (API V5)
                    </label>
                    <div className="mt-2 flex rounded-md shadow-sm">
                      <input
                        type="password"
                        value={pagarmeKey}
                        onChange={(e) => setPagarmeKey(e.target.value)}
                        placeholder={hasKeyConfigured ? "************************ (Chave já configurada)" : "Insira sua Secret Key (sk_...)"}
                        className="flex-1 min-w-0 block w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm transition-colors"
                      />
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      A chave será guardada de forma segura com criptografia AES-256. Deixe em branco caso já tenha configurado e não queira alterar.
                    </p>
                  </div>

                  {message.text && (
                    <div className={\`p-4 rounded-xl text-sm font-medium \${message.type === 'error' ? 'bg-red-50 border border-red-100 text-red-700' : 'bg-green-50 border border-green-100 text-green-700'}\`}>
                      {message.text}
                    </div>
                  )}

                  <div className="pt-4 border-t border-gray-100">
                    <button
                      type="submit"
                      disabled={saving}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-6 rounded-xl shadow-lg shadow-red-600/20 text-sm font-bold text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 transition-all hover:-translate-y-0.5 active:translate-y-0"
                    >
                      <Save className="h-4 w-4" />
                      {saving ? 'Salvando dados...' : 'Salvar Configurações'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
