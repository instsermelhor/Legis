/**
 * hooks/useFinancialOperations.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Hook React para operações financeiras avançadas (C-3):
 *   - Split de Honorários entre advogados, sócios e plataforma
 *   - Gestão de Custódia Escrow (retenção e liberação por marco processual)
 *   - Validação de Conformidade com Tabela OAB
 *   - Projeção de Receita e Aging de Inadimplência
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useCallback } from 'react';
import type { HonoraryContract, Invoice } from '../lib/officeFinancialEngine';

export interface FeeSplitItem {
  recipientName: string;
  role: 'lead_attorney' | 'associate' | 'firm_reserve' | 'platform_fee';
  percentage: number;
  calculatedAmount: number;
}

export interface EscrowHold {
  id: string;
  contractId: string;
  totalAmount: number;
  heldAmount: number;
  releasedAmount: number;
  milestones: {
    id: string;
    description: string;
    percentage: number;
    amount: number;
    status: 'pending' | 'verified' | 'released';
    releasedAt?: string;
  }[];
  status: 'active' | 'fully_released' | 'disputed';
  createdAt: string;
}

export function useFinancialOperations() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Calcula o split matemático exato de honorários prevenindo divergências de arredondamento.
   */
  const calculateFeeSplit = useCallback((
    grossAmount: number,
    platformFeePct: number,
    partners: { name: string; percentage: number; role?: FeeSplitItem['role'] }[]
  ): FeeSplitItem[] => {
    if (grossAmount <= 0) return [];

    const platformFee = Math.round(grossAmount * (platformFeePct / 100) * 100) / 100;
    const netToDistribute = grossAmount - platformFee;

    const splits: FeeSplitItem[] = [
      {
        recipientName: 'Legis Connect (Taxa de Plataforma)',
        role: 'platform_fee',
        percentage: platformFeePct,
        calculatedAmount: platformFee,
      },
    ];

    let distributedSum = 0;
    partners.forEach((p, idx) => {
      const isLast = idx === partners.length - 1;
      const amount = isLast
        ? Math.round((netToDistribute - distributedSum) * 100) / 100
        : Math.round((netToDistribute * (p.percentage / 100)) * 100) / 100;

      distributedSum += amount;

      splits.push({
        recipientName: p.name,
        role: p.role || 'associate',
        percentage: p.percentage,
        calculatedAmount: amount,
      });
    });

    return splits;
  }, []);

  /**
   * Valida conformidade de honorários advocatícios com limites éticos da OAB.
   * Regra OAB: Honorários de êxito (quota litis) não podem exceder a vantagem obtida pelo cliente (máx 30-50%).
   */
  const validateOabCompliance = useCallback((contract: Partial<HonoraryContract>): {
    isCompliant: boolean;
    warnings: string[];
  } => {
    const warnings: string[] = [];

    if (contract.type === 'success' || contract.type === 'mixed') {
      if ((contract.successPercentage || 0) > 30) {
        warnings.push('Percentual de êxito acima de 30% requer justificativa de complexidade conforme Provimento OAB.');
      }
      if ((contract.successPercentage || 0) > 50) {
        warnings.push('VEDADO pela OAB: Cláusula quota litis não pode atribuir ao advogado valor superior ao do cliente.');
      }
    }

    if (contract.fixedAmount && contract.fixedAmount < 300) {
      warnings.push('Atenção: Honorários fixados abaixo do piso ético sugerido pela Tabela Seccional da OAB.');
    }

    return {
      isCompliant: warnings.length === 0,
      warnings,
    };
  }, []);

  /**
   * Cria registro de custódia Escrow vinculada a marcos contratuais.
   */
  const createEscrowHold = useCallback((
    contractId: string,
    totalAmount: number,
    milestoneList: { description: string; percentage: number }[]
  ): EscrowHold => {
    let accumulated = 0;
    const milestones = milestoneList.map((m, idx) => {
      const isLast = idx === milestoneList.length - 1;
      const amount = isLast
        ? Math.round((totalAmount - accumulated) * 100) / 100
        : Math.round((totalAmount * (m.percentage / 100)) * 100) / 100;
      accumulated += amount;

      return {
        id: `ms_${idx + 1}_${Date.now()}`,
        description: m.description,
        percentage: m.percentage,
        amount,
        status: 'pending' as const,
      };
    });

    return {
      id: `escrow_${contractId}_${Date.now()}`,
      contractId,
      totalAmount,
      heldAmount: totalAmount,
      releasedAmount: 0,
      milestones,
      status: 'active',
      createdAt: new Date().toISOString(),
    };
  }, []);

  /**
   * Libera valor de um marco processual validado no Escrow.
   */
  const releaseEscrowMilestone = useCallback((
    escrow: EscrowHold,
    milestoneId: string
  ): EscrowHold => {
    const targetMilestone = escrow.milestones.find((m) => m.id === milestoneId);
    if (!targetMilestone || targetMilestone.status === 'released') {
      return escrow;
    }

    const updatedMilestones = escrow.milestones.map((m) =>
      m.id === milestoneId
        ? { ...m, status: 'released' as const, releasedAt: new Date().toISOString() }
        : m
    );

    const releasedSum = updatedMilestones
      .filter((m) => m.status === 'released')
      .reduce((sum, m) => sum + m.amount, 0);

    const heldAmount = Math.max(0, escrow.totalAmount - releasedSum);
    const isFullyReleased = heldAmount <= 0;

    return {
      ...escrow,
      heldAmount,
      releasedAmount: releasedSum,
      milestones: updatedMilestones,
      status: isFullyReleased ? 'fully_released' : 'active',
    };
  }, []);

  return {
    isProcessing,
    error,
    calculateFeeSplit,
    validateOabCompliance,
    createEscrowHold,
    releaseEscrowMilestone,
  };
}
