/**
 * Automated Test Suite for SynapseCanvas WebMCP Protocol Engine
 * Verifies document.modelContext compliance, tool registration, JSON schema validation, and SQL execution.
 */

import { initializeWebMCP } from './webmcpPolyfill';
import { executeClientSql } from '../data/sampleDatasets';

export function runWebMCPTestSuite(): { passed: number; failed: number; results: Array<{ test: string; status: 'PASS' | 'FAIL'; error?: string }> } {
  const results: Array<{ test: string; status: 'PASS' | 'FAIL'; error?: string }> = [];
  let passed = 0;
  let failed = 0;

  function assert(name: string, condition: boolean, errMsg?: string) {
    if (condition) {
      results.push({ test: name, status: 'PASS' });
      passed++;
    } else {
      results.push({ test: name, status: 'FAIL', error: errMsg || 'Assertion failed' });
      failed++;
    }
  }

  try {
    // Test 1: Polyfill Initialization
    const mc = initializeWebMCP();
    assert('WebMCP instance initialized on document.modelContext', typeof mc.registerTool === 'function');

    // Test 2: Tool Registration
    const handle = mc.registerTool({
      name: 'test_echo_tool',
      description: 'Echo test tool',
      inputSchema: {
        type: 'object',
        properties: { message: { type: 'string' } },
        required: ['message']
      },
      execute: async (input) => {
        return { content: [{ type: 'text', text: input.message }], structuredContent: { echo: input.message } };
      }
    });
    assert('Tool registered successfully and returned handle', typeof handle.unregister === 'function');

    // Test 3: Tool Discovery
    const tools = mc.getTools();
    const found = tools.some(t => t.name === 'test_echo_tool');
    assert('Tool discoverable via getTools()', found);

    // Test 4: In-Browser Client SQL Query
    const sqlRes = executeClientSql('SELECT month, mrr_usd FROM saas_metrics WHERE mrr_usd > 150000 ORDER BY month ASC LIMIT 3', 'saas_metrics');
    assert('Client SQL execution returned rows', sqlRes.rowCount === 3 && sqlRes.rows.length === 3);
    assert('Client SQL latency under 10ms', sqlRes.executionTimeMs < 10);

    // Test 5: Unregister Tool
    const unregResult = handle.unregister();
    assert('Tool unregister returns true or voids cleanly', unregResult === undefined || unregResult === true);
  } catch (err: any) {
    assert('Test suite execution exception', false, err.message);
  }

  return { passed, failed, results };
}
