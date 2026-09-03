/**
 * W3C Web Machine Learning CG - WebMCP (Web Model Context Protocol) Polyfill
 * Standard Spec Reference: document.modelContext (Canonical W3C 2026)
 * Supports Google Chrome Canary (#enable-webmcp-testing), ChatGPT in-app browser,
 * and Chrome extensions (e.g. Model Context Tool Inspector, WebMCP Extension ID: jigokfbbpcdckjmhbgapmikncfihboec).
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

export interface ModelContextTestingInterface {
  listTools: () => WebMCPToolDefinition[];
  executeTool: (name: string, input?: any) => Promise<any>;
}

declare global {
  interface Document {
    modelContext?: ModelContextInterface;
  }
  interface Navigator {
    modelContext?: ModelContextInterface;
    modelContextTesting?: ModelContextTestingInterface;
  }
  interface Window {
    modelContext?: ModelContextInterface;
    modelContextTesting?: ModelContextTestingInterface;
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
      // Cross-frame / Extension postMessage bridge
      window.addEventListener('message', async (event) => {
        if (!event.data) return;

        // Chrome extension or ChatGPT iframe handshake
        if (event.data.type === 'WEBMCP_DISCOVER_TOOLS' || event.data.type === 'MCP_LIST_TOOLS') {
          const list = this.getTools().map(t => ({
            name: t.name,
            description: t.description,
            inputSchema: t.inputSchema
          }));
          window.postMessage({ type: 'WEBMCP_DISCOVER_RESPONSE', tools: list }, '*');
        }

        if (event.data.type === 'WEBMCP_INVOKE_TOOL' || event.data.type === 'MCP_EXECUTE_TOOL') {
          const { id, toolName, name, input, params } = event.data;
          const targetName = toolName || name;
          const targetInput = input || params || {};
          try {
            const result = await this.executeTool(targetName, targetInput);
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

    // Standard DOM CustomEvent for extensions and debuggers
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('webmcp:tool-registered', {
          detail: {
            toolName: tool.name,
            description: tool.description,
            inputSchema: tool.inputSchema
          }
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
 * Initializes document.modelContext, navigator.modelContext, and modelContextTesting
 */
export function initializeWebMCP(): ModelContextInterface {
  if (typeof document === 'undefined') {
    return new WebMCPContextImpl();
  }

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

  // Testing harness expected by Chrome Canary and WebMCP extension
  const testingHarness: ModelContextTestingInterface = {
    listTools: () => instance.getTools(),
    executeTool: (name: string, input?: any) => instance.executeTool(name, input)
  };

  if (typeof navigator !== 'undefined') {
    navigator.modelContextTesting = testingHarness;
  }
  if (typeof window !== 'undefined') {
    window.modelContextTesting = testingHarness;
  }

  return instance;
}
