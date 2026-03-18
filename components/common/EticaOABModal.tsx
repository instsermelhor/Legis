import React from 'react';
import { XIcon } from './IconComponents';

interface ModalProps {
    onClose: () => void;
}

export const EticaOABModal: React.FC<ModalProps> = ({ onClose }) => {
    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-xl w-full max-w-3xl h-[85vh] relative animate-slide-up flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 border-b flex items-start justify-between">
                    <h2 className="text-xl font-bold text-gray-800">Código de Ética e Disciplina da OAB</h2>
                    <button onClick={onClose} className="-mt-2 -mr-2 p-2 rounded-full hover:bg-gray-200 transition-colors" aria-label="Close">
                        <XIcon className="w-6 h-6 text-gray-600" />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto flex-grow space-y-4 text-sm text-gray-700 leading-relaxed">
                    <p>
                        O CONSELHO FEDERAL DA ORDEM DOS ADVOGADOS DO BRASIL, ao instituir o Código de Ética e Disciplina, norteou-se por princípios que formam a consciência profissional do advogado e representam imperativos de sua conduta, tais como: os de lutar sem receio pelo primado da Justiça; pugnar pelo cumprimento da Constituição e pelo respeito à Lei, fazendo com que esta seja interpretada com retidão, em perfeita sintonia com os fins sociais a que se dirige e as exigências do bem comum; ser fiel à verdade para poder servir à Justiça como um de seus elementos essenciais; proceder com lealdade e boa-fé em suas relações profissionais e em todos os atos do seu ofício; empenhar-se na defesa das causas confiadas ao seu patrocínio, dando ao constituinte o amparo do Direito, e proporcionando-lhe a realização prática de seus legítimos interesses; comportar-se, nesse mister, com independência e altivez, defendendo com o mesmo denodo humildes e poderosos.
                    </p>
                    <p>
                        Inspirado nesses postulados é que o Conselho Federal da Ordem dos Advogados do Brasil, no uso das atribuições que lhe são conferidas pelos arts. 33 e 54, V, da Lei nº 8.906, de 04 de julho de 1994, aprova e edita este Código, exortando os advogados brasileiros à sua fiel observância.
                    </p>

                    <h3 className="font-bold text-gray-900 text-base mt-6">TÍTULO I — DA ÉTICA DO ADVOGADO</h3>
                    <h4 className="font-semibold text-gray-800">CAPÍTULO I — DAS REGRAS DEONTOLÓGICAS FUNDAMENTAIS</h4>

                    <p><strong>Art. 1º</strong> O exercício da advocacia exige conduta compatível com os preceitos deste Código, do Estatuto, do Regulamento Geral, dos Provimentos e com os demais princípios da moral individual, social e profissional.</p>
                    <p><strong>Art. 2º</strong> O advogado, indispensável à administração da Justiça, é defensor do Estado democrático de direito, da cidadania, da moralidade pública, da Justiça e da paz social, subordinando a atividade do seu Ministério Privado à elevada função pública que exerce.</p>
                    <p><strong>Parágrafo único.</strong> São deveres do advogado: I – preservar, em sua conduta, a honra, a nobreza e a dignidade da profissão; II – atuar com destemor, independência, honestidade, decoro, veracidade, lealdade, dignidade e boa-fé; III – velar por sua reputação pessoal e profissional; IV – empenhar-se, permanentemente, em seu aperfeiçoamento pessoal e profissional; V – contribuir para o aprimoramento das instituições, do Direito e das leis; VI – estimular a conciliação entre os litigantes; VII – aconselhar o cliente a não ingressar em aventura judicial; VIII – abster-se de utilizar influência indevida, patrocinar interesses ligados a outras atividades estranhas à advocacia, vincular seu nome a empreendimentos duvidosos ou emprestar concurso aos que atentem contra a ética; IX – pugnar pela solução dos problemas da cidadania.</p>
                    <p><strong>Art. 3º</strong> O advogado deve ter consciência de que o Direito é um meio de mitigar as desigualdades para o encontro de soluções justas e que a lei é um instrumento para garantir a igualdade de todos.</p>
                    <p><strong>Art. 4º</strong> O advogado vinculado ao cliente ou constituinte deve zelar pela sua liberdade e independência.</p>
                    <p><strong>Art. 5º</strong> O exercício da advocacia é incompatível com qualquer procedimento de mercantilização.</p>
                    <p><strong>Art. 6º</strong> É defeso ao advogado expor os fatos em Juízo falseando deliberadamente a verdade ou estribando-se na má-fé.</p>
                    <p><strong>Art. 7º</strong> É vedado o oferecimento de serviços profissionais que impliquem, direta ou indiretamente, inculcação ou captação de clientela.</p>

                    <h4 className="font-semibold text-gray-800 mt-4">CAPÍTULO II — DAS RELAÇÕES COM O CLIENTE</h4>
                    <p><strong>Art. 8º</strong> O advogado deve informar o cliente, de forma clara e inequívoca, quanto a eventuais riscos da sua pretensão, e das consequências que poderão advir da demanda.</p>
                    <p><strong>Art. 9º</strong> A conclusão ou desistência da causa obriga o advogado à devolução de bens, valores e documentos recebidos no exercício do mandato, e à pormenorizada prestação de contas.</p>
                    <p><strong>Art. 10.</strong> Concluída a causa ou arquivado o processo, presumem-se o cumprimento e a cessação do mandato.</p>
                    <p><strong>Art. 11.</strong> O advogado não deve aceitar procuração de quem já tenha patrono constituído, sem prévio conhecimento deste, salvo por motivo justo ou para adoção de medidas judiciais urgentes e inadiáveis.</p>
                    <p><strong>Art. 12.</strong> O advogado não deve deixar ao abandono ou ao desamparo os feitos, sem motivo justo e comprovada ciência do constituinte.</p>
                    <p><strong>Art. 13.</strong> A renúncia ao patrocínio implica omissão do motivo e a continuidade da responsabilidade profissional do advogado durante o prazo estabelecido em lei.</p>
                    <p><strong>Art. 14.</strong> A revogação do mandato judicial por vontade do cliente não o desobriga do pagamento das verbas honorárias contratadas.</p>
                    <p><strong>Art. 15.</strong> O mandato judicial ou extrajudicial deve ser outorgado individualmente aos advogados que integrem sociedade de que façam parte.</p>
                    <p><strong>Art. 16.</strong> O mandato judicial ou extrajudicial não se extingue pelo decurso de tempo, desde que permaneça a confiança recíproca entre o outorgante e o seu patrono.</p>
                    <p><strong>Art. 17.</strong> Os advogados integrantes da mesma sociedade profissional não podem representar em juízo clientes com interesses opostos.</p>
                    <p><strong>Art. 18.</strong> Sobrevindo conflitos de interesse entre seus constituintes, optará o advogado por um dos mandatos, renunciando aos demais, resguardado o sigilo profissional.</p>
                    <p><strong>Art. 19.</strong> O advogado, ao postular em nome de terceiros contra ex-cliente, deve resguardar o segredo profissional.</p>
                    <p><strong>Art. 20.</strong> O advogado deve abster-se de patrocinar causa contrária à ética, à moral ou à validade de ato jurídico em que tenha colaborado.</p>
                    <p><strong>Art. 21.</strong> É direito e dever do advogado assumir a defesa criminal, sem considerar sua própria opinião sobre a culpa do acusado.</p>
                    <p><strong>Art. 22.</strong> O advogado não é obrigado a aceitar a imposição de seu cliente que pretenda ver com ele atuando outros advogados.</p>
                    <p><strong>Art. 23.</strong> É defeso ao advogado funcionar no mesmo processo, simultaneamente, como patrono e preposto do empregador ou cliente.</p>
                    <p><strong>Art. 24.</strong> O substabelecimento do mandato, com reserva de poderes, é ato pessoal do advogado da causa. O substabelecido com reserva de poderes deve ajustar antecipadamente seus honorários.</p>

                    <h4 className="font-semibold text-gray-800 mt-4">CAPÍTULO III — DO SIGILO PROFISSIONAL</h4>
                    <p><strong>Art. 25.</strong> O sigilo profissional é inerente à profissão, impondo-se o seu respeito, salvo grave ameaça ao direito à vida, à honra, ou quando o advogado se veja afrontado pelo próprio cliente.</p>
                    <p><strong>Art. 26.</strong> O advogado deve guardar sigilo, mesmo em depoimento judicial, sobre o que saiba em razão de seu ofício.</p>
                    <p><strong>Art. 27.</strong> As confidências feitas ao advogado pelo cliente podem ser utilizadas nos limites da necessidade da defesa, desde que autorizado aquele pelo constituinte.</p>

                    <h4 className="font-semibold text-gray-800 mt-4">CAPÍTULO IV — DA PUBLICIDADE</h4>
                    <p><strong>Art. 28.</strong> O advogado pode anunciar os seus serviços profissionais, individual ou coletivamente, com discrição e moderação, para finalidade exclusivamente informativa, vedada a divulgação em conjunto com outra atividade.</p>
                    <p><strong>Art. 29.</strong> O anúncio deve mencionar o nome completo do advogado e o número da inscrição na OAB, vedada a veiculação pelo rádio e televisão e a denominação de fantasia.</p>
                    <p><strong>Art. 30.</strong> O anúncio sob a forma de placas deve observar discrição quanto ao conteúdo, forma e dimensões, sem qualquer aspecto mercantilista.</p>
                    <p><strong>Art. 31.</strong> O anúncio não deve conter fotografias, ilustrações, cores, figuras, desenhos, logotipos, marcas ou símbolos incompatíveis com a sobriedade da advocacia.</p>
                    <p><strong>Art. 32.</strong> O advogado que eventualmente participar de programa de televisão ou de rádio deve visar a objetivos exclusivamente ilustrativos, educacionais e instrutivos, sem propósito de promoção pessoal ou profissional.</p>
                    <p><strong>Art. 33.</strong> O advogado deve abster-se de: responder com habitualidade consultas nos meios de comunicação social com intuito de promover-se; debater causa sob seu patrocínio; divulgar lista de clientes e demandas; insinuar-se para reportagens e declarações públicas.</p>
                    <p><strong>Art. 34.</strong> A divulgação pública de assuntos técnicos deve limitar-se a aspectos que não quebrem ou violem o segredo profissional.</p>

                    <h4 className="font-semibold text-gray-800 mt-4">CAPÍTULO V — DOS HONORÁRIOS PROFISSIONAIS</h4>
                    <p><strong>Art. 35.</strong> Os honorários advocatícios e sua eventual correção devem ser previstos em contrato escrito, qualquer que seja o objeto e o meio da prestação do serviço profissional.</p>
                    <p><strong>Art. 36.</strong> Os honorários profissionais devem ser fixados com moderação, atendidos: a relevância, o vulto, a complexidade e a dificuldade das questões versadas; o trabalho e o tempo necessários; o valor da causa, a condição econômica do cliente e o proveito para ele resultante.</p>
                    <p><strong>Art. 37.</strong> Em face da imprevisibilidade do prazo de tramitação da demanda, devem ser delimitados os serviços profissionais a se prestarem nos procedimentos preliminares.</p>
                    <p><strong>Art. 38.</strong> Na hipótese da adoção de cláusula quota litis, os honorários devem ser necessariamente representados por pecúnia e não podem ser superiores às vantagens advindas em favor do constituinte.</p>
                    <p><strong>Art. 39.</strong> A celebração de convênios para prestação de serviços jurídicos com redução dos valores estabelecidos na Tabela de Honorários implica captação de clientes ou causa.</p>
                    <p><strong>Art. 40.</strong> Os honorários advocatícios devidos ou fixados em tabelas no regime da assistência judiciária não podem ser alterados no quantum estabelecido.</p>
                    <p><strong>Art. 41.</strong> O advogado deve evitar o aviltamento de valores dos serviços profissionais, não os fixando de forma irrisória ou inferior ao mínimo fixado pela Tabela de Honorários.</p>
                    <p><strong>Art. 42.</strong> O crédito por honorários advocatícios não autoriza o saque de duplicatas ou qualquer outro título de crédito de natureza mercantil.</p>
                    <p><strong>Art. 43.</strong> Havendo necessidade de arbitramento e cobrança judicial dos honorários, deve o advogado renunciar ao patrocínio da causa.</p>

                    <h4 className="font-semibold text-gray-800 mt-4">CAPÍTULO VI — DO DEVER DE URBANIDADE</h4>
                    <p><strong>Art. 44.</strong> Deve o advogado tratar o público, os colegas, as autoridades e os funcionários do Juízo com respeito, discrição e independência.</p>
                    <p><strong>Art. 45.</strong> Impõe-se ao advogado lhaneza, emprego de linguagem escorreita e polida, esmero e disciplina na execução dos serviços.</p>
                    <p><strong>Art. 46.</strong> O advogado, na condição de defensor nomeado, conveniado ou dativo, deve comportar-se com zelo.</p>

                    <h4 className="font-semibold text-gray-800 mt-4">CAPÍTULO VII — DAS DISPOSIÇÕES GERAIS</h4>
                    <p><strong>Art. 47.</strong> A falta ou inexistência, neste Código, de definição ou orientação sobre questão de ética profissional enseja consulta e manifestação do Tribunal de Ética e Disciplina.</p>
                    <p><strong>Art. 48.</strong> Sempre que tenha conhecimento de transgressão das normas deste Código, o Presidente do Conselho deve chamar a atenção do responsável para o dispositivo violado.</p>

                    <h3 className="font-bold text-gray-900 text-base mt-6">TÍTULO II — DO PROCESSO DISCIPLINAR</h3>
                    <h4 className="font-semibold text-gray-800">CAPÍTULO I — DA COMPETÊNCIA DO TRIBUNAL DE ÉTICA E DISCIPLINA</h4>
                    <p><strong>Art. 49.</strong> O Tribunal de Ética e Disciplina é competente para orientar e aconselhar sobre ética profissional, respondendo às consultas em tese, e julgar os processos disciplinares.</p>
                    <p><strong>Art. 50.</strong> Compete também ao Tribunal de Ética e Disciplina: instaurar, de ofício, processo competente; organizar cursos e seminários sobre ética profissional; expedir provisões sobre o modo de proceder; mediar e conciliar nas questões que envolvam dúvidas e pendências entre advogados.</p>

                    <h4 className="font-semibold text-gray-800 mt-4">CAPÍTULO II — DOS PROCEDIMENTOS</h4>
                    <p><strong>Art. 51.</strong> O processo disciplinar instaura-se de ofício ou mediante representação dos interessados, que não pode ser anônima.</p>
                    <p><strong>Art. 52.</strong> Compete ao relator do processo disciplinar determinar a notificação dos interessados para esclarecimentos, ou do representado para a defesa prévia, em qualquer caso no prazo de 15 (quinze) dias.</p>
                    <p><strong>Art. 53.</strong> O Presidente do Tribunal, após o recebimento do processo devidamente instruído, designa relator para proferir o voto.</p>
                    <p><strong>Art. 54.</strong> Ocorrendo medida cautelar, na sessão especial designada pelo Presidente do Tribunal, são facultadas ao representado a apresentação de defesa, a produção de prova e a sustentação oral.</p>
                    <p><strong>Art. 55.</strong> O expediente submetido à apreciação do Tribunal é autuado pela Secretaria, registrado em livro próprio e distribuído às Seções ou Turmas julgadoras.</p>
                    <p><strong>Art. 56.</strong> As consultas formuladas recebem autuação em apartado, e a esse processo são designados relator e revisor, pelo Presidente.</p>
                    <p><strong>Art. 57.</strong> Aplica-se ao funcionamento das sessões do Tribunal o procedimento adotado no Regimento Interno do Conselho Seccional.</p>
                    <p><strong>Art. 58.</strong> Comprovado que os interessados no processo nele tenham intervindo de modo temerário, tal fato caracteriza falta de ética passível de punição.</p>
                    <p><strong>Art. 59.</strong> Considerada a natureza da infração ética cometida, o Tribunal pode suspender temporariamente a aplicação das penas de advertência e censura impostas.</p>
                    <p><strong>Art. 60.</strong> Os recursos contra decisões do Tribunal de Ética e Disciplina ao Conselho Seccional regem-se pelas disposições do Estatuto e do Regulamento Geral.</p>
                    <p><strong>Art. 61.</strong> Cabe revisão do processo disciplinar, na forma prescrita no Estatuto.</p>

                    <h4 className="font-semibold text-gray-800 mt-4">CAPÍTULO III — DAS DISPOSIÇÕES GERAIS E TRANSITÓRIAS</h4>
                    <p><strong>Art. 62.</strong> O Conselho Seccional deve oferecer os meios e suporte imprescindíveis para o desenvolvimento das atividades do Tribunal.</p>
                    <p><strong>Art. 63.</strong> O Tribunal de Ética e Disciplina deve organizar seu Regimento Interno, a ser submetido ao Conselho Seccional e, após, ao Conselho Federal.</p>
                    <p><strong>Art. 64.</strong> A pauta de julgamentos do Tribunal é publicada em órgão oficial com antecedência de 07 (sete) dias.</p>
                    <p><strong>Art. 65.</strong> As regras deste Código obrigam igualmente as sociedades de advogados e os estagiários, no que lhes forem aplicáveis.</p>
                    <p><strong>Art. 66.</strong> Este Código entra em vigor, em todo o território nacional, na data de sua publicação.</p>

                    <p className="text-xs text-gray-500 mt-6 border-t pt-4">Brasília-DF, 13 de fevereiro de 1995. — José Roberto Batochio, Presidente. Modesto Carvalhosa, Relator.</p>
                </div>
                <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex justify-end">
                    <button type="button" onClick={onClose} className="px-6 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md shadow-sm hover:bg-primary-dark">
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
};
