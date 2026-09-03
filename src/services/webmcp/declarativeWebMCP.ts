/**
 * W3C Web Machine Learning CG - Declarative WebMCP API Handler
 * Scans DOM for HTML forms with `toolname`, `tooldescription`, and `toolautosubmit` attributes,
 * exposing them as callable WebMCP tools on document.modelContext without manual JS code.
 */

import { initializeWebMCP } from './webmcpPolyfill';
import { WebMCPToolDefinition } from '../../types';

export class DeclarativeWebMCPManager {
  private static instance: DeclarativeWebMCPManager;
  private observer: MutationObserver | null = null;
  private registeredFormTools = new Map<string, { unregister: () => void }>();

  private constructor() {
    this.initObserver();
  }

  public static getInstance(): DeclarativeWebMCPManager {
    if (!DeclarativeWebMCPManager.instance) {
      DeclarativeWebMCPManager.instance = new DeclarativeWebMCPManager();
    }
    return DeclarativeWebMCPManager.instance;
  }

  public scanAndRegisterForms() {
    if (typeof document === 'undefined') return;

    const forms = document.querySelectorAll<HTMLFormElement>('form[toolname]');
    const modelContext = initializeWebMCP();

    forms.forEach((form) => {
      const toolName = form.getAttribute('toolname');
      const toolDesc = form.getAttribute('tooldescription') || `Declarative form tool for ${toolName}`;
      if (!toolName) return;

      // Avoid duplicate registration
      if (this.registeredFormTools.has(toolName)) return;

      // Infer JSON Schema from form inputs
      const properties: Record<string, any> = {};
      const required: string[] = [];

      const inputs = form.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('input, select, textarea');
      inputs.forEach((input) => {
        const name = input.name || input.id;
        if (!name) return;

        let type = 'string';
        if (input instanceof HTMLInputElement) {
          if (input.type === 'number' || input.type === 'range') type = 'number';
          else if (input.type === 'checkbox') type = 'boolean';
        }

        const placeholder = 'placeholder' in input ? (input as HTMLInputElement).placeholder : '';
        properties[name] = {
          type,
          description: input.getAttribute('aria-label') || placeholder || name
        };

        if (input.required) {
          required.push(name);
        }
      });

      const toolDef: WebMCPToolDefinition = {
        name: toolName,
        description: toolDesc,
        inputSchema: {
          type: 'object',
          properties,
          required: required.length > 0 ? required : undefined
        },
        execute: async (inputParams: Record<string, any>) => {
          // Fill form values
          for (const [key, val] of Object.entries(inputParams)) {
            const input = form.querySelector<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(`[name="${key}"], #${key}`);
            if (input) {
              if (input instanceof HTMLInputElement && input.type === 'checkbox') {
                input.checked = Boolean(val);
              } else {
                input.value = String(val);
              }
              input.dispatchEvent(new Event('input', { bubbles: true }));
              input.dispatchEvent(new Event('change', { bubbles: true }));
            }
          }

          // Trigger submit if requested
          if (form.getAttribute('toolautosubmit') === 'true') {
            form.requestSubmit();
          }

          return {
            content: [
              { type: 'text', text: `Declarative WebMCP tool "${toolName}" executed on HTML form.` }
            ],
            structuredContent: { toolName, submittedParams: inputParams }
          };
        }
      };

      const handle = modelContext.registerTool(toolDef);
      this.registeredFormTools.set(toolName, handle);
    });
  }

  private initObserver() {
    if (typeof document === 'undefined') return;
    this.scanAndRegisterForms();

    this.observer = new MutationObserver(() => {
      this.scanAndRegisterForms();
    });

    if (document.body) {
      this.observer.observe(document.body, { childList: true, subtree: true });
    }
  }
}

export const declarativeWebMCP = DeclarativeWebMCPManager.getInstance();
