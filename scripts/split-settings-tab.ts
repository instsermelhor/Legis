/**
 * scripts/split-settings-tab.ts
 * Extrai os subcomponentes de SettingsTab.tsx para arquivos separados.
 * Execução: npx tsx scripts/split-settings-tab.ts
 */

import * as fs from 'fs';
import * as path from 'path';

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'components/admin/SettingsTab.tsx');
const DEST_DIR = path.join(ROOT, 'components/admin/settings');

// Imports comuns usados pelos subcomponentes
const COMMON_IMPORTS = `import { Icon } from '@/components/common/IconComponents';
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { SectionTitle, IconEdit, IconPlus, IconKey, IconUpload, IconTrash } from '../AdminShared';
`;

const content = fs.readFileSync(SRC, 'utf8');
const lines = content.split('\n');

// Helper: extrai linhas [from, to] (1-indexed)
function extractLines(from: number, to: number): string {
  return lines.slice(from - 1, to).join('\n');
}

// Garante que o diretório existe
if (!fs.existsSync(DEST_DIR)) {
  fs.mkdirSync(DEST_DIR, { recursive: true });
}

// Escreve um subcomponente com cabeçalho adequado
function writeSubcomponent(filename: string, header: string, body: string) {
  const filepath = path.join(DEST_DIR, filename);
  const fullContent = `${header}\n\n${body}\n`;
  fs.writeFileSync(filepath, fullContent, 'utf8');
  console.log(`✅ Extraído: components/admin/settings/${filename} (${body.split('\n').length} linhas)`);
}

// 1. LegalDocuments (35-193) — inclui extractPrintableText helper
const legalDocumentsBody = extractLines(1, 193); // Inclui helper + componente

// 2. AdminUsers (194-1233)
const adminUsersBody = extractLines(194, 1233);

// 3. GeneralSettings (1234-3459)
const generalSettingsBody = extractLines(1234, 3459);

// 4. ServiceGroupsSettings (3460-3544)
const serviceGroupsBody = extractLines(3460, 3544);

// 5. LegalCodesSettings (3545-3802)
const legalCodesBody = extractLines(3545, 3802);

// 6. DatabaseSettings (3803-4179)
const databaseSettingsBody = extractLines(3803, 4179);

// 7. APIConnections (4180-4516)
const apiConnectionsBody = extractLines(4180, 4516);

// 8. Hub + SettingsTab export (4517-4683)
const settingsHubBody = extractLines(4517, 4683);

// ─── Header dos imports específicos por subcomponente ───────────────

const legalDocsHeader = `/**
 * components/admin/settings/LegalDocumentsSettings.tsx
 * Extraído de SettingsTab.tsx (B-4 refatoração)
 * Gerencia documentos legais da plataforma (Termos, Política, etc.)
 */
${COMMON_IMPORTS}
import { mockLegalDocuments } from '../../../services/mockDataService';
import type { LegalDocument } from '../../../services/mockDataService';`;

const adminUsersHeader = `/**
 * components/admin/settings/AdminUsersSettings.tsx
 * Extraído de SettingsTab.tsx (B-4 refatoração)
 * Gerencia usuários administrativos e suas permissões.
 */
${COMMON_IMPORTS}
import { mockAdminUsers, hashPassword } from '../../../services/mockDataService';
import type { AdminUser } from '../../../services/mockDataService';`;

const generalSettingsHeader = `/**
 * components/admin/settings/GeneralSettings.tsx
 * Extraído de SettingsTab.tsx (B-4 refatoração)
 * Configurações gerais da plataforma (nome, logo, contato, etc.)
 */
${COMMON_IMPORTS}
import { mockEfficiencyServiceGroups } from '../../../services/mockDataService';
import { useAppConfig } from '../../../context/AppContext';
import { LegalAiTools } from '../../common/LegalAiTools';
import type { BiApoio, BiDadosBase, BiCliente, BiProduto, BiFornecedor, BiVenda } from '../../../types';
import { mockBiApoio, mockBiDadosBase, mockBiClientes, mockBiProdutos, mockBiFornecedores, mockBiVendas } from '../../../services/mockDataService';`;

const serviceGroupsHeader = `/**
 * components/admin/settings/ServiceGroupsSettings.tsx
 * Extraído de SettingsTab.tsx (B-4 refatoração)
 * Gerencia grupos e itens de serviços de eficiência jurídica.
 */
${COMMON_IMPORTS}
import type { EfficiencyServiceGroup } from '../../../types';`;

const legalCodesHeader = `/**
 * components/admin/settings/LegalCodesSettings.tsx
 * Extraído de SettingsTab.tsx (B-4 refatoração)
 * Gerencia códigos e versões de documentos legais codificados.
 */
${COMMON_IMPORTS}
import { dbCodes, LegalCode, dbCloud, CodeVersion } from '../../../services/dbService';`;

const databaseHeader = `/**
 * components/admin/settings/DatabaseSettings.tsx
 * Extraído de SettingsTab.tsx (B-4 refatoração)
 * Configurações de banco de dados e integração com cloud.
 */
${COMMON_IMPORTS}`;

const apiHeader = `/**
 * components/admin/settings/APIConnections.tsx
 * Extraído de SettingsTab.tsx (B-4 refatoração)
 * Gerencia conexões com APIs externas (WhatsApp, pagamento, etc.)
 */
${COMMON_IMPORTS}`;

const hubHeader = `/**
 * components/admin/settings/SettingsHub.tsx
 * Extraído de SettingsTab.tsx (B-4 refatoração)
 * Hub principal de configurações — grid de navegação entre seções.
 */
${COMMON_IMPORTS}
import { LegalDocumentsSettings } from './LegalDocumentsSettings';
import { AdminUsersSettings } from './AdminUsersSettings';
import { GeneralSettings } from './GeneralSettings';
import { ServiceGroupsSettings } from './ServiceGroupsSettings';
import { LegalCodesSettings } from './LegalCodesSettings';
import { DatabaseSettings } from './DatabaseSettings';
import { APIConnections } from './APIConnections';`;

// Escreve os arquivos
writeSubcomponent('LegalDocumentsSettings.tsx', legalDocsHeader, legalDocumentsBody);
writeSubcomponent('AdminUsersSettings.tsx', adminUsersHeader, adminUsersBody);
writeSubcomponent('GeneralSettings.tsx', generalSettingsHeader, generalSettingsBody);
writeSubcomponent('ServiceGroupsSettings.tsx', serviceGroupsHeader, serviceGroupsBody);
writeSubcomponent('LegalCodesSettings.tsx', legalCodesHeader, legalCodesBody);
writeSubcomponent('DatabaseSettings.tsx', databaseHeader, databaseSettingsBody);
writeSubcomponent('APIConnections.tsx', apiHeader, apiConnectionsBody);
writeSubcomponent('SettingsHub.tsx', hubHeader, settingsHubBody);

console.log('\n✅ Extração concluída. SettingsTab.tsx pode agora ser simplificado para um re-export do SettingsHub.');
console.log('⚠️  NOTA: Verifique os imports em cada arquivo gerado e ajuste conforme necessário.');
