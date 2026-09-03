/**
 * W3C Web Machine Learning CG - WebMCP (Web Model Context Protocol) Polyfill
 * Standard Spec Reference: document.modelContext (Canonical W3C 2026) / navigator.modelContext (Legacy Alias)
 */

import { WebMCPToolDefinition } from '../../types';

export interface ModelContextInterface {
  registerTool: (tool: WebMCPToolDefinition) => { unregister: () => void };
  unregisterTool: (name: string) => boolean;
  getTools: () => WebMCPToolDefinition[];
  executeTool: (name: string, input?: any) => Promise<any>;
  provideContext?: (context: any) => void;
  isNative: boolean;
}

declare global {
  interface Document {
    modelContext?: ModelContextInterface;
  }
  interface Navigator {
    modelContext?: ModelContextInterface;
  }
  interface Window {
    modelContext?: ModelContextInterface;
  }
}

class WebMCPContextImpl implements ModelContextInterface {
  private tools = new Map<string, WebMCPToolDefinition>();
  public isNative = false;

  constructor() {
    this.initEventListeners();
  }

  private initEventListeners() {
    if (typeof window !== 'undefined') {
      window.addEventListener('message', async (event) => {
        // Support cross-frame / extension JSON-RPC or postMessage MCP invocations
        if (event.data && event.data.type === 'WEBMCP_INVOKE_TOOL') {
          const { id, toolName, input } = event.data;
          try {
            const result = await this.executeTool(toolName, input);
            window.postMessage({ type: 'WEBMCP_INVOKE_RESPONSE', id, result, success: true }, '*');
          } catch (err: any) {
            window.postMessage({ type: 'WEBMCP_INVOKE_RESPONSE', id, error: err.message, success: false }, '*');
          }
        }
      });
    }
  }

  public registerTool(tool: WebMCPToolDefinition) {
    if (!tool.name || typeof tool.name !== 'string') {
      throw new Error('WebMCP Error: tool.name must be a non-empty string');
    }
    if (!tool.execute || typeof tool.execute !== 'function') {
      throw new Error(`WebMCP Error: tool "${tool.name}" must provide an execute handler`);
    }

    this.tools.set(tool.name, tool);

    // Dispatch standard event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('webmcp:tool-registered', {
          detail: { toolName: tool.name, description: tool.description, inputSchema: tool.inputSchema }
        })
      );
    }

    return {
      unregister: () => this.unregisterTool(tool.name)
    };
  }

  public unregisterTool(name: string): boolean {
    const existed = this.tools.delete(name);
    if (existed && typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('webmcp:tool-unregistered', {
          detail: { toolName: name }
        })
      );
    }
    return existed;
  }

  public getTools(): WebMCPToolDefinition[] {
    return Array.from(this.tools.values());
  }

  public async executeTool(name: string, input: any = {}): Promise<any> {
    const tool = this.tools.get(name);
    if (!tool) {
      throw new Error(`WebMCP Error: Tool "${name}" is not registered on document.modelContext`);
    }

    const startTime = performance.now();
    try {
      const result = await tool.execute(input);
      const durationMs = Math.round((performance.now() - startTime) * 10) / 10;

      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('webmcp:tool-executed', {
            detail: {
              toolName: name,
              input,
              result,
              durationMs,
              status: 'success'
            }
          })
        );
      }
      return result;
    } catch (err: any) {
      const durationMs = Math.round((performance.now() - startTime) * 10) / 10;
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('webmcp:tool-executed', {
            detail: {
              toolName: name,
              input,
              error: err.message || String(err),
              durationMs,
              status: 'error'
            }
          })
        );
      }
      throw err;
    }
  }

  public provideContext(context: any) {
    if (context && Array.isArray(context.tools)) {
      for (const tool of context.tools) {
        this.registerTool(tool);
      }
    }
  }
}

/**
 * Ensures document.modelContext and navigator.modelContext exist and conform to W3C WebMCP
 */
export function initializeWebMCP(): ModelContextInterface {
  if (typeof document === 'undefined') {
    return new WebMCPContextImpl();
  }

  // Check if browser has native implementation
  let instance: ModelContextInterface;
  if (document.modelContext && typeof document.modelContext.registerTool === 'function') {
    instance = document.modelContext;
    instance.isNative = true;
  } else if (navigator.modelContext && typeof navigator.modelContext.registerTool === 'function') {
    instance = navigator.modelContext;
    instance.isNative = true;
    document.modelContext = instance;
  } else {
    instance = new WebMCPContextImpl();
    document.modelContext = instance;
    navigator.modelContext = instance;
    window.modelContext = instance;
  }

  return instance;
}
