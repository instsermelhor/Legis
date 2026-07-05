/**
 * adminMockKpis.ts (nome histórico) — KPIs REAIS do backoffice.
 * Hook `useAdminKpis()` monta os dados a partir de /api/admin/metricas.
 */
import { useEffect, useState } from 'react';
import { backend, type MetricasAdmin } from '../../../services/modules';

export interface KpiMetric {
  label: string;
  value: string;
  rawValue: number;
  prevValue: number;
  unit?: string;
  description?: string;
  color: 'emerald' | 'blue' | 'violet' | 'amber' | 'rose' | 'indigo';
  icon: string;
}

export interface RevenueDataPoint {
  month: string;
  receita: number;
  custos: number; // valores em aberto (pendente/atrasado)
  lucro: number;
}

export interface UserDistributionItem {
  name: string;
  value: number;
  color: string;
}

const fmtBRL = (v: number) => `R$ ${v.toLocaleString('pt-BR')}`;

const CORES_TIPO: Record<string, { nome: string; cor: string }> = {
  advogado:   { nome: 'Advogados',        cor: '#7C3AED' },
  cliente:    { nome: 'Clientes',          cor: '#2563EB' },
  bacharel:   { nome: 'Bacharelandos',     cor: '#0891B2' },
  secretario: { nome: 'Secret./Assist.',   cor: '#7E22CE' },
  admin:      { nome: 'Administradores',   cor: '#4F46E5' },
};

const NOME_MES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const rotuloMes = (mesIso: string) => {
  const [ano, mes] = mesIso.split('-');
  return `${NOME_MES[Number(mes) - 1]}/${ano.slice(2)}`;
};

export interface AdminKpis {
  kpis: KpiMetric[];
  revenueData: RevenueDataPoint[];
  userDistribution: UserDistributionItem[];
  carregando: boolean;
}

/** KPIs reais do painel admin, direto do PostgreSQL via API. */
export function useAdminKpis(): AdminKpis {
  const [dados, setDados] = useState<AdminKpis>({
    kpis: [], revenueData: [], userDistribution: [], carregando: true,
  });

  useEffect(() => {
    backend.admin.metricas().then((m: MetricasAdmin) => {
      const totalPessoas = m.pessoas_por_tipo.reduce((s, t) => s + t.total, 0);
      const ativos = m.pessoas_por_tipo.reduce((s, t) => s + t.ativos, 0);
      const processosAtivos = m.processos_por_status.find(p => p.status === 'Em Andamento')?.total ?? 0;
      const totalProcessos = m.processos_por_status.reduce((s, p) => s + p.total, 0);
      const contratosAtivos = m.contratos_por_status.find(c => c.status === 'ativo')?.total ?? 0;
      const receitaMes = m.receita_por_mes.at(-1)?.recebido ?? 0;
      const receitaMesAnterior = m.receita_por_mes.at(-2)?.recebido ?? 0;

      setDados({
        carregando: false,
        kpis: [
          { label: 'Receita do Mês', value: fmtBRL(receitaMes), rawValue: receitaMes, prevValue: receitaMesAnterior, description: 'Honorários recebidos', color: 'emerald', icon: '💰' },
          { label: 'Usuários Ativos', value: String(ativos), rawValue: ativos, prevValue: ativos, description: `${totalPessoas} contas no total`, color: 'blue', icon: '👥' },
          { label: 'Processos Ativos', value: String(processosAtivos), rawValue: processosAtivos, prevValue: processosAtivos, description: `${totalProcessos} na plataforma`, color: 'violet', icon: '⚖️' },
          { label: 'Contratos Ativos', value: String(contratosAtivos), rawValue: contratosAtivos, prevValue: contratosAtivos, description: 'Serviços em execução', color: 'indigo', icon: '📋' },
          { label: 'Escritórios', value: String(Math.max(0, m.tenants.length - 1)), rawValue: m.tenants.length - 1, prevValue: m.tenants.length - 1, description: 'Tenants ativos', color: 'amber', icon: '🏢' },
          { label: 'Em Aberto', value: fmtBRL(m.receita.pendente), rawValue: m.receita.pendente, prevValue: m.receita.pendente, description: 'Valores a receber', color: 'rose', icon: '📉' },
        ],
        revenueData: m.receita_por_mes.map(r => ({
          month: rotuloMes(r.mes),
          receita: r.recebido,
          custos: 0,
          lucro: r.recebido,
        })),
        userDistribution: m.pessoas_por_tipo
          .filter(t => t.total > 0)
          .map(t => ({
            name: CORES_TIPO[t.tipo]?.nome ?? t.tipo,
            value: t.total,
            color: CORES_TIPO[t.tipo]?.cor ?? '#6B7280',
          })),
      });
    }).catch(() => setDados(d => ({ ...d, carregando: false })));
  }, []);

  return dados;
}

// ── Helper: variação MoM ──────────────────────────────────────────────────────
export function calcMoM(current: number, previous: number): { pct: number; positive: boolean } {
  if (previous === 0) return { pct: 0, positive: true };
  const pct = parseFloat(((current - previous) / previous * 100).toFixed(1));
  return { pct: Math.abs(pct), positive: pct >= 0 };
}
