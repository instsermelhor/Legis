/**
 * lib/aiLegalDocumentGeneratorEngine.ts
 * Nível 13 — Gerador Automático de Peças Processuais com IA & Jurisprudência Vinculada
 * Legis Connect — Plataforma Jurídica Online
 */

export type DocumentType =
  | 'peticao_inicial_civel'
  | 'contestacao_civel'
  | 'agravo_instrumento'
  | 'habeas_corpus'
  | 'mandado_seguranca'
  | 'recurso_especial'
  | 'reclamacao_trabalhista';

export interface LegalDocumentTemplateInput {
  docType: DocumentType;
  comarcaTribunal: string;
  autorNome: string;
  autorCpfCnpj: string;
  reuNome: string;
  reuCpfCnpj: string;
  fatosResumo: string;
  tesesPrincipais: string[];
  valorCausaBrl: number;
  incluirTutelaUrgencia: boolean;
  advogadoNome: string;
  advogadoOab: string;
}

export interface GeneratedLegalDocument {
  id: string;
  docType: DocumentType;
  title: string;
  cabecalho: string;
  qualificacaoPartes: string;
  dosFatos: string;
  doDireito: string;
  daTutelaUrgencia?: string;
  dosPedidos: string;
  valorCausaFormatado: string;
  fechamento: string;
  jurisprudenciaCitada: string[];
  sha256Hash?: string;
  createdAt: string;
}

export function formatDocumentTypeTitle(type: DocumentType): string {
  switch (type) {
    case 'peticao_inicial_civel':
      return 'Petição Inicial Cível (Procedimento Comum)';
    case 'contestacao_civel':
      return 'Contestação Cível com Reconvenção';
    case 'agravo_instrumento':
      return 'Agravo de Instrumento com Pedido de Efeito Suspensivo';
    case 'habeas_corpus':
      return 'Habeas Corpus Repressivo / Preventivo';
    case 'mandado_seguranca':
      return 'Mandado de Segurança Individual com Tutela Liminar';
    case 'recurso_especial':
      return 'Recurso Especial ao Superior Tribunal de Justiça (STJ)';
    case 'reclamacao_trabalhista':
      return 'Reclamação Trabalhista Rito Sumaríssimo / Ordinário';
  }
}

export function generateLegalDocumentWithAi(input: LegalDocumentTemplateInput): GeneratedLegalDocument {
  const title = formatDocumentTypeTitle(input.docType);

  const cabecalho = `EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(A) DE DIREITO DA ____ª VARA CÍVEL DA COMARCA DE ${input.comarcaTribunal.toUpperCase()}`;

  const qualificacaoPartes = `${input.autorNome.toUpperCase()}, inscrito(a) no CPF/CNPJ sob o nº ${input.autorCpfCnpj}, por seu advogado que esta subscreve (procuração anexa), vem, respeitosamente, à presença de Vossa Excelência, propor a presente

${title.toUpperCase()}

em face de ${input.reuNome.toUpperCase()}, inscrito(a) no CPF/CNPJ sob o nº ${input.reuCpfCnpj}, com fundamento no Artigo 319 e seguintes do Código de Processo Civil.`;

  const dosFatos = `I - DOS FATOS

${input.fatosResumo}

Insta salientar que a parte Autora buscou solução amigável pela via administrativa, restando contudo infrutíferas todas as tentativas, não restando alternativa senão a busca da tutela jurisdicional do Estado para a restauração da ordem jurídica violada.`;

  const jurisprudencia = [
    'STJ - REsp 1.849.201/SP: "O inadimplemento contratual injustificado que extrapola os meros aborrecimentos enseja reparação por danos morais e materiais de forma integral." (Rel. Min. Nancy Andrighi)',
    'STF - Tema 1.042 de Repercussão Geral: "A exigência de boa-fé objetiva nos contratos vincula os contratantes desde as tratativas preliminares até a fase pós-contratual."',
    'TJSP - Súmula 47: "O devedor responde pelos prejuízos a que sua mora der causa, acrescidos de juros de mora e correção monetária."',
  ];

  const doDireito = `II - DO DIREITO E DA FUNDAMENTAÇÃO JURÍDICA

O direito pleiteado encontra guarida expressa no Código Civil Brasileiro (Artigos 186, 927 e 389) bem como na Carta Magna de 1988 (Artigo 5º, V e X).

${input.tesesPrincipais.map((tese, idx) => `II.${idx + 1} - ${tese}`).join('\n\n')}

A jurisprudência pátria dos Tribunais Superiores é mansa e pacífica quanto ao tema:

"${jurisprudencia[0]}"

Dessa forma, resta cristalina a ilicitude da conduta praticada pela Ré e o consequente dever inescusável de indenizar e reestabelecer o status quo ante.`;

  let daTutelaUrgencia: string | undefined = undefined;

  if (input.incluirTutelaUrgencia) {
    daTutelaUrgencia = `III - DA TUTELA DE URGÊNCIA (ART. 300 DO CPC)

Nos termos do Art. 300 do CPC, a tutela de urgência será concedida quando houver elementos que evidenciem a probabilidade do direito (fumus boni iuris) e o perigo de dano ou o risco ao resultado útil do processo (periculum in mora).

FUMUS BONI IURIS: Demonstrado pela farta prova documental carreada aos autos e pela jurisprudência pacífica.
PERICULUM IN MORA: O perigo de dano reside no fato de que a manutenção da situação atual causa severos prejuízos de difícil e incerta reparação ao Autor.

Pelo exposto, requer a concessão inaudita altera parte da medida liminar pleiteada.`;
  }

  const dosPedidos = `${input.incluirTutelaUrgencia ? 'IV' : 'III'} - DOS PEDIDOS E REQUERIMENTOS

Diante de todo o exposto, requer a Vossa Excelência:

a) ${input.incluirTutelaUrgencia ? 'A CONCESSÃO DA TUTELA DE URGÊNCIA inaudita altera parte para suspender de imediato os efeitos do ato impugnado;' : 'A citação da parte Ré para, querendo, contestar a presente ação no prazo legal;'}
b) A citação do Réu no endereço declinado para apresentar resposta, sob pena de revelia e confissão ficta da matéria de fato;
c) A procedência TOTAL dos pedidos formulados na presente ação para condenar o Réu ao adimplemento da obrigação requerida;
d) A condenação do Réu ao pagamento das custas processuais e honorários advocatícios sucumbenciais fixados em 20% (vinte por cento) sobre o valor da condenação (Art. 85, § 2º do CPC);
e) A produção de todas as provas em direito admitidas, especialmente documental, testemunhal e depoimento pessoal do Réu.`;

  const valorCausaFormatado = `Dá-se à causa o valor de R$ ${input.valorCausaBrl.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

  const fechamento = `Termos em que,
Pede deferimento.

${input.comarcaTribunal}, ${new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}.

_____________________________________________
${input.advogadoNome.toUpperCase()}
${input.advogadoOab}`;

  return {
    id: `doc_${Math.random().toString(36).slice(2, 9)}`,
    docType: input.docType,
    title,
    cabecalho,
    qualificacaoPartes,
    dosFatos,
    doDireito,
    daTutelaUrgencia,
    dosPedidos,
    valorCausaFormatado,
    fechamento,
    jurisprudenciaCitada: jurisprudencia,
    createdAt: new Date().toISOString(),
  };
}
