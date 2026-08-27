import { Icon } from '@/components/common/IconComponents';
import React, { useState } from 'react';
import { mockLegalDocuments, mockAdminUsers, mockEfficiencyServiceGroups, hashPassword, mockBiApoio, mockBiDadosBase, mockBiClientes, mockBiProdutos, mockBiFornecedores, mockBiVendas } from '../../../services/mockDataService';
import type { LegalDocument, AdminUser } from '../../../services/mockDataService';
import { SectionTitle, IconEdit, IconPlus, IconKey, IconUpload, IconTrash } from '../AdminShared';
import { dbCodes, LegalCode, dbCloud, CodeVersion } from '../../../services/dbService';
import { useAppConfig } from '../../../context/AppContext';
import type { EfficiencyServiceGroup, BiApoio, BiDadosBase, BiCliente, BiProduto, BiFornecedor, BiVenda } from '../../../types';
import { LegalAiTools } from '../../common/LegalAiTools';


// Helper to extract printable ASCII text from binary files (e.g. PDF/DOCX) to prevent garbled text
const extractPrintableText = (arrayBuffer: ArrayBuffer, limit: number = 2000): string => {
  const view = new DataView(arrayBuffer);
  let result = '';
  let currentWord = '';
  for (let i = 0; i < view.byteLength && result.length < limit; i++) {
    const charCode = view.getUint8(i);
    if ((charCode >= 32 && charCode <= 126) || charCode === 10 || charCode === 13 || charCode === 9) {
      const char = String.fromCharCode(charCode);
      currentWord += char;
    } else {
      if (currentWord.trim().length > 4) {
        result += currentWord.trim() + '\n';
      }
      currentWord = '';
    }
  }
  if (currentWord.trim().length > 4) {
    result += currentWord.trim();
  }
  return result.replace(/\n+/g, '\n').substring(0, limit);
};


// ─── General Settings ─────────────────────────────────────────────────────────
export const GeneralSettings: React.FC = () => {
  const { config, updateConfig, setLogoFromFile } = useAppConfig();
  const [appName, setAppName] = useState(config.appName || '');
  const [siteTagline, setSiteTagline] = useState(config.siteTagline || '');
  const [footerText, setFooterText] = useState(config.footerText || '');
  const [contactEmail, setContactEmail] = useState(config.contactEmail || '');
  const [contactPhone, setContactPhone] = useState(config.contactPhone || '');
  const [customFields, setCustomFields] = useState<{ id: string; key: string; value: string }[]>(() => config.customFields || []);
  
  // Custom fields form state
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  
  const [saved, setSaved] = useState(false);

  // BI support & transational data states
  const [biApoio, setBiApoio] = useState<BiApoio>(() => {
    const saved = localStorage.getItem('legis_bi_tb_apoio');
    return saved ? JSON.parse(saved) : mockBiApoio;
  });

  const [biDadosBase, setBiDadosBase] = useState<BiDadosBase[]>(() => {
    const saved = localStorage.getItem('legis_bi_tb_dados_base');
    return saved ? JSON.parse(saved) : mockBiDadosBase;
  });

  // New BI Equipamentos/Serviços de Eficiência states
  const [biClientes, setBiClientes] = useState<BiCliente[]>(() => {
    const saved = localStorage.getItem('legis_bi_clientes');
    return saved ? JSON.parse(saved) : mockBiClientes;
  });

  const [biProdutos, setBiProdutos] = useState<BiProduto[]>(() => {
    const saved = localStorage.getItem('legis_bi_produtos');
    const parsed = saved ? JSON.parse(saved) : mockBiProdutos;
    if (parsed.length > 0 && parsed[0].codigo && !parsed[0].codigo.startsWith('G')) {
      localStorage.setItem('legis_bi_produtos', JSON.stringify(mockBiProdutos));
      return mockBiProdutos;
    }
    return parsed;
  });

  const [biFornecedores, setBiFornecedores] = useState<BiFornecedor[]>(() => {
    const saved = localStorage.getItem('legis_bi_fornecedores');
    const parsed = saved ? JSON.parse(saved) : mockBiFornecedores;
    const needsMigration = parsed.some((f: BiFornecedor) => f.codigo === 'F01' || f.codigo === 'F02' || f.codigo === 'F03') || !parsed.some((f: BiFornecedor) => f.codigo === 'F0001');
    if (needsMigration) {
      localStorage.setItem('legis_bi_fornecedores', JSON.stringify(mockBiFornecedores));
      // NOTE: Do NOT reset biVendas here — fornecedor migration should not destroy sales data
      return mockBiFornecedores;
    }
    return parsed;
  });

  const [biVendas, setBiVendas] = useState<BiVenda[]>(() => {
    const saved = localStorage.getItem('legis_bi_vendas');
    let data = saved ? JSON.parse(saved) : mockBiVendas;
    const hasOldFornecedor = data.some((v: BiVenda) => v.fornecedor && (v.fornecedor.startsWith('F01') || v.fornecedor.startsWith('F02') || v.fornecedor.startsWith('F03')));
    if (hasOldFornecedor || (data.length > 0 && data[0].produto && !data[0].produto.startsWith('G'))) {
      data = mockBiVendas;
      localStorage.setItem('legis_bi_vendas', JSON.stringify(mockBiVendas));
    }
    const migrated = data.map((v: BiVenda) => {
      let status = v.status_aluguel as string;
      if (status === 'Devolvido') status = 'Entregue';
      else if (status === 'Não devolvido') status = 'Cancelado';
      else if (status === 'Não retirado ainda') status = 'Em Realização';
      return { ...v, status_aluguel: status as BiVenda['status_aluguel'] };
    });
    return migrated;
  });

  const [biSubTab, setBiSubTab] = useState<'excel_ums' | 'servicos_aluguel'>('excel_ums');
  const [biAluguelTab, setBiAluguelTab] = useState<'clientes' | 'produtos' | 'fornecedores' | 'vendas'>('vendas');

  const [showAluguelForm, setShowAluguelForm] = useState(false);
  const [editingAluguelId, setEditingAluguelId] = useState<string | null>(null);

  // Form states for dim_clientes
  const [clientForm, setClientForm] = useState<BiCliente>({ codigo: '', nome: '', cpf_cnpj: '', cidade: '', estado: '', lista_concatenada: '' });
  // Form states for dim_produtos
  const [productForm, setProductForm] = useState<BiProduto>({ codigo: '', nome: '', descricao: '', custo: 0, preco_tabela: 0, lista_concatenada: '' });
  // Form states for dim_fornecedores
  const [supplierForm, setSupplierForm] = useState<BiFornecedor>({ codigo: '', nome: '', cpf_cnpj: '', estado: '', lista_concatenada: '' });
  // Form states for fato_vendas
  const [saleForm, setSaleForm] = useState<BiVenda>({
    id_tab: '',
    fornecedor: '',
    cliente: '',
    produto: '',
    qtd: 1,
    vlr_unit: 0,
    valor_total: 0,
    custo_prod: 0,
    lucro: 0,
    data: '',
    data_referencia: '',
    data_retirada: '',
    data_devolucao: '',
    status_pagamento: 'Pago',
    status_aluguel: 'Entregue',
  });

  const [docTab, setDocTab] = useState('DAX (Power BI)');
  const [showTxForm, setShowTxForm] = useState(false);
  const [editingTxId, setEditingTxId] = useState<number | null>(null);
  const [txForm, setTxForm] = useState<BiDadosBase>({
    id_tab: 0,
    semestre: '1º sem',
    valor_ums: 5.2,
    mes_ano: '',
    executado_ums: 0,
    receita_fat: 0,
    transferencia_recebida: 0,
    despesa_total: 0,
    custo: 0,
    imposto: 0,
    juros: 0,
    salarios_ordenados: 0,
    glosa: 0,
    emissao_nf: '',
    recebimento_nf: '',
  });

  // Double-Click Inline Editing states
  const [customLabels, setCustomLabels] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('legis_bi_custom_labels');
    const defaults = {
      tab_excel_ums: 'Geral (Excel UMS)',
      tab_servicos_aluguel: 'Config. Serviços',
      sub_vendas: 'Fato Vendas (Serviços)',
      sub_clientes: 'Dim Clientes',
      sub_produtos: 'Dim Produtos',
      sub_fornecedores: 'Dim Fornecedores'
    };
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.tab_servicos_aluguel === 'Aluguer de Equipamentos') {
        parsed.tab_servicos_aluguel = 'Config. Serviços';
      }
      if (parsed.sub_vendas === 'fato_vendas (Alugueres)' || parsed.sub_vendas === 'Fato Vendas(Servicos)' || parsed.sub_vendas === 'Fato Vendas(Servicos') {
        parsed.sub_vendas = 'Fato Vendas (Serviços)';
      }
      if (parsed.sub_clientes === 'dim_clientes (Clientes)') {
        parsed.sub_clientes = 'Dim Clientes';
      }
      if (parsed.sub_produtos === 'dim_produtos (Produtos)' || parsed.sub_produtos === 'Dim Serviços') {
        parsed.sub_produtos = 'Dim Produtos';
      }
      if (parsed.sub_fornecedores === 'dim_fornecedores (Fornecedores)') {
        parsed.sub_fornecedores = 'Dim Fornecedores';
      }
      return parsed;
    }
    return defaults;
  });

  interface ActiveInlineEditor {
    type: 'label' | 'cell';
    targetId: string;
    field?: string;
    value: string;
  }
  const [activeInlineEditor, setActiveInlineEditor] = useState<ActiveInlineEditor | null>(null);

  const isSuperAdmin = () => {
    try {
      const userRaw = localStorage.getItem('legis_user');
      if (!userRaw) return false;
      const user = JSON.parse(userRaw);
      if (user.role !== 'admin') return false;

      const rawAdmins = localStorage.getItem('legis_admin_users');
      const adminUsersList = rawAdmins ? JSON.parse(rawAdmins) : [
        { id: 1, name: 'Super Admin', email: 'legisconnectonline@gmail.com', password: '$locked$', role: 'super', createdAt: '2024-01-01', active: true }
      ];

      const matched = adminUsersList.find((u: AdminUser) => u.email.toLowerCase() === user.email.toLowerCase());
      return matched?.role === 'super';
    } catch {
      return false;
    }
  };

  const handleLabelDoubleClick = (key: string, currentValue: string) => {
    if (!isSuperAdmin()) return;
    setActiveInlineEditor({
      type: 'label',
      targetId: key,
      value: currentValue
    });
  };

  const handleSaveLabel = (key: string, newValue: string) => {
    if (!newValue.trim()) {
      setActiveInlineEditor(null);
      return;
    }
    const updated = { ...customLabels, [key]: newValue.trim() };
    setCustomLabels(updated);
    localStorage.setItem('legis_bi_custom_labels', JSON.stringify(updated));
    setActiveInlineEditor(null);
  };

  const handleSaveClientCell = (index: number, field: keyof BiCliente, newValue: string) => {
    const oldClient = biClientes[index];
    if (!oldClient) return;
    const oldConcat = oldClient.lista_concatenada;

    const updatedClient = { ...oldClient, [field]: newValue };
    if (field === 'codigo' || field === 'nome') {
      updatedClient.lista_concatenada = `${updatedClient.codigo} - ${updatedClient.nome}`;
    }

    const nextClientes = [...biClientes];
    nextClientes[index] = updatedClient;
    setBiClientes(nextClientes);
    localStorage.setItem('legis_bi_clientes', JSON.stringify(nextClientes));

    if (updatedClient.lista_concatenada !== oldConcat) {
      const updatedSales = biVendas.map(v => {
        if (v.cliente === oldConcat) {
          return { ...v, cliente: updatedClient.lista_concatenada };
        }
        return v;
      });
      setBiVendas(updatedSales);
      localStorage.setItem('legis_bi_vendas', JSON.stringify(updatedSales));
    }

    setActiveInlineEditor(null);
  };

  const handleSaveProductCell = (index: number, field: keyof BiProduto, newValue: string | number) => {
    const oldProduct = biProdutos[index];
    if (!oldProduct) return;
    const oldConcat = oldProduct.lista_concatenada;

    const parsedValue = (field === 'custo' || field === 'preco_tabela') ? Number(newValue) : newValue;
    const updatedProduct = { ...oldProduct, [field]: parsedValue };
    if (field === 'codigo' || field === 'nome') {
      updatedProduct.lista_concatenada = `${updatedProduct.codigo} - ${updatedProduct.nome}`;
    }

    const nextProdutos = [...biProdutos];
    nextProdutos[index] = updatedProduct as BiProduto;
    setBiProdutos(nextProdutos);
    localStorage.setItem('legis_bi_produtos', JSON.stringify(nextProdutos));

    if (updatedProduct.lista_concatenada !== oldConcat) {
      const updatedSales = biVendas.map(v => {
        if (v.produto === oldConcat) {
          return { ...v, produto: updatedProduct.lista_concatenada };
        }
        return v;
      });
      setBiVendas(updatedSales);
      localStorage.setItem('legis_bi_vendas', JSON.stringify(updatedSales));
    }

    setActiveInlineEditor(null);
  };

  const handleSaveSupplierCell = (index: number, field: keyof BiFornecedor, newValue: string) => {
    const oldSupplier = biFornecedores[index];
    if (!oldSupplier) return;
    const oldConcat = oldSupplier.lista_concatenada;

    const updatedSupplier = { ...oldSupplier, [field]: newValue };
    if (field === 'codigo' || field === 'nome') {
      updatedSupplier.lista_concatenada = `${updatedSupplier.codigo} - ${updatedSupplier.nome}`;
    }

    const nextFornecedores = [...biFornecedores];
    nextFornecedores[index] = updatedSupplier;
    setBiFornecedores(nextFornecedores);
    localStorage.setItem('legis_bi_fornecedores', JSON.stringify(nextFornecedores));

    if (updatedSupplier.lista_concatenada !== oldConcat) {
      const updatedSales = biVendas.map(v => {
        if (v.fornecedor === oldConcat) {
          return { ...v, fornecedor: updatedSupplier.lista_concatenada };
        }
        return v;
      });
      setBiVendas(updatedSales);
      localStorage.setItem('legis_bi_vendas', JSON.stringify(updatedSales));
    }

    setActiveInlineEditor(null);
  };

  const handleSaveSaleCell = (index: number, field: keyof BiVenda, newValue: string | number) => {
    const oldSale = biVendas[index];
    if (!oldSale) return;

    let updatedSale = { ...oldSale };

    if (field === 'produto') {
      const prodVal = String(newValue);
      const matched = biProdutos.find(p => p.lista_concatenada === prodVal);
      const nextQtd = oldSale.qtd;
      const nextVlr = matched ? matched.preco_tabela : oldSale.vlr_unit;
      const nextCusto = matched ? matched.custo : oldSale.custo_prod;
      const nextTotal = nextQtd * nextVlr;
      const nextLucro = nextTotal - (nextQtd * nextCusto);
      updatedSale = {
        ...oldSale,
        produto: prodVal,
        vlr_unit: nextVlr,
        custo_prod: nextCusto,
        valor_total: nextTotal,
        lucro: nextLucro
      };
    } else if (field === 'qtd') {
      const nextQtd = Number(newValue);
      const nextTotal = nextQtd * oldSale.vlr_unit;
      const nextLucro = nextTotal - (nextQtd * oldSale.custo_prod);
      updatedSale = {
        ...oldSale,
        qtd: nextQtd,
        valor_total: nextTotal,
        lucro: nextLucro
      };
    } else if (field === 'valor_total') {
      const nextTotal = Number(newValue);
      const nextLucro = nextTotal - (oldSale.qtd * oldSale.custo_prod);
      updatedSale = {
        ...oldSale,
        valor_total: nextTotal,
        lucro: nextLucro
      };
    } else if (field === 'lucro') {
      updatedSale = {
        ...oldSale,
        lucro: Number(newValue)
      };
    } else if (field === 'vlr_unit' || field === 'custo_prod') {
      updatedSale = {
        ...oldSale,
        [field]: Number(newValue)
      };
    } else {
      updatedSale = {
        ...oldSale,
        [field]: newValue as never
      };
    }

    const nextVendas = [...biVendas];
    nextVendas[index] = updatedSale as BiVenda;
    setBiVendas(nextVendas);
    localStorage.setItem('legis_bi_vendas', JSON.stringify(nextVendas));

    setActiveInlineEditor(null);
  };

  const handleSaveTxCell = (index: number, field: keyof BiDadosBase, newValue: string | number) => {
    const oldTx = biDadosBase[index];
    if (!oldTx) return;

    let parsedValue = newValue;
    if (field === 'mes_ano' || field === 'semestre' || field === 'emissao_nf' || field === 'recebimento_nf') {
      parsedValue = String(newValue);
    } else {
      parsedValue = Number(newValue);
    }

    const updatedTx = { ...oldTx, [field]: parsedValue };

    const nextBase = [...biDadosBase];
    nextBase[index] = updatedTx as BiDadosBase;
    setBiDadosBase(nextBase);
    localStorage.setItem('legis_bi_tb_dados_base', JSON.stringify(nextBase));

    setActiveInlineEditor(null);
  };

  const renderEditableCell = (
    value: string | number | undefined,
    onSave: (val: string) => void,
    options?: {
      type?: 'text' | 'number' | 'date' | 'select';
      selectOptions?: string[];
      displayValue?: string;
      className?: string;
      onDoubleClickKey: string;
    }
  ) => {
    const isSuper = isSuperAdmin();
    const type = options?.type || 'text';
    const isEditing = activeInlineEditor?.type === 'cell' && activeInlineEditor.targetId === options?.onDoubleClickKey;
    const displayVal = options?.displayValue !== undefined ? options.displayValue : String(value);

    if (isSuper && isEditing) {
      if (type === 'select' && options?.selectOptions) {
        return (
          <select
            autoFocus
            className={`border border-purple-500 rounded px-1.5 py-0.5 text-xs bg-white dark:bg-[#1A1730] dark:text-white ${options?.className || ''}`}
            value={activeInlineEditor.value}
            onChange={e => {
              setActiveInlineEditor({ ...activeInlineEditor, value: e.target.value });
              onSave(e.target.value);
            }}
            onBlur={() => onSave(activeInlineEditor.value)}
            onKeyDown={e => {
              if (e.key === 'Escape') setActiveInlineEditor(null);
            }}
          >
            {options.selectOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        );
      }
      return (
        <input
          autoFocus
          type={type}
          className={`border border-purple-500 rounded px-1.5 py-0.5 text-xs bg-white dark:bg-[#1A1730] dark:text-white ${options?.className || ''}`}
          value={activeInlineEditor.value}
          onChange={e => setActiveInlineEditor({ ...activeInlineEditor, value: e.target.value })}
          onBlur={() => onSave(activeInlineEditor.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') onSave(activeInlineEditor.value);
            if (e.key === 'Escape') setActiveInlineEditor(null);
          }}
        />
      );
    }

    return (
      <span
        onDoubleClick={() => {
          if (!isSuper) return;
          setActiveInlineEditor({
            type: 'cell',
            targetId: options!.onDoubleClickKey,
            value: String(value)
          });
        }}
        className={`${isSuper ? 'cursor-pointer hover:bg-purple-50/50 hover:text-purple-600 dark:hover:bg-purple-950/30 transition-all rounded px-1 -mx-1' : ''} ${options?.className || ''}`}
        title={isSuper ? 'Duplo clique para editar' : undefined}
      >
        {displayVal}
      </span>
    );
  };

  const renderEditableLabel = (
    labelKey: string,
    defaultVal: string,
    options?: {
      className?: string;
    }
  ) => {
    const isSuper = isSuperAdmin();
    const currentValue = customLabels[labelKey] || defaultVal;
    const isEditing = activeInlineEditor?.type === 'label' && activeInlineEditor.targetId === labelKey;

    if (isSuper && isEditing) {
      return (
        <input
          autoFocus
          className={`border border-purple-500 rounded px-2 py-1 text-xs bg-white dark:bg-[#1A1730] dark:text-white font-bold inline-block text-black ${options?.className || ''}`}
          value={activeInlineEditor.value}
          onChange={e => setActiveInlineEditor({ ...activeInlineEditor, value: e.target.value })}
          onBlur={() => handleSaveLabel(labelKey, activeInlineEditor.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') handleSaveLabel(labelKey, activeInlineEditor.value);
            if (e.key === 'Escape') setActiveInlineEditor(null);
          }}
          onClick={e => e.stopPropagation()}
        />
      );
    }

    return (
      <span
        onDoubleClick={e => {
          if (!isSuper) return;
          e.stopPropagation();
          handleLabelDoubleClick(labelKey, currentValue);
        }}
        className={`${isSuper ? 'cursor-pointer hover:underline' : ''} ${options?.className || ''}`}
        title={isSuper ? 'Duplo clique para editar' : undefined}
      >
        {currentValue}
      </span>
    );
  };

  const handleSave = () => {
    updateConfig({
      appName: appName.trim(),
      siteTagline: siteTagline.trim(),
      footerText: footerText.trim(),
      contactEmail: contactEmail.trim(),
      contactPhone: contactPhone.trim(),
      customFields
    });
    localStorage.setItem('legis_bi_tb_apoio', JSON.stringify(biApoio));
    localStorage.setItem('legis_bi_tb_dados_base', JSON.stringify(biDadosBase));
    localStorage.setItem('legis_bi_clientes', JSON.stringify(biClientes));
    localStorage.setItem('legis_bi_produtos', JSON.stringify(biProdutos));
    localStorage.setItem('legis_bi_fornecedores', JSON.stringify(biFornecedores));
    localStorage.setItem('legis_bi_vendas', JSON.stringify(biVendas));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleHeaderLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFromFile(file, 'headerLogoUrl');
    }
  };

  const handleFooterLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFromFile(file, 'footerLogoUrl');
    }
  };

  const deleteLogo = (target: 'headerLogoUrl' | 'footerLogoUrl') => {
    updateConfig({ [target]: null });
  };

  const handleAddCustomField = () => {
    if (!newKey.trim() || !newValue.trim()) return;
    const newField = {
      id: `field-${Date.now()}`,
      key: newKey.trim(),
      value: newValue.trim()
    };
    setCustomFields(prev => [...prev, newField]);
    setNewKey('');
    setNewValue('');
  };

  const handleDeleteCustomField = (id: string) => {
    setCustomFields(prev => prev.filter(f => f.id !== id));
  };

  const handleEditCustomField = (id: string, key: string, value: string) => {
    setCustomFields(prev => prev.map(f => f.id === id ? { ...f, key, value } : f));
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-gray-800">Configurações Gerais</h3>
        <span className="text-xs text-gray-400">Última atualização: {config.updatedAt ? new Date(config.updatedAt).toLocaleString('pt-BR') : 'Sem dados'}</span>
      </div>
      
      {/* App details */}
      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-xs font-semibold text-gray-600 uppercase">Nome do Aplicativo</label>
            <div className="flex gap-2">
              <button type="button" onClick={() => setAppName('')} className="text-[10px] font-bold text-red-600 hover:underline">Limpar</button>
              <button type="button" onClick={() => setAppName('Legis Connect')} className="text-[10px] font-bold text-primary hover:underline">Restaurar Padrão</button>
            </div>
          </div>
          <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 p-2 border bg-white text-gray-900 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500" value={appName} onChange={e => setAppName(e.target.value)} placeholder="Ex: Legis Connect" />
        </div>
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-xs font-semibold text-gray-600 uppercase">Slogan Principal</label>
            <button type="button" onClick={() => setSiteTagline('')} className="text-[10px] font-bold text-red-600 hover:underline">Excluir Slogan</button>
          </div>
          <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 p-2 border bg-white text-gray-900 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500" value={siteTagline} onChange={e => setSiteTagline(e.target.value)} placeholder="Slogan do aplicativo" />
        </div>
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-xs font-semibold text-gray-600 uppercase">Texto do Rodapé</label>
            <button type="button" onClick={() => setFooterText('')} className="text-[10px] font-bold text-red-600 hover:underline">Excluir Copyright</button>
          </div>
          <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 p-2 border bg-white text-gray-900 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500" value={footerText} onChange={e => setFooterText(e.target.value)} placeholder="Ex: © 2026 Legis Connect. Todos os direitos reservados." />
        </div>
      </div>

      {/* Contact information details */}
      <div className="pt-4 border-t space-y-4">
        <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Informações de Contato</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-medium text-gray-600">E-mail de Contato</label>
              {contactEmail && <button type="button" onClick={() => setContactEmail('')} className="text-[10px] font-bold text-red-600 hover:underline">Excluir</button>}
            </div>
            <input type="email" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 p-2 border bg-white text-gray-900 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500" value={contactEmail} onChange={e => setContactEmail(e.target.value)} placeholder="contato@empresa.com" />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-medium text-gray-600">Telefone de Contato</label>
              {contactPhone && <button type="button" onClick={() => setContactPhone('')} className="text-[10px] font-bold text-red-600 hover:underline">Excluir</button>}
            </div>
            <input type="tel" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 p-2 border bg-white text-gray-900 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500" value={contactPhone} onChange={e => setContactPhone(e.target.value)} placeholder="+55 11 99999-9999" />
          </div>
        </div>
      </div>

      {/* Dynamic custom fields section */}
      <div className="pt-4 border-t space-y-4">
        <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Outras Informações Customizadas (Incluir/Excluir)</h4>
        <p className="text-xs text-gray-500">Adicione qualquer campo adicional para exibição nas informações da plataforma.</p>
        
        {customFields.length > 0 && (
          <div className="space-y-3">
            {customFields.map(field => (
              <div key={field.id} className="flex gap-3 items-center bg-gray-50 p-3 rounded-lg border border-gray-200 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
                <input
                  type="text"
                  value={field.key}
                  onChange={e => handleEditCustomField(field.id, e.target.value, field.value)}
                  className="w-1/3 border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none bg-white p-1 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500"
                  placeholder="Nome do Campo"
                />
                <input
                  type="text"
                  value={field.value}
                  onChange={e => handleEditCustomField(field.id, field.key, e.target.value)}
                  className="flex-grow border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none bg-white p-1 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500"
                  placeholder="Valor"
                />
                <button
                  type="button"
                  onClick={() => handleDeleteCustomField(field.id)}
                  className="px-2 py-1 bg-red-50 text-red-600 hover:bg-red-100 text-xs font-bold rounded"
                >
                  Excluir
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add custom field form */}
        <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1 w-full text-left">
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Novo Campo</label>
            <input
              type="text"
              value={newKey}
              onChange={e => setNewKey(e.target.value)}
              className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none bg-white p-1 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500"
              placeholder="Ex: Endereço Comercial"
            />
          </div>
          <div className="flex-1 w-full text-left">
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Valor</label>
            <input
              type="text"
              value={newValue}
              onChange={e => setNewValue(e.target.value)}
              className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none bg-white p-1 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500"
              placeholder="Ex: Av. Paulista, 1000 - SP"
            />
          </div>
          <button
            type="button"
            onClick={handleAddCustomField}
            className="w-full sm:w-auto px-4 py-1.5 bg-primary text-white font-semibold text-xs rounded hover:bg-primary-dark shadow-sm shrink-0"
          >
            + Incluir Informação
          </button>
        </div>
      </div>

      {/* Header and Footer Logos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
        {/* Header Logo */}
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-gray-700 uppercase">Logo do Cabeçalho</label>
          <div className="flex items-center gap-4">
            {config.headerLogoUrl ? (
              <div className="relative group">
                <img src={config.headerLogoUrl} className="h-16 w-auto object-contain border rounded p-1 max-w-[200px]" alt="Header Logo" />
                <button
                  onClick={() => deleteLogo('headerLogoUrl')}
                  className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow hover:scale-110 transition-all w-6 h-6 flex items-center justify-center font-bold text-xs"
                  title="Excluir Logo"
                >
                  &times;
                </button>
              </div>
            ) : (
              <div className="h-16 w-40 border border-dashed rounded flex items-center justify-center text-xs text-gray-400 bg-gray-50">
                Sem logotipo
              </div>
            )}
            <div>
              <label className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:border-primary/50 cursor-pointer transition-colors dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
                <IconUpload /> Enviar/Editar Logo
                <input type="file" accept="image/*" className="hidden" onChange={handleHeaderLogoUpload} />
              </label>
              {config.headerLogoUrl && (
                <button
                  onClick={() => deleteLogo('headerLogoUrl')}
                  className="mt-2 text-xs text-red-600 hover:underline flex items-center gap-1 text-left"
                >
                  Excluir Logo
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer Logo */}
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-gray-700 uppercase">Logo do Rodapé</label>
          <div className="flex items-center gap-4">
            {config.footerLogoUrl ? (
              <div className="relative group">
                <img src={config.footerLogoUrl} className="h-16 w-auto object-contain border rounded p-1 max-w-[200px]" alt="Footer Logo" />
                <button
                  onClick={() => deleteLogo('footerLogoUrl')}
                  className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow hover:scale-110 transition-all w-6 h-6 flex items-center justify-center font-bold text-xs"
                  title="Excluir Logo"
                >
                  &times;
                </button>
              </div>
            ) : (
              <div className="h-16 w-40 border border-dashed rounded flex items-center justify-center text-xs text-gray-400 bg-gray-50">
                Sem logotipo
              </div>
            )}
            <div>
              <label className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:border-primary/50 cursor-pointer transition-colors dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
                <IconUpload /> Enviar/Editar Logo
                <input type="file" accept="image/*" className="hidden" onChange={handleFooterLogoUpload} />
              </label>
              {config.footerLogoUrl && (
                <button
                  onClick={() => deleteLogo('footerLogoUrl')}
                  className="mt-2 text-xs text-red-600 hover:underline flex items-center gap-1 text-left"
                >
                  Excluir Logo
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Seção BI / Modelagem Financeira */}
      <div className="pt-6 border-t space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-purple-700 uppercase tracking-wider flex items-center gap-2">
              <span><Icon name="📊" className="w-4 h-4 inline-block mr-1 align-text-bottom" /></span> Modelagem de Dados Financeiros & BI
            </h4>
            <p className="text-xs text-gray-500 mt-1">
              Gerencie os modelos de dados e premissas financeiras que alimentam os Dashboards de Analytics da plataforma.
            </p>
          </div>

          <div className="flex bg-gray-100 dark:bg-[#201C3D] p-1 rounded-xl border border-gray-200 dark:border-[#2A2545] shadow-sm shrink-0">
            <button
              type="button"
              onClick={() => { setBiSubTab('excel_ums'); setDocTab('DAX (Power BI)'); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 ${biSubTab === 'excel_ums' ? 'bg-primary text-white shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-primary'}`}
            >
              📊 {renderEditableLabel('tab_excel_ums', 'Geral (Excel UMS)')}
            </button>
            <button
              type="button"
              onClick={() => { setBiSubTab('servicos_aluguel'); setDocTab('SQL (Criação de Tabelas)'); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 ${biSubTab === 'servicos_aluguel' ? 'bg-primary text-white shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-primary'}`}
            >
              ⚙️ {renderEditableLabel('tab_servicos_aluguel', 'Aluguer de Equipamentos')}
            </button>
          </div>
        </div>

        {biSubTab === 'excel_ums' ? (
          <>
            {/* Tabela A: Premissas (tb_apoio) */}
            <div className="bg-purple-50/50 dark:bg-[#1A1730]/40 border border-purple-200 dark:border-[#2A2545] rounded-xl p-4 space-y-4 text-left animate-fade-in">
              <h5 className="text-xs font-bold text-purple-800 dark:text-purple-300 uppercase">Tabela A: Premissas (tb_apoio)</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 uppercase mb-1">Teto de Execução Anual (UMS) *</label>
                  <input
                    type="number"
                    className="w-full border border-gray-300 dark:border-[#2A2545] rounded-lg px-3 py-1.5 text-xs focus:outline-none bg-white dark:bg-[#1A1730] dark:text-white p-1"
                    value={biApoio.teto_execucao_anual_ums}
                    onChange={e => setBiApoio(prev => ({ ...prev, teto_execucao_anual_ums: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 uppercase mb-1">Meta de Razão de Eficiência Final *</label>
                  <input
                    type="number"
                    step="0.0000001"
                    className="w-full border border-gray-300 dark:border-[#2A2545] rounded-lg px-3 py-1.5 text-xs focus:outline-none bg-white dark:bg-[#1A1730] dark:text-white p-1"
                    value={biApoio.meta_razao_final}
                    onChange={e => setBiApoio(prev => ({ ...prev, meta_razao_final: Number(e.target.value) }))}
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Ex: 0.4399678 (equivale a ~44%)</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 uppercase">Metas de Faturamento por Período / Semestre</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {biApoio.periodos.map((periodo, idx) => (
                    <div key={periodo} className="bg-white dark:bg-[#1A1730] p-2.5 rounded-lg border border-purple-100 dark:border-[#2A2545]">
                      <span className="block text-[10px] font-bold text-gray-500 uppercase">{periodo}</span>
                      <input
                        type="number"
                        step="0.001"
                        className="w-full border border-gray-300 dark:border-[#2A2545] rounded mt-1 px-2 py-1 text-xs focus:outline-none bg-white dark:bg-[#1A1730] dark:text-white"
                        value={biApoio.meta_faturamento_percentual[idx]}
                        onChange={e => {
                          const nextMetas = [...biApoio.meta_faturamento_percentual];
                          nextMetas[idx] = Number(e.target.value);
                          setBiApoio(prev => ({ ...prev, meta_faturamento_percentual: nextMetas }));
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Tabela Dados Transacionais */}
            <div className="bg-blue-50/50 dark:bg-[#1A1730]/40 border border-blue-200 dark:border-[#2A2545] rounded-xl p-4 space-y-4 text-left animate-fade-in">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <h5 className="text-xs font-bold text-blue-800 dark:text-blue-300 uppercase">Tabela Dados Transacionais</h5>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('Deseja redefinir a tabela transacional para os dados de teste originais?')) {
                        setBiDadosBase(mockBiDadosBase);
                        localStorage.setItem('legis_bi_tb_dados_base', JSON.stringify(mockBiDadosBase));
                      }
                    }}
                    className="text-[10px] font-bold text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 px-2.5 py-1 rounded hover:bg-red-100 dark:hover:bg-red-900/40"
                  >
                    Redefinir Padrão
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingTxId(null);
                      setTxForm({
                        id_tab: 0,
                        semestre: '1º sem',
                        valor_ums: 5.5,
                        mes_ano: new Date().toISOString().split('T')[0],
                        executado_ums: 10000,
                        receita_fat: 50000,
                        transferencia_recebida: 5000,
                        despesa_total: 25000,
                        custo: 10000,
                        imposto: 5000,
                        juros: 1000,
                        salarios_ordenados: 6000,
                        glosa: 1000,
                        emissao_nf: new Date().toISOString().split('T')[0],
                        recebimento_nf: new Date().toISOString().split('T')[0],
                      });
                      setShowTxForm(!showTxForm);
                    }}
                    className="text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/30 px-2.5 py-1 rounded hover:bg-blue-100 dark:hover:bg-blue-900/40"
                  >
                    {showTxForm && !editingTxId ? '✕ Fechar Form' : '+ Novo Lançamento'}
                  </button>
                </div>
              </div>

              {/* Tx Form */}
              {showTxForm && (
                <div className="bg-white dark:bg-[#1A1730] border border-blue-200 dark:border-[#2A2545] p-4 rounded-lg space-y-4">
                  <p className="text-xs font-bold text-blue-900 dark:text-blue-300">{editingTxId ? `<Icon name="📝" className="w-3.5 h-3.5 inline-block mr-0.5 align-text-bottom" /> Editar Registro #${editingTxId}` : '<Icon name="➕" className="w-3.5 h-3.5 inline-block mr-0.5 align-text-bottom" /> Novo Registro Transacional'}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase">Semestre *</label>
                      <select
                        className="w-full border border-gray-300 dark:border-[#2A2545] rounded px-2 py-1 text-xs focus:outline-none bg-white dark:bg-[#1A1730] dark:text-white mt-1"
                        value={txForm.semestre}
                        onChange={e => setTxForm(p => ({ ...p, semestre: e.target.value }))}
                      >
                        {biApoio.periodos.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase">Mês / Ano *</label>
                      <input
                        type="date"
                        className="w-full border border-gray-300 dark:border-[#2A2545] rounded px-2 py-1 text-xs focus:outline-none bg-white dark:bg-[#1A1730] dark:text-white mt-1"
                        value={txForm.mes_ano}
                        onChange={e => setTxForm(p => ({ ...p, mes_ano: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase">Valor UMS (R$) *</label>
                      <input
                        type="number"
                        step="0.01"
                        className="w-full border border-gray-300 dark:border-[#2A2545] rounded px-2 py-1 text-xs focus:outline-none bg-white dark:bg-[#1A1730] dark:text-white mt-1"
                        value={txForm.valor_ums}
                        onChange={e => setTxForm(p => ({ ...p, valor_ums: Number(e.target.value) }))}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase">Executado UMS *</label>
                      <input
                        type="number"
                        className="w-full border border-gray-300 dark:border-[#2A2545] rounded px-2 py-1 text-xs focus:outline-none bg-white dark:bg-[#1A1730] dark:text-white mt-1"
                        value={txForm.executado_ums}
                        onChange={e => setTxForm(p => ({ ...p, executado_ums: Number(e.target.value) }))}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase">Receita Faturamento *</label>
                      <input
                        type="number"
                        className="w-full border border-gray-300 dark:border-[#2A2545] rounded px-2 py-1 text-xs focus:outline-none bg-white dark:bg-[#1A1730] dark:text-white mt-1"
                        value={txForm.receita_fat}
                        onChange={e => setTxForm(p => ({ ...p, receita_fat: Number(e.target.value) }))}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase">Transf. Recebida *</label>
                      <input
                        type="number"
                        className="w-full border border-gray-300 dark:border-[#2A2545] rounded px-2 py-1 text-xs focus:outline-none bg-white dark:bg-[#1A1730] dark:text-white mt-1"
                        value={txForm.transferencia_recebida}
                        onChange={e => setTxForm(p => ({ ...p, transferencia_recebida: Number(e.target.value) }))}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase">Despesa Total *</label>
                      <input
                        type="number"
                        className="w-full border border-gray-300 dark:border-[#2A2545] rounded px-2 py-1 text-xs focus:outline-none bg-white dark:bg-[#1A1730] dark:text-white mt-1"
                        value={txForm.despesa_total}
                        onChange={e => setTxForm(p => ({ ...p, despesa_total: Number(e.target.value) }))}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase">Custo Operacional *</label>
                      <input
                        type="number"
                        className="w-full border border-gray-300 dark:border-[#2A2545] rounded px-2 py-1 text-xs focus:outline-none bg-white dark:bg-[#1A1730] dark:text-white mt-1"
                        value={txForm.custo}
                        onChange={e => setTxForm(p => ({ ...p, custo: Number(e.target.value) }))}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase">Impostos *</label>
                      <input
                        type="number"
                        className="w-full border border-gray-300 dark:border-[#2A2545] rounded px-2 py-1 text-xs focus:outline-none bg-white dark:bg-[#1A1730] dark:text-white mt-1"
                        value={txForm.imposto}
                        onChange={e => setTxForm(p => ({ ...p, imposto: Number(e.target.value) }))}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase">Juros *</label>
                      <input
                        type="number"
                        className="w-full border border-gray-300 dark:border-[#2A2545] rounded px-2 py-1 text-xs focus:outline-none bg-white dark:bg-[#1A1730] dark:text-white mt-1"
                        value={txForm.juros}
                        onChange={e => setTxForm(p => ({ ...p, juros: Number(e.target.value) }))}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase">Salários/Ordenados *</label>
                      <input
                        type="number"
                        className="w-full border border-gray-300 dark:border-[#2A2545] rounded px-2 py-1 text-xs focus:outline-none bg-white dark:bg-[#1A1730] dark:text-white mt-1"
                        value={txForm.salarios_ordenados}
                        onChange={e => setTxForm(p => ({ ...p, salarios_ordenados: Number(e.target.value) }))}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase">Glosas *</label>
                      <input
                        type="number"
                        className="w-full border border-gray-300 dark:border-[#2A2545] rounded px-2 py-1 text-xs focus:outline-none bg-white dark:bg-[#1A1730] dark:text-white mt-1"
                        value={txForm.glosa}
                        onChange={e => setTxForm(p => ({ ...p, glosa: Number(e.target.value) }))}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase">Emissão NF *</label>
                      <input
                        type="date"
                        className="w-full border border-gray-300 dark:border-[#2A2545] rounded px-2 py-1 text-xs focus:outline-none bg-white dark:bg-[#1A1730] dark:text-white mt-1"
                        value={txForm.emissao_nf}
                        onChange={e => setTxForm(p => ({ ...p, emissao_nf: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase">Recebimento NF *</label>
                      <input
                        type="date"
                        className="w-full border border-gray-300 dark:border-[#2A2545] rounded px-2 py-1 text-xs focus:outline-none bg-white dark:bg-[#1A1730] dark:text-white mt-1"
                        value={txForm.recebimento_nf}
                        onChange={e => setTxForm(p => ({ ...p, recebimento_nf: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        let nextBase;
                        if (editingTxId) {
                          nextBase = biDadosBase.map(t => t.id_tab === editingTxId ? { ...txForm, id_tab: editingTxId } : t);
                        } else {
                          nextBase = [...biDadosBase, { ...txForm, id_tab: Date.now() }];
                        }
                        setBiDadosBase(nextBase);
                        localStorage.setItem('legis_bi_tb_dados_base', JSON.stringify(nextBase));
                        setShowTxForm(false);
                        setEditingTxId(null);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded text-xs font-bold hover:bg-blue-700"
                    >
                      {editingTxId ? 'Salvar Alterações' : 'Adicionar Lançamento'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowTxForm(false);
                        setEditingTxId(null);
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded text-xs font-semibold hover:bg-gray-300"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {/* Tx List Table */}
              <div className="overflow-x-auto border border-gray-200 dark:border-[#2A2545] rounded-lg">
                <table className="w-full text-xs text-left bg-white dark:bg-[#1A1730]">
                  <thead className="bg-gray-100 dark:bg-[#201C3D] uppercase font-bold text-gray-700 dark:text-gray-300 border-b dark:border-[#2A2545]">
                    <tr>
                      <th className="px-3 py-2">Mês/Ano</th>
                      <th className="px-3 py-2">Semestre</th>
                      <th className="px-3 py-2 text-right">Faturamento</th>
                      <th className="px-3 py-2 text-right">Despesa Total</th>
                      <th className="px-3 py-2 text-right">Custo</th>
                      <th className="px-3 py-2 text-right">Imposto</th>
                      <th className="px-3 py-2 text-right">Exec UMS</th>
                      <th className="px-3 py-2 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {biDadosBase.map((tx, idx) => (
                      <tr key={tx.id_tab} className="border-b dark:border-[#2A2545] hover:bg-gray-50 dark:hover:bg-[#221d3f]">
                        <td className="px-3 py-2 font-medium">
                          {renderEditableCell(tx.mes_ano, val => handleSaveTxCell(idx, 'mes_ano', val), {
                            type: 'date',
                            displayValue: tx.mes_ano ? new Date(tx.mes_ano + 'T12:00:00').toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }) : '—',
                            onDoubleClickKey: `tx-${idx}-mes_ano`
                          })}
                        </td>
                        <td className="px-3 py-2">
                          {renderEditableCell(tx.semestre, val => handleSaveTxCell(idx, 'semestre', val), {
                            type: 'select',
                            selectOptions: biApoio.periodos,
                            onDoubleClickKey: `tx-${idx}-semestre`
                          })}
                        </td>
                        <td className="px-3 py-2 text-right font-semibold text-emerald-700 dark:text-emerald-400">
                          {renderEditableCell(tx.receita_fat, val => handleSaveTxCell(idx, 'receita_fat', val), {
                            type: 'number',
                            displayValue: `R$ ${tx.receita_fat.toLocaleString('pt-BR')}`,
                            onDoubleClickKey: `tx-${idx}-receita_fat`
                          })}
                        </td>
                        <td className="px-3 py-2 text-right text-red-600 dark:text-red-400">
                          {renderEditableCell(tx.despesa_total, val => handleSaveTxCell(idx, 'despesa_total', val), {
                            type: 'number',
                            displayValue: `R$ ${tx.despesa_total.toLocaleString('pt-BR')}`,
                            onDoubleClickKey: `tx-${idx}-despesa_total`
                          })}
                        </td>
                        <td className="px-3 py-2 text-right">
                          {renderEditableCell(tx.custo, val => handleSaveTxCell(idx, 'custo', val), {
                            type: 'number',
                            displayValue: `R$ ${tx.custo.toLocaleString('pt-BR')}`,
                            onDoubleClickKey: `tx-${idx}-custo`
                          })}
                        </td>
                        <td className="px-3 py-2 text-right">
                          {renderEditableCell(tx.imposto, val => handleSaveTxCell(idx, 'imposto', val), {
                            type: 'number',
                            displayValue: `R$ ${tx.imposto.toLocaleString('pt-BR')}`,
                            onDoubleClickKey: `tx-${idx}-imposto`
                          })}
                        </td>
                        <td className="px-3 py-2 text-right">
                          {renderEditableCell(tx.executado_ums, val => handleSaveTxCell(idx, 'executado_ums', val), {
                            type: 'number',
                            onDoubleClickKey: `tx-${idx}-executado_ums`
                          })}</td>
                        <td className="px-3 py-2 text-center space-x-2 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingTxId(tx.id_tab);
                              setTxForm({ ...tx });
                              setShowTxForm(true);
                            }}
                            className="text-blue-600 dark:text-blue-400 hover:underline font-bold"
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm('Deseja excluir este registro transacional?')) {
                                const next = biDadosBase.filter(t => t.id_tab !== tx.id_tab);
                                setBiDadosBase(next);
                                localStorage.setItem('legis_bi_tb_dados_base', JSON.stringify(next));
                              }
                            }}
                            className="text-red-600 dark:text-red-400 hover:underline font-bold"
                          >
                            Excluir
                          </button>
                        </td>
                      </tr>
                    ))}
                    {biDadosBase.length === 0 && (
                      <tr>
                        <td colSpan={8} className="px-3 py-6 text-center text-gray-400">Nenhum lançamento cadastrado.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-4 animate-fade-in">
            <div className="flex gap-2 flex-wrap mb-2 border-b pb-2">
              {[
                { id: 'vendas' as const, key: 'sub_vendas', default: 'fato_vendas (Alugueres)' },
                { id: 'clientes' as const, key: 'sub_clientes', default: 'dim_clientes (Clientes)' },
                { id: 'produtos' as const, key: 'sub_produtos', default: 'dim_produtos (Produtos)' },
                { id: 'fornecedores' as const, key: 'sub_fornecedores', default: 'dim_fornecedores (Fornecedores)' }
              ].map(sub => (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => {
                    setBiAluguelTab(sub.id);
                    setShowAluguelForm(false);
                    setEditingAluguelId(null);
                  }}
                  className={`pb-2 text-xs font-bold transition-all ${
                    biAluguelTab === sub.id
                      ? 'border-b-2 border-purple-600 text-purple-700'
                      : 'text-gray-500 hover:text-purple-600'
                  }`}
                >
                  {renderEditableLabel(sub.key, sub.default)}
                </button>
              ))}
            </div>

            {/* Actions header */}
            <div className="flex justify-between items-center flex-wrap gap-2">
              <h5 className="text-xs font-bold text-purple-800 dark:text-purple-300 uppercase">
                {biAluguelTab === 'vendas' ? 'Tabela Fato Serviços' : 
                 biAluguelTab === 'clientes' ? 'Tabela Dimensão: Clientes' :
                 biAluguelTab === 'produtos' ? 'Tabela Dimensão Produtos' :
                 'Tabela Dimensão Fornecedores'}
              </h5>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Deseja redefinir esta tabela para os dados de teste originais?')) {
                      if (biAluguelTab === 'vendas') { setBiVendas(mockBiVendas); localStorage.setItem('legis_bi_vendas', JSON.stringify(mockBiVendas)); }
                      else if (biAluguelTab === 'clientes') { setBiClientes(mockBiClientes); localStorage.setItem('legis_bi_clientes', JSON.stringify(mockBiClientes)); }
                      else if (biAluguelTab === 'produtos') { setBiProdutos(mockBiProdutos); localStorage.setItem('legis_bi_produtos', JSON.stringify(mockBiProdutos)); }
                      else if (biAluguelTab === 'fornecedores') { setBiFornecedores(mockBiFornecedores); localStorage.setItem('legis_bi_fornecedores', JSON.stringify(mockBiFornecedores)); }
                    }
                  }}
                  className="text-[10px] font-bold text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 px-2.5 py-1 rounded hover:bg-red-100 dark:hover:bg-red-900/40"
                >
                  Redefinir Padrão
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingAluguelId(null);
                    setShowAluguelForm(!showAluguelForm);
                    // Reset forms
                    if (biAluguelTab === 'clientes') setClientForm({ codigo: 'C' + String(biClientes.length + 1).padStart(2, '0'), nome: '', cpf_cnpj: '', cidade: '', estado: '', lista_concatenada: '' });
                    else if (biAluguelTab === 'produtos') setProductForm({ codigo: 'P' + String(biProdutos.length + 1).padStart(2, '0'), nome: '', descricao: '', custo: 0, preco_tabela: 0, lista_concatenada: '' });
                    else if (biAluguelTab === 'fornecedores') setSupplierForm({ codigo: 'F' + String(biFornecedores.length + 1).padStart(2, '0'), nome: '', cpf_cnpj: '', estado: '', lista_concatenada: '' });
                    else if (biAluguelTab === 'vendas') setSaleForm({
                      id_tab: 'v' + String(biVendas.length + 1).padStart(2, '0'),
                      fornecedor: biFornecedores[0]?.lista_concatenada || '',
                      cliente: biClientes[0]?.lista_concatenada || '',
                      produto: biProdutos[0]?.lista_concatenada || '',
                      qtd: 1,
                      vlr_unit: biProdutos[0]?.preco_tabela || 0,
                      valor_total: biProdutos[0]?.preco_tabela || 0,
                      custo_prod: biProdutos[0]?.custo || 0,
                      lucro: (biProdutos[0]?.preco_tabela || 0) - (biProdutos[0]?.custo || 0),
                      data: new Date().toISOString().split('T')[0],
                      data_referencia: new Date().toISOString().split('T')[0].substring(0, 8) + '01',
                      data_retirada: new Date().toISOString().split('T')[0],
                      data_devolucao: '',
                      status_pagamento: 'Pago',
                      status_aluguel: 'Entregue',
                    });
                  }}
                  className="text-[10px] font-bold text-purple-600 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-900/30 px-2.5 py-1 rounded hover:bg-purple-100 dark:hover:bg-purple-900/40"
                >
                  {showAluguelForm && !editingAluguelId ? '✕ Fechar Form' : '+ Novo Registro'}
                </button>
              </div>
            </div>

            {/* Form for dim_clientes */}
            {showAluguelForm && biAluguelTab === 'clientes' && (
              <div className="bg-white dark:bg-[#1A1730] border border-purple-200 dark:border-[#2A2545] p-4 rounded-lg space-y-4">
                <p className="text-xs font-bold text-purple-900 dark:text-purple-300">{editingAluguelId ? '<Icon name="📝" className="w-3.5 h-3.5 inline-block mr-0.5 align-text-bottom" /> Editar Cliente' : '<Icon name="➕" className="w-3.5 h-3.5 inline-block mr-0.5 align-text-bottom" /> Novo Cliente'}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Código *</label>
                    <input className="w-full border border-gray-300 dark:border-[#2A2545] rounded px-2 py-1 text-xs focus:outline-none bg-white dark:bg-[#1A1730] text-gray-900 dark:text-white mt-1" value={clientForm.codigo} onChange={e => setClientForm(p => ({ ...p, codigo: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Nome *</label>
                    <input className="w-full border border-gray-300 dark:border-[#2A2545] rounded px-2 py-1 text-xs focus:outline-none bg-white dark:bg-[#1A1730] text-gray-900 dark:text-white mt-1" value={clientForm.nome} onChange={e => setClientForm(p => ({ ...p, nome: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">CPF/CNPJ *</label>
                    <input className="w-full border border-gray-300 dark:border-[#2A2545] rounded px-2 py-1 text-xs focus:outline-none bg-white dark:bg-[#1A1730] text-gray-900 dark:text-white mt-1" value={clientForm.cpf_cnpj} onChange={e => setClientForm(p => ({ ...p, cpf_cnpj: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Cidade *</label>
                    <input className="w-full border border-gray-300 dark:border-[#2A2545] rounded px-2 py-1 text-xs focus:outline-none bg-white dark:bg-[#1A1730] text-gray-900 dark:text-white mt-1" value={clientForm.cidade} onChange={e => setClientForm(p => ({ ...p, cidade: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Estado (UF) *</label>
                    <input className="w-full border border-gray-300 dark:border-[#2A2545] rounded px-2 py-1 text-xs focus:outline-none bg-white dark:bg-[#1A1730] text-gray-900 dark:text-white mt-1" value={clientForm.estado} onChange={e => setClientForm(p => ({ ...p, estado: e.target.value }))} />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const computed = `${clientForm.codigo} - ${clientForm.nome}`;
                      const payload = { ...clientForm, lista_concatenada: computed };
                      let next;
                      if (editingAluguelId) {
                        next = biClientes.map(c => c.lista_concatenada === editingAluguelId ? payload : c);
                      } else {
                        next = [...biClientes, payload];
                      }
                      setBiClientes(next);
                      localStorage.setItem('legis_bi_clientes', JSON.stringify(next));
                      setShowAluguelForm(false);
                      setEditingAluguelId(null);
                    }}
                    className="px-4 py-2 bg-purple-600 text-white rounded text-xs font-bold hover:bg-purple-700"
                  >
                    Salvar
                  </button>
                  <button type="button" onClick={() => { setShowAluguelForm(false); setEditingAluguelId(null); }} className="px-4 py-2 bg-gray-200 text-gray-700 rounded text-xs font-semibold hover:bg-gray-300">
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            {/* Form for dim_produtos */}
            {showAluguelForm && biAluguelTab === 'produtos' && (
              <div className="bg-white dark:bg-[#1A1730] border border-purple-200 dark:border-[#2A2545] p-4 rounded-lg space-y-4">
                <p className="text-xs font-bold text-purple-900 dark:text-purple-300">{editingAluguelId ? '<Icon name="📝" className="w-3.5 h-3.5 inline-block mr-0.5 align-text-bottom" /> Editar Produto' : '<Icon name="➕" className="w-3.5 h-3.5 inline-block mr-0.5 align-text-bottom" /> Novo Produto'}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Código *</label>
                    <input className="w-full border border-gray-300 dark:border-[#2A2545] rounded px-2 py-1 text-xs focus:outline-none bg-white dark:bg-[#1A1730] text-gray-900 dark:text-white mt-1" value={productForm.codigo} onChange={e => setProductForm(p => ({ ...p, codigo: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Nome *</label>
                    <input className="w-full border border-gray-300 dark:border-[#2A2545] rounded px-2 py-1 text-xs focus:outline-none bg-white dark:bg-[#1A1730] text-gray-900 dark:text-white mt-1" value={productForm.nome} onChange={e => setProductForm(p => ({ ...p, nome: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Descrição *</label>
                    <input className="w-full border border-gray-300 dark:border-[#2A2545] rounded px-2 py-1 text-xs focus:outline-none bg-white dark:bg-[#1A1730] text-gray-900 dark:text-white mt-1" value={productForm.descricao} onChange={e => setProductForm(p => ({ ...p, descricao: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">com Desc. *</label>
                    <input type="number" className="w-full border border-gray-300 dark:border-[#2A2545] rounded px-2 py-1 text-xs focus:outline-none bg-white dark:bg-[#1A1730] text-gray-900 dark:text-white mt-1" value={productForm.custo} onChange={e => setProductForm(p => ({ ...p, custo: Number(e.target.value) }))} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Preço Tabela *</label>
                    <input type="number" className="w-full border border-gray-300 dark:border-[#2A2545] rounded px-2 py-1 text-xs focus:outline-none bg-white dark:bg-[#1A1730] text-gray-900 dark:text-white mt-1" value={productForm.preco_tabela} onChange={e => setProductForm(p => ({ ...p, preco_tabela: Number(e.target.value) }))} />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const computed = `${productForm.codigo} - ${productForm.nome}`;
                      const payload = { ...productForm, lista_concatenada: computed };
                      let next;
                      if (editingAluguelId) {
                        next = biProdutos.map(p => p.lista_concatenada === editingAluguelId ? payload : p);
                      } else {
                        next = [...biProdutos, payload];
                      }
                      setBiProdutos(next);
                      localStorage.setItem('legis_bi_produtos', JSON.stringify(next));
                      setShowAluguelForm(false);
                      setEditingAluguelId(null);
                    }}
                    className="px-4 py-2 bg-purple-600 text-white rounded text-xs font-bold hover:bg-purple-700"
                  >
                    Salvar
                  </button>
                  <button type="button" onClick={() => { setShowAluguelForm(false); setEditingAluguelId(null); }} className="px-4 py-2 bg-gray-200 text-gray-700 rounded text-xs font-semibold hover:bg-gray-300">
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            {/* Form for dim_fornecedores */}
            {showAluguelForm && biAluguelTab === 'fornecedores' && (
              <div className="bg-white dark:bg-[#1A1730] border border-purple-200 dark:border-[#2A2545] p-4 rounded-lg space-y-4">
                <p className="text-xs font-bold text-purple-900 dark:text-purple-300">{editingAluguelId ? '<Icon name="📝" className="w-3.5 h-3.5 inline-block mr-0.5 align-text-bottom" /> Editar Fornecedor' : '<Icon name="➕" className="w-3.5 h-3.5 inline-block mr-0.5 align-text-bottom" /> Novo Fornecedor'}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Código *</label>
                    <input className="w-full border border-gray-300 dark:border-[#2A2545] rounded px-2 py-1 text-xs focus:outline-none bg-white dark:bg-[#1A1730] text-gray-900 dark:text-white mt-1" value={supplierForm.codigo} onChange={e => setSupplierForm(p => ({ ...p, codigo: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Nome *</label>
                    <input className="w-full border border-gray-300 dark:border-[#2A2545] rounded px-2 py-1 text-xs focus:outline-none bg-white dark:bg-[#1A1730] text-gray-900 dark:text-white mt-1" value={supplierForm.nome} onChange={e => setSupplierForm(p => ({ ...p, nome: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">CPF/CNPJ *</label>
                    <input className="w-full border border-gray-300 dark:border-[#2A2545] rounded px-2 py-1 text-xs focus:outline-none bg-white dark:bg-[#1A1730] text-gray-900 dark:text-white mt-1" value={supplierForm.cpf_cnpj} onChange={e => setSupplierForm(p => ({ ...p, cpf_cnpj: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Estado (UF) *</label>
                    <input className="w-full border border-gray-300 dark:border-[#2A2545] rounded px-2 py-1 text-xs focus:outline-none bg-white dark:bg-[#1A1730] text-gray-900 dark:text-white mt-1" value={supplierForm.estado} onChange={e => setSupplierForm(p => ({ ...p, estado: e.target.value }))} />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const computed = `${supplierForm.codigo} - ${supplierForm.nome}`;
                      const payload = { ...supplierForm, lista_concatenada: computed };
                      let next;
                      if (editingAluguelId) {
                        next = biFornecedores.map(f => f.lista_concatenada === editingAluguelId ? payload : f);
                      } else {
                        next = [...biFornecedores, payload];
                      }
                      setBiFornecedores(next);
                      localStorage.setItem('legis_bi_fornecedores', JSON.stringify(next));
                      setShowAluguelForm(false);
                      setEditingAluguelId(null);
                    }}
                    className="px-4 py-2 bg-purple-600 text-white rounded text-xs font-bold hover:bg-purple-700"
                  >
                    Salvar
                  </button>
                  <button type="button" onClick={() => { setShowAluguelForm(false); setEditingAluguelId(null); }} className="px-4 py-2 bg-gray-200 text-gray-700 rounded text-xs font-semibold hover:bg-gray-300">
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            {/* Form for fato_vendas */}
            {showAluguelForm && biAluguelTab === 'vendas' && (
              <div className="bg-white dark:bg-[#1A1730] border border-purple-200 dark:border-[#2A2545] p-4 rounded-lg space-y-4">
                <p className="text-xs font-bold text-purple-900 dark:text-purple-300">{editingAluguelId ? '<Icon name="📝" className="w-3.5 h-3.5 inline-block mr-0.5 align-text-bottom" /> Editar Registro de Venda' : '<Icon name="➕" className="w-3.5 h-3.5 inline-block mr-0.5 align-text-bottom" /> Novo Registro de Venda'}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">ID Lançamento *</label>
                    <input className="w-full border border-gray-300 dark:border-[#2A2545] rounded px-2 py-1 text-xs focus:outline-none bg-white dark:bg-[#1A1730] text-gray-900 dark:text-white mt-1" value={saleForm.id_tab} onChange={e => setSaleForm(p => ({ ...p, id_tab: e.target.value }))} disabled={!!editingAluguelId} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Fornecedor *</label>
                    <select
                      className="w-full border border-gray-300 dark:border-[#2A2545] rounded px-2 py-1 text-xs focus:outline-none bg-white dark:bg-[#1A1730] dark:text-white mt-1"
                      value={saleForm.fornecedor}
                      onChange={e => setSaleForm(p => ({ ...p, fornecedor: e.target.value }))}
                    >
                      {biFornecedores.map(f => <option key={f.lista_concatenada} value={f.lista_concatenada}>{f.lista_concatenada}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Cliente *</label>
                    <select
                      className="w-full border border-gray-300 dark:border-[#2A2545] rounded px-2 py-1 text-xs focus:outline-none bg-white dark:bg-[#1A1730] dark:text-white mt-1"
                      value={saleForm.cliente}
                      onChange={e => setSaleForm(p => ({ ...p, cliente: e.target.value }))}
                    >
                      {biClientes.map(c => <option key={c.lista_concatenada} value={c.lista_concatenada}>{c.lista_concatenada}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Produto *</label>
                    <select
                      className="w-full border border-gray-300 dark:border-[#2A2545] rounded px-2 py-1 text-xs focus:outline-none bg-white dark:bg-[#1A1730] dark:text-white mt-1"
                      value={saleForm.produto}
                      onChange={e => {
                        const prodVal = e.target.value;
                        const matched = biProdutos.find(p => p.lista_concatenada === prodVal);
                        setSaleForm(p => {
                          const nextQtd = p.qtd;
                          const nextVlr = matched ? matched.preco_tabela : p.vlr_unit;
                          const nextCusto = matched ? matched.custo : p.custo_prod;
                          const nextTotal = nextQtd * nextVlr;
                          const nextLucro = nextTotal - (nextQtd * nextCusto);
                          return {
                            ...p,
                            produto: prodVal,
                            vlr_unit: nextVlr,
                            custo_prod: nextCusto,
                            valor_total: nextTotal,
                            lucro: nextLucro
                          };
                        });
                      }}
                    >
                      {biProdutos.map(p => <option key={p.lista_concatenada} value={p.lista_concatenada}>{p.lista_concatenada}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Qtd *</label>
                    <input
                      type="number"
                      className="w-full border border-gray-300 dark:border-[#2A2545] rounded px-2 py-1 text-xs focus:outline-none bg-white dark:bg-[#1A1730] dark:text-white mt-1"
                      value={saleForm.qtd}
                      onChange={e => {
                        const nextQtd = Number(e.target.value);
                        setSaleForm(p => {
                          const nextTotal = nextQtd * p.vlr_unit;
                          const nextLucro = nextTotal - (nextQtd * p.custo_prod);
                          return { ...p, qtd: nextQtd, valor_total: nextTotal, lucro: nextLucro };
                        });
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Vlr Unit (R$) *</label>
                    <input
                      type="number"
                      className="w-full border border-gray-300 dark:border-[#2A2545] rounded px-2 py-1 text-xs focus:outline-none bg-white dark:bg-[#1A1730] dark:text-white mt-1"
                      value={saleForm.vlr_unit}
                      onChange={e => {
                        const nextVlr = Number(e.target.value);
                        setSaleForm(p => {
                          const nextTotal = p.qtd * nextVlr;
                          const nextLucro = nextTotal - (p.qtd * p.custo_prod);
                          return { ...p, vlr_unit: nextVlr, valor_total: nextTotal, lucro: nextLucro };
                        });
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Custo Prod (R$) *</label>
                    <input
                      type="number"
                      className="w-full border border-gray-300 dark:border-[#2A2545] rounded px-2 py-1 text-xs focus:outline-none bg-white dark:bg-[#1A1730] dark:text-white mt-1"
                      value={saleForm.custo_prod}
                      onChange={e => {
                        const nextCusto = Number(e.target.value);
                        setSaleForm(p => {
                          const nextLucro = p.valor_total - (p.qtd * nextCusto);
                          return { ...p, custo_prod: nextCusto, lucro: nextLucro };
                        });
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Valor Total (R$) *</label>
                    <input
                      type="number"
                      className="w-full border border-gray-300 dark:border-[#2A2545] rounded px-2 py-1 text-xs focus:outline-none bg-white dark:bg-[#1A1730] dark:text-white mt-1 bg-gray-50"
                      value={saleForm.valor_total}
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Lucro (R$) *</label>
                    <input
                      type="number"
                      className="w-full border border-gray-300 dark:border-[#2A2545] rounded px-2 py-1 text-xs focus:outline-none bg-white dark:bg-[#1A1730] dark:text-white mt-1 bg-gray-50"
                      value={saleForm.lucro}
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Data Pedido *</label>
                    <input type="date" className="w-full border border-gray-300 dark:border-[#2A2545] rounded px-2 py-1 text-xs focus:outline-none bg-white dark:bg-[#1A1730] text-gray-900 dark:text-white mt-1" value={saleForm.data} onChange={e => setSaleForm(p => ({ ...p, data: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Data Entrada *</label>
                    <input type="date" className="w-full border border-gray-300 dark:border-[#2A2545] rounded px-2 py-1 text-xs focus:outline-none bg-white dark:bg-[#1A1730] text-gray-900 dark:text-white mt-1" value={saleForm.data_referencia} onChange={e => setSaleForm(p => ({ ...p, data_referencia: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Data Entrega *</label>
                    <input type="date" className="w-full border border-gray-300 dark:border-[#2A2545] rounded px-2 py-1 text-xs focus:outline-none bg-white dark:bg-[#1A1730] text-gray-900 dark:text-white mt-1" value={saleForm.data_retirada} onChange={e => setSaleForm(p => ({ ...p, data_retirada: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Data Pagto</label>
                    <input type="date" className="w-full border border-gray-300 dark:border-[#2A2545] rounded px-2 py-1 text-xs focus:outline-none bg-white dark:bg-[#1A1730] text-gray-900 dark:text-white mt-1" value={saleForm.data_devolucao} onChange={e => setSaleForm(p => ({ ...p, data_devolucao: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Status Pagamento *</label>
                    <select
                      className="w-full border border-gray-300 dark:border-[#2A2545] rounded px-2 py-1 text-xs focus:outline-none bg-white dark:bg-[#1A1730] dark:text-white mt-1"
                      value={saleForm.status_pagamento}
                      onChange={e => setSaleForm(p => ({ ...p, status_pagamento: e.target.value }))}
                    >
                      <option value="Pago">Pago</option>
                      <option value="Pendente">Pendente</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">STATUS SERVIÇO *</label>
                    <select
                      className="w-full border border-gray-300 dark:border-[#2A2545] rounded px-2 py-1 text-xs focus:outline-none bg-white dark:bg-[#1A1730] dark:text-white mt-1"
                      value={saleForm.status_aluguel}
                      onChange={e => setSaleForm(p => ({ ...p, status_aluguel: e.target.value as 'Entregue' | 'Cancelado' | 'Em Realização' }))}
                    >
                      <option value="Entregue">Entregue</option>
                      <option value="Cancelado">Cancelado</option>
                      <option value="Em Realização">Em Realização</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      let next;
                      if (editingAluguelId) {
                        next = biVendas.map(v => v.id_tab === editingAluguelId ? saleForm : v);
                      } else {
                        next = [...biVendas, saleForm];
                      }
                      setBiVendas(next);
                      localStorage.setItem('legis_bi_vendas', JSON.stringify(next));
                      setShowAluguelForm(false);
                      setEditingAluguelId(null);
                    }}
                    className="px-4 py-2 bg-purple-600 text-white rounded text-xs font-bold hover:bg-purple-700"
                  >
                    Salvar
                  </button>
                  <button type="button" onClick={() => { setShowAluguelForm(false); setEditingAluguelId(null); }} className="px-4 py-2 bg-gray-200 text-gray-700 rounded text-xs font-semibold hover:bg-gray-300">
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            {/* Table lists */}
            <div className="overflow-x-auto border border-gray-200 dark:border-[#2A2545] rounded-lg">
              {biAluguelTab === 'clientes' && (
                <table className="w-full text-xs text-left bg-white dark:bg-[#1A1730]">
                  <thead className="bg-gray-100 dark:bg-[#201C3D] uppercase font-bold text-gray-700 dark:text-gray-300 border-b dark:border-[#2A2545]">
                    <tr>
                      <th className="px-3 py-2">Código</th>
                      <th className="px-3 py-2">Nome</th>
                      <th className="px-3 py-2">CPF/CNPJ</th>
                      <th className="px-3 py-2">Cidade</th>
                      <th className="px-3 py-2">Estado</th>
                      <th className="px-3 py-2 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {biClientes.map((c, idx) => (
                      <tr key={c.lista_concatenada} className="border-b dark:border-[#2A2545] hover:bg-gray-50 dark:hover:bg-[#221d3f]">
                        <td className="px-3 py-2">
                          {renderEditableCell(c.codigo, val => handleSaveClientCell(idx, 'codigo', val), {
                            onDoubleClickKey: `client-${idx}-codigo`
                          })}
                        </td>
                        <td className="px-3 py-2 font-medium">
                          {renderEditableCell(c.nome, val => handleSaveClientCell(idx, 'nome', val), {
                            onDoubleClickKey: `client-${idx}-nome`
                          })}
                        </td>
                        <td className="px-3 py-2">
                          {renderEditableCell(c.cpf_cnpj, val => handleSaveClientCell(idx, 'cpf_cnpj', val), {
                            onDoubleClickKey: `client-${idx}-cpf_cnpj`
                          })}
                        </td>
                        <td className="px-3 py-2">
                          {renderEditableCell(c.cidade, val => handleSaveClientCell(idx, 'cidade', val), {
                            onDoubleClickKey: `client-${idx}-cidade`
                          })}
                        </td>
                        <td className="px-3 py-2">
                          {renderEditableCell(c.estado, val => handleSaveClientCell(idx, 'estado', val), {
                            onDoubleClickKey: `client-${idx}-estado`
                          })}
                        </td>
                        <td className="px-3 py-2 text-center space-x-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingAluguelId(c.lista_concatenada);
                              setClientForm({ ...c });
                              setShowAluguelForm(true);
                            }}
                            className="text-blue-600 dark:text-blue-400 hover:underline font-bold"
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm('Excluir este cliente?')) {
                                const next = biClientes.filter(x => x.lista_concatenada !== c.lista_concatenada);
                                setBiClientes(next);
                                localStorage.setItem('legis_bi_clientes', JSON.stringify(next));
                              }
                            }}
                            className="text-red-600 dark:text-red-400 hover:underline font-bold"
                          >
                            Excluir
                          </button>
                        </td>
                      </tr>
                    ))}
                    {biClientes.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-3 py-6 text-center text-gray-400">Nenhum cliente cadastrado.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}

              {biAluguelTab === 'produtos' && (
                <table className="w-full text-xs text-left bg-white dark:bg-[#1A1730]">
                  <thead className="bg-gray-100 dark:bg-[#201C3D] uppercase font-bold text-gray-700 dark:text-gray-300 border-b dark:border-[#2A2545]">
                    <tr>
                      <th className="px-3 py-2">Código</th>
                      <th className="px-3 py-2">Nome</th>
                      <th className="px-3 py-2">Descrição</th>
                      <th className="px-3 py-2 text-right">C/ Desc.</th>
                      <th className="px-3 py-2 text-right">Preço Tabela</th>
                      <th className="px-3 py-2 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {biProdutos.map((p, idx) => (
                      <tr key={p.lista_concatenada} className="border-b dark:border-[#2A2545] hover:bg-gray-50 dark:hover:bg-[#221d3f]">
                        <td className="px-3 py-2">
                          {renderEditableCell(p.codigo, val => handleSaveProductCell(idx, 'codigo', val), {
                            onDoubleClickKey: `product-${idx}-codigo`
                          })}
                        </td>
                        <td className="px-3 py-2 font-medium">
                          {renderEditableCell(p.nome, val => handleSaveProductCell(idx, 'nome', val), {
                            onDoubleClickKey: `product-${idx}-nome`
                          })}
                        </td>
                        <td className="px-3 py-2 truncate max-w-[200px]" title={p.descricao}>
                          {renderEditableCell(p.descricao, val => handleSaveProductCell(idx, 'descricao', val), {
                            onDoubleClickKey: `product-${idx}-descricao`
                          })}
                        </td>
                        <td className="px-3 py-2 text-right">
                          {renderEditableCell(p.custo, val => handleSaveProductCell(idx, 'custo', val), {
                            type: 'number',
                            displayValue: `R$ ${p.custo}`,
                            onDoubleClickKey: `product-${idx}-custo`
                          })}
                        </td>
                        <td className="px-3 py-2 text-right">
                          {renderEditableCell(p.preco_tabela, val => handleSaveProductCell(idx, 'preco_tabela', val), {
                            type: 'number',
                            displayValue: `R$ ${p.preco_tabela}`,
                            onDoubleClickKey: `product-${idx}-preco_tabela`
                          })}
                        </td>
                        <td className="px-3 py-2 text-center space-x-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingAluguelId(p.lista_concatenada);
                              setProductForm({ ...p });
                              setShowAluguelForm(true);
                            }}
                            className="text-blue-600 dark:text-blue-400 hover:underline font-bold"
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm('Excluir este produto?')) {
                                const next = biProdutos.filter(x => x.lista_concatenada !== p.lista_concatenada);
                                setBiProdutos(next);
                                localStorage.setItem('legis_bi_produtos', JSON.stringify(next));
                              }
                            }}
                            className="text-red-600 dark:text-red-400 hover:underline font-bold"
                          >
                            Excluir
                          </button>
                        </td>
                      </tr>
                    ))}
                    {biProdutos.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-3 py-6 text-center text-gray-400">Nenhum produto cadastrado.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}

              {biAluguelTab === 'fornecedores' && (
                <table className="w-full text-xs text-left bg-white dark:bg-[#1A1730]">
                  <thead className="bg-gray-100 dark:bg-[#201C3D] uppercase font-bold text-gray-700 dark:text-gray-300 border-b dark:border-[#2A2545]">
                    <tr>
                      <th className="px-3 py-2">Código</th>
                      <th className="px-3 py-2">Nome</th>
                      <th className="px-3 py-2">CPF/CNPJ</th>
                      <th className="px-3 py-2">Estado</th>
                      <th className="px-3 py-2 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {biFornecedores.map((f, idx) => (
                      <tr key={f.lista_concatenada} className="border-b dark:border-[#2A2545] hover:bg-gray-50 dark:hover:bg-[#221d3f]">
                        <td className="px-3 py-2">
                          {renderEditableCell(f.codigo, val => handleSaveSupplierCell(idx, 'codigo', val), {
                            onDoubleClickKey: `supplier-${idx}-codigo`
                          })}
                        </td>
                        <td className="px-3 py-2 font-medium">
                          {renderEditableCell(f.nome, val => handleSaveSupplierCell(idx, 'nome', val), {
                            onDoubleClickKey: `supplier-${idx}-nome`
                          })}
                        </td>
                        <td className="px-3 py-2">
                          {renderEditableCell(f.cpf_cnpj, val => handleSaveSupplierCell(idx, 'cpf_cnpj', val), {
                            onDoubleClickKey: `supplier-${idx}-cpf_cnpj`
                          })}
                        </td>
                        <td className="px-3 py-2">
                          {renderEditableCell(f.estado, val => handleSaveSupplierCell(idx, 'estado', val), {
                            onDoubleClickKey: `supplier-${idx}-estado`
                          })}
                        </td>
                        <td className="px-3 py-2 text-center space-x-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingAluguelId(f.lista_concatenada);
                              setSupplierForm({ ...f });
                              setShowAluguelForm(true);
                            }}
                            className="text-blue-600 dark:text-blue-400 hover:underline font-bold"
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm('Excluir este fornecedor?')) {
                                const next = biFornecedores.filter(x => x.lista_concatenada !== f.lista_concatenada);
                                setBiFornecedores(next);
                                localStorage.setItem('legis_bi_fornecedores', JSON.stringify(next));
                              }
                            }}
                            className="text-red-600 dark:text-red-400 hover:underline font-bold"
                          >
                            Excluir
                          </button>
                        </td>
                      </tr>
                    ))}
                    {biFornecedores.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-3 py-6 text-center text-gray-400">Nenhum fornecedor cadastrado.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}

              {biAluguelTab === 'vendas' && (
                <table className="w-full text-xs text-left bg-white dark:bg-[#1A1730]">
                  <thead className="bg-gray-100 dark:bg-[#201C3D] uppercase font-bold text-gray-700 dark:text-gray-300 border-b dark:border-[#2A2545]">
                    <tr>
                      <th className="px-3 py-2">ID</th>
                      <th className="px-3 py-2">Cliente</th>
                      <th className="px-3 py-2">Fornecedor</th>
                      <th className="px-3 py-2">Produto</th>
                      <th className="px-3 py-2 text-right">Qtd</th>
                      <th className="px-3 py-2 text-right">Total</th>
                      <th className="px-3 py-2 text-right">Lucro</th>
                      <th className="px-3 py-2">STATUS SERVIÇO</th>
                      <th className="px-3 py-2 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {biVendas.map((v, idx) => (
                      <tr key={v.id_tab} className="border-b dark:border-[#2A2545] hover:bg-gray-50 dark:hover:bg-[#221d3f]">
                        <td className="px-3 py-2">
                          {renderEditableCell(v.id_tab, val => handleSaveSaleCell(idx, 'id_tab', val), {
                            onDoubleClickKey: `sale-${idx}-id_tab`
                          })}
                        </td>
                        <td className="px-3 py-2 font-medium truncate max-w-[120px]" title={v.cliente}>
                          {renderEditableCell(v.cliente, val => handleSaveSaleCell(idx, 'cliente', val), {
                            type: 'select',
                            selectOptions: biClientes.map(c => c.lista_concatenada),
                            onDoubleClickKey: `sale-${idx}-cliente`
                          })}
                        </td>
                        <td className="px-3 py-2 truncate max-w-[120px]" title={v.fornecedor}>
                          {renderEditableCell(v.fornecedor, val => handleSaveSaleCell(idx, 'fornecedor', val), {
                            type: 'select',
                            selectOptions: biFornecedores.map(f => f.lista_concatenada),
                            onDoubleClickKey: `sale-${idx}-fornecedor`
                          })}
                        </td>
                        <td className="px-3 py-2 truncate max-w-[120px]" title={v.produto}>
                          {renderEditableCell(v.produto, val => handleSaveSaleCell(idx, 'produto', val), {
                            type: 'select',
                            selectOptions: biProdutos.map(p => p.lista_concatenada),
                            onDoubleClickKey: `sale-${idx}-produto`
                          })}
                        </td>
                        <td className="px-3 py-2 text-right">
                          {renderEditableCell(v.qtd, val => handleSaveSaleCell(idx, 'qtd', val), {
                            type: 'number',
                            onDoubleClickKey: `sale-${idx}-qtd`
                          })}
                        </td>
                        <td className="px-3 py-2 text-right font-semibold text-emerald-700">
                          {renderEditableCell(v.valor_total, val => handleSaveSaleCell(idx, 'valor_total', val), {
                            type: 'number',
                            displayValue: `R$ ${v.valor_total.toLocaleString('pt-BR')}`,
                            onDoubleClickKey: `sale-${idx}-valor_total`
                          })}
                        </td>
                        <td className="px-3 py-2 text-right text-emerald-600">
                          {renderEditableCell(v.lucro, val => handleSaveSaleCell(idx, 'lucro', val), {
                            type: 'number',
                            displayValue: `R$ ${v.lucro.toLocaleString('pt-BR')}`,
                            onDoubleClickKey: `sale-${idx}-lucro`
                          })}
                        </td>
                        <td className="px-3 py-2">
                          {renderEditableCell(
                            v.status_aluguel,
                            val => handleSaveSaleCell(idx, 'status_aluguel', val),
                            {
                              type: 'select',
                              selectOptions: ['Entregue', 'Cancelado', 'Em Realização'],
                              displayValue: v.status_aluguel,
                              onDoubleClickKey: `sale-${idx}-status_aluguel`,
                              className: `px-2 py-0.5 rounded text-[10px] font-bold ${
                                v.status_aluguel === 'Entregue' ? 'bg-green-100 text-green-800' :
                                v.status_aluguel === 'Cancelado' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`
                            }
                          )}
                        </td>
                        <td className="px-3 py-2 text-center space-x-2 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingAluguelId(v.id_tab);
                              setSaleForm({ ...v });
                              setShowAluguelForm(true);
                            }}
                            className="text-blue-600 dark:text-blue-400 hover:underline font-bold"
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm('Excluir este lançamento de aluguer?')) {
                                const next = biVendas.filter(x => x.id_tab !== v.id_tab);
                                setBiVendas(next);
                                localStorage.setItem('legis_bi_vendas', JSON.stringify(next));
                              }
                            }}
                            className="text-red-600 dark:text-red-400 hover:underline font-bold"
                          >
                            Excluir
                          </button>
                        </td>
                      </tr>
                    ))}
                    {biVendas.length === 0 && (
                      <tr>
                        <td colSpan={9} className="px-3 py-6 text-center text-gray-400">Nenhum lançamento cadastrado.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Documentação BI */}
        <div className="bg-slate-50 dark:bg-[#1A1730]/40 border border-slate-200 dark:border-[#2A2545] rounded-xl p-4 space-y-3">
          <h5 className="text-xs font-bold text-slate-800 dark:text-slate-300 uppercase flex items-center gap-1">
            <span><Icon name="📖" className="w-4 h-4 inline-block mr-1 align-text-bottom" /></span> Documentação do Modelo de Dados & Relacionamentos
          </h5>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Copie os scripts de transformação de dados para Power BI (DAX), Python (Pandas) ou SQL para recriar o modelo de dados de forma idêntica ou otimizada:
          </p>

          <div className="space-y-3 text-left">
            <div className="bg-white dark:bg-[#1A1730] p-3 rounded-lg border border-slate-100 dark:border-[#2A2545] space-y-1.5">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300"><Icon name="🔗" className="w-3.5 h-3.5 inline-block mr-0.5 align-text-bottom" /> Estrutura de Relacionamentos</p>
              {biSubTab === 'excel_ums' ? (
                <ol className="list-decimal list-inside text-[11px] text-gray-600 dark:text-gray-400 space-y-1 leading-relaxed">
                  <li><strong>Chave de Relação:</strong> Ligue as tabelas usando <code>tb_apoio[periodos]</code> &rarr; <code>tb_dados_base[semestre]</code>.</li>
                  <li><strong>Cardinalidade:</strong> Relacionamento de <strong>1 para Muitos (1:N)</strong>, onde cada período de premissa se relaciona a múltiplos registros mensais.</li>
                  <li><strong>Direção do Filtro:</strong> Unidirecional (tb_apoio filtra tb_dados_base).</li>
                  <li><strong>Alinhamento:</strong> Mantenha os mesmos nomes textuais (ex: '1º sem', '2º sem') em ambos os lados para que as fórmulas encontrem os percentuais corretos.</li>
                </ol>
              ) : (
                <ol className="list-decimal list-inside text-[11px] text-gray-600 dark:text-gray-400 space-y-1 leading-relaxed">
                  <li><strong>Chave de Relação (Clientes):</strong> <code>dim_clientes[lista_concatenada]</code> &rarr; <code>fato_vendas[cliente]</code> (1:N).</li>
                  <li><strong>Chave de Relação (Produtos):</strong> <code>dim_produtos[lista_concatenada]</code> &rarr; <code>fato_vendas[produto]</code> (1:N).</li>
                  <li><strong>Chave de Relação (Fornecedores):</strong> <code>dim_fornecedores[lista_concatenada]</code> &rarr; <code>fato_vendas[fornecedor]</code> (1:N).</li>
                  <li><strong>Nota de Limpeza:</strong> Como as chaves originais utilizam o formato concatenado "ID - Nome", a tabela facto liga-se diretamente às chaves primárias textuais correspondentes.</li>
                </ol>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex gap-2 border-b border-gray-200 dark:border-[#2A2545]">
                {biSubTab === 'excel_ums' ? (
                  ['DAX (Power BI)', 'Python (Pandas)', 'SQL Queries'].map(tabName => (
                    <button
                      key={tabName}
                      type="button"
                      onClick={() => setDocTab(tabName)}
                      className={`pb-1 text-xs font-bold ${docTab === tabName ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}
                    >
                      {tabName}
                    </button>
                  ))
                ) : (
                  ['SQL (Criação de Tabelas)', 'Tratamento de Chaves (Regex / Limpeza)', 'Fórmulas DAX'].map(tabName => (
                    <button
                      key={tabName}
                      type="button"
                      onClick={() => setDocTab(tabName)}
                      className={`pb-1 text-xs font-bold ${docTab === tabName ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}
                    >
                      {tabName}
                    </button>
                  ))
                )}
              </div>

              {biSubTab === 'excel_ums' && docTab === 'DAX (Power BI)' && (
                <pre className="p-3 bg-gray-900 text-gray-200 rounded-lg text-[10px] font-mono overflow-auto max-h-48 leading-relaxed">
{`-- Medida: Faturamento Acumulado
Faturamento_Acumulado = SUM(tb_dados_base[receita_fat])

-- Medida: Resultado Mensal
Resultado_Mensal = SUM(tb_dados_base[receita_fat]) + SUM(tb_dados_base[transferencia_recebida]) - SUM(tb_dados_base[despesa_total])

-- Coluna Calculada: Dias para Recebimento
Dias_p_Recebimento = DATEDIFF(tb_dados_base[emissao_nf], tb_dados_base[recebimento_nf], DAY)

-- Medida: Prazo Médio de Recebimento
Prazo_Medio_Recebimento = AVERAGE(tb_dados_base[Dias_p_Recebimento])

-- Coluna Calculada: Despesa Administrativa
Despesa_Administrativa = tb_dados_base[despesa_total] - tb_dados_base[custo] - tb_dados_base[imposto] - tb_dados_base[juros] - tb_dados_base[salarios_ordenados] - tb_dados_base[glosa]

-- Coluna Calculada: Custo Operacional Amplo
Custo_Mais_Despesa = tb_dados_base[custo] + tb_dados_base[Despesa_Administrativa]

-- Coluna Calculada: Base de Saída Total
Total_Saidas_Razao = tb_dados_base[custo] + tb_dados_base[Despesa_Administrativa] + tb_dados_base[imposto]

-- Medida: Razão de Eficiência Mensal
Razao_Mensal = DIVIDE(SUM(tb_dados_base[Total_Saidas_Razao]), SUM(tb_dados_base[receita_fat]) + SUM(tb_dados_base[transferencia_recebida]))

-- Medida: UMS Acumulado
Executado_UMS_Acumulado = 
CALCULATE(
    SUM(tb_dados_base[executado_ums]),
    FILTER(
        ALLSELECTED(tb_dados_base),
        tb_dados_base[mes_ano] <= MAX(tb_dados_base[mes_ano])
    )
)

-- Medida: % Consumo do Teto
Percentual_Consumo_Teto = DIVIDE([Executado_UMS_Acumulado], 189346)`}
                </pre>
              )}
              {biSubTab === 'excel_ums' && docTab === 'Python (Pandas)' && (
                <pre className="p-3 bg-gray-900 text-gray-200 rounded-lg text-[10px] font-mono overflow-auto max-h-48 leading-relaxed">
{`import pandas as pd
import numpy as np

# Carregar dados
tb_dados_base = pd.read_csv('tb_dados_base.csv')
tb_dados_base['mes_ano'] = pd.to_datetime(tb_dados_base['mes_ano'])
tb_dados_base['emissao_nf'] = pd.to_datetime(tb_dados_base['emissao_nf'])
tb_dados_base['recebimento_nf'] = pd.to_datetime(tb_dados_base['recebimento_nf'])

# 1. Resultado Mensal
tb_dados_base['Resultado'] = tb_dados_base['receita_fat'] + tb_dados_base['transferencia_recebida'] - tb_dados_base['despesa_total']

# 2. Prazo Médio de Recebimento
tb_dados_base['Dias_p_Recebimento'] = (tb_dados_base['recebimento_nf'] - tb_dados_base['emissao_nf']).dt.days

# 3. Despesa Administrativa e Custo Operacional Amplo
tb_dados_base['Despesa_Administrativa'] = (
    tb_dados_base['despesa_total'] - tb_dados_base['custo'] - 
    tb_dados_base['imposto'] - tb_dados_base['juros'] - 
    tb_dados_base['salarios_ordenados'] - tb_dados_base['glosa']
).clip(lower=0)

tb_dados_base['Custo_Mais_Despesa'] = tb_dados_base['custo'] + tb_dados_base['Despesa_Administrativa']

# 4. Base de Saída Total para Razão
tb_dados_base['Total_Saidas_Razao'] = tb_dados_base['custo'] + tb_dados_base['Despesa_Administrativa'] + tb_dados_base['imposto']

# 5. Razão de Eficiência Mensal
tb_dados_base['Razao_Mensal'] = tb_dados_base['Total_Saidas_Razao'] / (tb_dados_base['receita_fat'] + tb_dados_base['transferencia_recebida'])

# 6. Consumo do Teto UMS
tb_dados_base = tb_dados_base.sort_values('mes_ano')
tb_dados_base['Executado_UMS_Acumulado'] = tb_dados_base['executado_ums'].cumsum()
tb_dados_base['Percentual_Consumo_Teto'] = tb_dados_base['Executado_UMS_Acumulado'] / 189346`}
                </pre>
              )}
              {biSubTab === 'excel_ums' && docTab === 'SQL Queries' && (
                <pre className="p-3 bg-gray-900 text-gray-200 rounded-lg text-[10px] font-mono overflow-auto max-h-48 leading-relaxed">
{`-- 1. Resultado Mensal
SELECT 
    id_tab,
    mes_ano,
    (receita_fat + transferencia_recebida - despesa_total) AS resultado_mensal
FROM tb_dados_base;

-- 2. Prazo Médio de Recebimento
SELECT 
    id_tab,
    mes_ano,
    DATEDIFF(day, emissao_nf, recebimento_nf) AS dias_p_recebimento
FROM tb_dados_base;

-- 3. Custo Operacional Amplo e Base de Saída Total
SELECT 
    id_tab,
    mes_ano,
    custo,
    despesa_total,
    imposto,
    (despesa_total - custo - imposto - juros - salarios_ordenados - glosa) AS despesa_administrativa,
    (custo + (despesa_total - custo - imposto - juros - salarios_ordenados - glosa)) AS custo_mais_despesa,
    (custo + (despesa_total - custo - imposto - juros - salarios_ordenados - glosa) + imposto) AS total_saidas_razao
FROM tb_dados_base;

-- 4. Razão de Eficiência Mensal e Consumo UMS
WITH acumulado AS (
    SELECT 
        b.*,
        SUM(executado_ums) OVER (ORDER BY mes_ano) AS executado_ums_acumulado
    FROM tb_dados_base b
)
SELECT 
    id_tab,
    mes_ano,
    executado_ums,
    executado_ums_acumulado,
    (executado_ums_acumulado / 189346.0) AS percentual_consumo_teto,
    (custo + (despesa_total - custo - imposto - juros - salarios_ordenados - glosa) + imposto) / NULLIF(receita_fat + transferencia_recebida, 0) AS razao_mensal
FROM acumulado;`}
                </pre>
              )}

              {/* Equipment Rental docs */}
              {biSubTab === 'servicos_aluguel' && docTab === 'SQL (Criação de Tabelas)' && (
                <pre className="p-3 bg-gray-900 text-gray-200 rounded-lg text-[10px] font-mono overflow-auto max-h-48 leading-relaxed">
{`-- 1. Criação do DDL para Dimensões e Facto (Star Schema)
CREATE TABLE dim_clientes (
    lista_concatenada VARCHAR(255) PRIMARY KEY, -- ID - Nome
    codigo VARCHAR(50) UNIQUE,
    nome VARCHAR(150),
    cpf_cnpj VARCHAR(50),
    cidade VARCHAR(100),
    estado VARCHAR(2)
);

CREATE TABLE dim_produtos (
    lista_concatenada VARCHAR(255) PRIMARY KEY, -- ID - Nome
    codigo VARCHAR(50) UNIQUE,
    nome VARCHAR(150),
    descricao TEXT,
    custo DECIMAL(18,4),
    preco_tabela DECIMAL(18,4)
);

CREATE TABLE dim_fornecedores (
    lista_concatenada VARCHAR(255) PRIMARY KEY, -- ID - Nome
    codigo VARCHAR(50) UNIQUE,
    nome VARCHAR(150),
    cpf_cnpj VARCHAR(50),
    estado VARCHAR(2)
);

CREATE TABLE fato_vendas (
    id_tab VARCHAR(50) PRIMARY KEY,
    fornecedor VARCHAR(255) REFERENCES dim_fornecedores(lista_concatenada),
    cliente VARCHAR(255) REFERENCES dim_clientes(lista_concatenada),
    produto VARCHAR(255) REFERENCES dim_produtos(lista_concatenada),
    qtd INT,
    vlr_unit DECIMAL(18,4),
    valor_total DECIMAL(18,4),
    custo_prod DECIMAL(18,4),
    lucro DECIMAL(18,4),
    data DATE,
    data_referencia DATE,
    data_retirada DATE,
    data_devolucao DATE,
    status_pagamento VARCHAR(50),
    status_aluguel VARCHAR(50)
);`}
                </pre>
              )}

              {biSubTab === 'servicos_aluguel' && docTab === 'Tratamento de Chaves (Regex / Limpeza)' && (
                <pre className="p-3 bg-gray-900 text-gray-200 rounded-lg text-[10px] font-mono overflow-auto max-h-48 leading-relaxed">
{`# Script Python/Pandas para Limpeza de Dados e Chaves
import pandas as pd
import re

# Carregar vendas originais com chaves mistas
fato_vendas = pd.read_csv('Vendas.csv')

# Extrair ID numérico e Nome limpo a partir de chaves concatenadas "ID - Nome"
def extrair_id(texto):
    if pd.isna(texto): return None
    match = re.match(r'^(\\w+)\\s*-\\s*', str(texto))
    return match.group(1) if match else str(texto)

def extrair_nome(texto):
    if pd.isna(texto): return None
    return re.sub(r'^\\w+\\s*-\\s*', '', str(texto))

# Aplicar transformações
fato_vendas['cliente_codigo'] = fato_vendas['Cliente'].apply(extrair_id)
fato_vendas['cliente_nome'] = fato_vendas['Cliente'].apply(extrair_nome)

fato_vendas['produto_codigo'] = fato_vendas['Produto'].apply(extrair_id)
fato_vendas['produto_nome'] = fato_vendas['Produto'].apply(extrair_nome)

fato_vendas['fornecedor_codigo'] = fato_vendas['Fornecedor'].apply(extrair_id)
fato_vendas['fornecedor_nome'] = fato_vendas['Fornecedor'].apply(extrair_nome)`}
                </pre>
              )}

              {biSubTab === 'servicos_aluguel' && docTab === 'Fórmulas DAX' && (
                <pre className="p-3 bg-gray-900 text-gray-200 rounded-lg text-[10px] font-mono overflow-auto max-h-48 leading-relaxed">
{`-- 1. Faturamento Total (Medida)
Faturamento_Total = SUM(fato_vendas[Valor Total])

-- 2. Lucro Líquido Acumulado (Medida)
Lucro_Total = SUM(fato_vendas[Lucro])

-- 3. Margem de Lucro % (Medida)
Margem_Lucro = DIVIDE([Lucro_Total], [Faturamento_Total], 0)

-- 4. Tempo Médio em Dias (Medida)
Tempo_Medio = AVERAGE(DATEDIFF(fato_vendas[Data Entrada], fato_vendas[Data Entrega], DAY))

-- 5. Valor Cancelado (Medida)
Valor_Cancelado = CALCULATE([Faturamento_Total], fato_vendas[Status do Serviço] = "Cancelado")`}
                </pre>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t flex items-center gap-3">
        <button onClick={handleSave} className="px-5 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90">
          {saved ? '✓ Salvo!' : 'Salvar Configurações'}
        </button>
        {saved && <span className="text-xs text-green-600 font-medium"><Icon name="✓" className="w-3.5 h-3.5 inline-block mr-0.5 align-text-bottom" /> Configurações salvas e aplicadas em tempo real.</span>}
      </div>
    </div>
  );
};

