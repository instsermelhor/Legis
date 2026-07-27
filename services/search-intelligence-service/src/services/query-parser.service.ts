import { Injectable } from '@nestjs/common';

export interface ParsedQuery {
  vectorQuery: string;
  sparseKeywords: string;
  graphPattern: string;
}

@Injectable()
export class QueryParserService {
  parseNaturalQuery(userPrompt: string): ParsedQuery {
    // NLP normalization and keyword extraction
    const normalized = userPrompt.toLowerCase().trim();
    return {
      vectorQuery: userPrompt, // For dense vector embedding in pgvector
      sparseKeywords: normalized, // For BM25 keyword search in OpenSearch
      graphPattern: `MATCH (c:Contract)-[:HAS_CLAUSE]->(cl:Clause)
                     WHERE cl.risk = "HIGH"
                     RETURN c, cl LIMIT 20`, // Neo4j GraphRAG pattern
    };
  }
}
