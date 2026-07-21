/**
 * Módulo IA — classificação de documentos, análise de caso e chat assistido
 * (diagrama: "classifica documento via IA" / Bot Legis).
 */
import { analyzeCaseWithGemini, chatWithGemini, findPlacesWithMaps } from '../../geminiService';
import { classificarDocumento } from '../documentos';

export const iaService = {
  analisarCaso: analyzeCaseWithGemini,
  chat: chatWithGemini,
  buscarLocais: findPlacesWithMaps,
  classificarDocumento,
};
