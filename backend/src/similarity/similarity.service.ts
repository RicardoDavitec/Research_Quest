import { Injectable } from '@nestjs/common';
import * as natural from 'natural';

export interface SimilarityResult {
  id: string;
  text: string;
  score: number;
}

@Injectable()
export class SimilarityService {
  private tfidf: natural.TfIdf;
  private tokenizer: natural.WordTokenizer;

  constructor() {
    this.tfidf = new natural.TfIdf();
    this.tokenizer = new natural.WordTokenizer();
  }

  /**
   * Adiciona documentos ao modelo TF-IDF
   * @param documents Array de objetos com id e texto
   */
  addDocuments(documents: { id: string; text: string }[]): void {
    this.tfidf = new natural.TfIdf();
    
    documents.forEach((doc) => {
      const normalizedText = this.normalizeText(doc.text);
      this.tfidf.addDocument(normalizedText);
    });
  }

  /**
   * Encontra documentos similares a um texto de consulta
   * @param query Texto de consulta
   * @param documents Array de documentos para buscar
   * @param threshold Limiar de similaridade (0 a 1)
   * @param limit Número máximo de resultados
   */
  findSimilar(
    query: string,
    documents: { id: string; text: string }[],
    threshold: number = 0.3,
    limit: number = 10,
  ): SimilarityResult[] {
    // Adicionar documentos ao modelo
    this.addDocuments(documents);

    const normalizedQuery = this.normalizeText(query);
    const scores: SimilarityResult[] = [];

    // Calcular similaridade de cosseno para cada documento
    documents.forEach((doc, index) => {
      const similarity = this.calculateCosineSimilarity(normalizedQuery, doc.text);
      
      if (similarity >= threshold) {
        scores.push({
          id: doc.id,
          text: doc.text,
          score: similarity,
        });
      }
    });

    // Ordenar por score decrescente e limitar resultados
    return scores
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * Calcula a similaridade de cosseno entre dois textos
   * @param text1 Primeiro texto
   * @param text2 Segundo texto
   */
  private calculateCosineSimilarity(text1: string, text2: string): number {
    const tokens1 = this.tokenizer.tokenize(text1.toLowerCase()) || [];
    const tokens2 = this.tokenizer.tokenize(text2.toLowerCase()) || [];

    // Criar vetores de frequência
    const allTokens = [...new Set([...tokens1, ...tokens2])];
    const vector1 = allTokens.map((token) => tokens1.filter((t) => t === token).length);
    const vector2 = allTokens.map((token) => tokens2.filter((t) => t === token).length);

    // Calcular produto escalar
    const dotProduct = vector1.reduce((sum, val, i) => sum + val * vector2[i], 0);

    // Calcular magnitudes
    const magnitude1 = Math.sqrt(vector1.reduce((sum, val) => sum + val * val, 0));
    const magnitude2 = Math.sqrt(vector2.reduce((sum, val) => sum + val * val, 0));

    // Evitar divisão por zero
    if (magnitude1 === 0 || magnitude2 === 0) {
      return 0;
    }

    return dotProduct / (magnitude1 * magnitude2);
  }

  /**
   * Normaliza o texto removendo pontuação e caracteres especiais
   * @param text Texto a ser normalizado
   */
  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^\w\s]/g, ' ') // Remove pontuação
      .replace(/\s+/g, ' ') // Remove espaços duplicados
      .trim();
  }

  /**
   * Extrai palavras-chave de um texto usando TF-IDF
   * @param text Texto para extração
   * @param topN Número de palavras-chave a retornar
   */
  extractKeywords(text: string, topN: number = 5): string[] {
    const normalizedText = this.normalizeText(text);
    this.tfidf = new natural.TfIdf();
    this.tfidf.addDocument(normalizedText);

    const terms: { term: string; score: number }[] = [];
    
    this.tfidf.listTerms(0).forEach((item: any) => {
      terms.push({ term: item.term, score: item.tfidf });
    });

    return terms
      .sort((a, b) => b.score - a.score)
      .slice(0, topN)
      .map((item) => item.term);
  }

  /**
   * Calcula a distância de Levenshtein entre dois textos
   * @param text1 Primeiro texto
   * @param text2 Segundo texto
   */
  calculateLevenshteinDistance(text1: string, text2: string): number {
    return natural.LevenshteinDistance(text1, text2);
  }

  /**
   * Calcula a similaridade de Jaro-Winkler entre dois textos
   * @param text1 Primeiro texto
   * @param text2 Segundo texto
   */
  calculateJaroWinklerDistance(text1: string, text2: string): number {
    return natural.JaroWinklerDistance(text1, text2, { ignoreCase: true });
  }
}
