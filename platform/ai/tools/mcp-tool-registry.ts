/**
 * Legis Connect — Model Context Protocol (MCP) Tool Registry
 * Registro estandardizado de ferramentas executáveis por Agentes Autônomos
 * Padrão: AI Tool Integration Framework (Prompt 231 - Etapa 17)
 */

export interface AgentContext {
  agentId: string;
  tenantId: string;
  userId: string;
  roles: string[];
}

export interface MCPToolDefinition {
  name: string;
  description: string;
  parametersSchema: object;
  execute: (params: any, context: AgentContext) => Promise<any>;
}

export class MCPToolRegistry {
  private tools = new Map<string, MCPToolDefinition>();

  constructor() {
    this.registerDefaultTools();
  }

  registerTool(tool: MCPToolDefinition) {
    this.tools.set(tool.name, tool);
    console.log(`[MCP REGISTRY] Ferramenta '${tool.name}' registrada com sucesso.`);
  }

  async executeTool(name: string, params: any, context: AgentContext): Promise<any> {
    const tool = this.tools.get(name);
    if (!tool) {
      throw new Error(`CRITICAL: Ferramenta MCP '${name}' não foi encontrada no catálogo.`);
    }

    this.validatePermissions(context, name);
    console.log(`[MCP EXECUTE] Agent ${context.agentId} executando ${name}...`);
    return await tool.execute(params, context);
  }

  private validatePermissions(context: AgentContext, toolName: string) {
    if (!context.tenantId) {
      throw new Error('[MCP SECURITY] Contexto de tenant ausente para execução de ferramenta.');
    }
  }

  private registerDefaultTools() {
    this.registerTool({
      name: 'search_jurisprudence',
      description: 'Busca jurisprudência e acórdãos no DataJud / Grafo de Conhecimento Jurídico',
      parametersSchema: { type: 'object', properties: { query: { type: 'string' } } },
      execute: async (params, ctx) => ({ results: [`Acórdão STF sobre ${params.query}`], count: 1 }),
    });

    this.registerTool({
      name: 'fetch_case_details',
      description: 'Busca detalhes de um processo judicial por número do CNJ',
      parametersSchema: { type: 'object', properties: { cnjNumber: { type: 'string' } } },
      execute: async (params, ctx) => ({ cnjNumber: params.cnjNumber, status: 'EM_ANDAMENTO', tribunal: 'TJSP' }),
    });
  }
}
