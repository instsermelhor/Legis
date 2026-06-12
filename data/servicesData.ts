// data/servicesData.ts — Esquema de dados dos Serviços de Eficiência (Legis Connect)

export interface ServiceItem {
  id: string;
  category: 'B2C' | 'B2B';
  title: string;
  icon: string;
  description: string;
  features: string[];
  deliveryDays: number;
  priceFrom: number;
  priceLabel: string;
  tag?: 'popular' | 'novo' | 'empresa' | 'destaque';
}

export const b2cServices: ServiceItem[] = [
  {
    id: 'b2c-consultoria-expressa',
    category: 'B2C',
    title: 'Consultoria Jurídica Expressa',
    icon: '⚡',
    description: 'Tire suas dúvidas em até 24h com um advogado especialista. Ideal antes de assinar documentos ou tomar decisões importantes.',
    features: [
      'Sessão de 60 minutos com advogado especialista',
      'Análise do seu caso e orientação estratégica',
      'Relatório escrito do atendimento',
      'Suporte por WhatsApp por 7 dias',
    ],
    deliveryDays: 1,
    priceFrom: 97,
    priceLabel: 'a partir de R$ 97',
    tag: 'popular',
  },
  {
    id: 'b2c-analise-contrato-aluguel',
    category: 'B2C',
    title: 'Análise de Contrato de Aluguel',
    icon: '🏠',
    description: 'Proteja-se de cláusulas abusivas antes de assinar. Nossos especialistas revisam cada linha do seu contrato residencial ou comercial.',
    features: [
      'Leitura completa e análise de todas as cláusulas',
      'Identificação de cláusulas abusivas ou ilegais',
      'Relatório em linguagem simples com recomendações',
      'Sugestão de contrapropostas negociáveis',
    ],
    deliveryDays: 2,
    priceFrom: 147,
    priceLabel: 'a partir de R$ 147',
    tag: 'popular',
  },
  {
    id: 'b2c-notificacao-extrajudicial',
    category: 'B2C',
    title: 'Notificação Extrajudicial',
    icon: '📨',
    description: 'Uma notificação formal resolve muitos problemas sem precisar ir à Justiça. Rápido, eficaz e com validade jurídica total.',
    features: [
      'Elaboração da notificação por advogado credenciado',
      'Envio por Correios com AR ou via e-mail com confirmação',
      'Comprovante de entrega para processo futuro',
      'Revisão ilimitada do texto até aprovação',
    ],
    deliveryDays: 3,
    priceFrom: 197,
    priceLabel: 'a partir de R$ 197',
  },
  {
    id: 'b2c-defesa-consumidor',
    category: 'B2C',
    title: 'Defesa do Consumidor',
    icon: '🛡️',
    description: 'Produto com defeito, serviço não prestado, cobrança indevida? Você tem direitos. Vamos exercê-los por você com rapidez.',
    features: [
      'Análise do caso e identificação da violação legal',
      'Elaboração de carta de reclamação formal',
      'Petição para PROCON ou Juizado Especial',
      'Cálculo de indenização por danos morais e materiais',
    ],
    deliveryDays: 5,
    priceFrom: 247,
    priceLabel: 'a partir de R$ 247',
    tag: 'novo',
  },
  {
    id: 'b2c-revisao-contrato-trabalho',
    category: 'B2C',
    title: 'Revisão de Contrato de Trabalho',
    icon: '💼',
    description: 'Antes de assinar ou após ser demitido, conheça seus direitos reais. Evite prejuízos e surpresas desagradáveis.',
    features: [
      'Análise das cláusulas do contrato ou rescisão',
      'Verificação de verbas devidas (FGTS, férias, 13º)',
      'Orientação sobre aviso prévio e multas',
      'Carta de contestação de rescisão indevida',
    ],
    deliveryDays: 3,
    priceFrom: 197,
    priceLabel: 'a partir de R$ 197',
  },
  {
    id: 'b2c-divorcio-consensual',
    category: 'B2C',
    title: 'Divórcio Consensual Online',
    icon: '💍',
    description: 'Quando há acordo entre as partes, o divórcio pode ser rápido e sem drama. Processo 100% online, sem precisar ir ao fórum.',
    features: [
      'Elaboração completa da petição ou escritura',
      'Divisão de bens, guarda e pensão orientados',
      'Protocolo eletrônico no cartório ou tribunal',
      'Acompanhamento até a certidão final',
    ],
    deliveryDays: 15,
    priceFrom: 897,
    priceLabel: 'a partir de R$ 897',
    tag: 'destaque',
  },
];

export const b2bServices: ServiceItem[] = [
  {
    id: 'b2b-registro-marca',
    category: 'B2B',
    title: 'Registro de Marca no INPI',
    icon: '™️',
    description: 'Sua marca é o ativo mais valioso do negócio. Proteja-a antes que outra empresa o faça. Cuidamos de todo o processo junto ao INPI.',
    features: [
      'Busca prévia de disponibilidade da marca',
      'Escolha estratégica de classes de proteção',
      'Protocolo e acompanhamento junto ao INPI',
      'Resposta a eventuais exigências ou oposições',
    ],
    deliveryDays: 30,
    priceFrom: 597,
    priceLabel: 'a partir de R$ 597',
    tag: 'popular',
  },
  {
    id: 'b2b-alteracao-contratual',
    category: 'B2B',
    title: 'Alteração de Contrato Social',
    icon: '📑',
    description: 'Mudou sócio, endereço, atividade ou capital social? Mantenha sua empresa em dia com a legislação sem burocracia.',
    features: [
      'Elaboração da alteração contratual ou distrato',
      'Registro na Junta Comercial do seu estado',
      'Atualização no CNPJ na Receita Federal',
      'Emissão do novo CNPJ atualizado',
    ],
    deliveryDays: 10,
    priceFrom: 447,
    priceLabel: 'a partir de R$ 447',
  },
  {
    id: 'b2b-termos-lgpd',
    category: 'B2B',
    title: 'Termos de Uso + Política LGPD',
    icon: '🔒',
    description: 'Esteja em conformidade com a LGPD antes de sofrer multas de até R$ 50 milhões. Documentos personalizados para o seu negócio.',
    features: [
      'Política de Privacidade conforme LGPD (Lei 13.709/2018)',
      'Termos de Uso com limitação de responsabilidade',
      'Política de Cookies e Consentimento',
      'Política de Retenção e Descarte de Dados',
    ],
    deliveryDays: 5,
    priceFrom: 697,
    priceLabel: 'a partir de R$ 697',
    tag: 'novo',
  },
  {
    id: 'b2b-auditoria-trabalhista',
    category: 'B2B',
    title: 'Auditoria Trabalhista Preventiva',
    icon: '🔍',
    description: 'Identifique passivos trabalhistas ocultos antes que virem processos. Empresas com 5+ funcionários economizam em média R$ 30k.',
    features: [
      'Revisão de contratos, holerites e ponto eletrônico',
      'Análise de conformidade com a CLT e acordos coletivos',
      'Relatório de riscos com índice de criticidade',
      'Plano de ação prioritizado para correção',
    ],
    deliveryDays: 10,
    priceFrom: 1497,
    priceLabel: 'a partir de R$ 1.497',
    tag: 'empresa',
  },
  {
    id: 'b2b-contratos-comerciais',
    category: 'B2B',
    title: 'Contratos Comerciais',
    icon: '🤝',
    description: 'Parcerias, fornecedores, distribuidores, licenciamentos. Contratos claros protegem seu negócio e evitam litígios futuros.',
    features: [
      'Contrato personalizado conforme o modelo de negócio',
      'Cláusulas de confidencialidade (NDA) e exclusividade',
      'Definição de SLA, penalidades e rescisão',
      'Revisão após negociação com a contraparte',
    ],
    deliveryDays: 5,
    priceFrom: 547,
    priceLabel: 'a partir de R$ 547',
  },
  {
    id: 'b2b-due-diligence',
    category: 'B2B',
    title: 'Due Diligence Empresarial',
    icon: '📊',
    description: 'Antes de comprar uma empresa, fazer uma fusão ou grande investimento, conheça todos os riscos jurídicos, fiscais e trabalhistas.',
    features: [
      'Análise de passivos judiciais e extrajudiciais',
      'Verificação societária e regularidade fiscal',
      'Análise de contratos vigentes e obrigações',
      'Relatório executivo com mapa de riscos',
    ],
    deliveryDays: 15,
    priceFrom: 2497,
    priceLabel: 'a partir de R$ 2.497',
    tag: 'destaque',
  },
];

export const allServices: ServiceItem[] = [...b2cServices, ...b2bServices];
