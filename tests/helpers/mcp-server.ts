/**
 * MCP Server Test Helper
 * Provides utilities for testing the MCP server with JSON-RPC communication
 */

import { spawn, ChildProcess } from 'child_process';
import { EventEmitter } from 'events';

export interface MCPRequest {
  jsonrpc: '2.0';
  id: number | string;
  method: string;
  params?: any;
}

export interface MCPResponse {
  jsonrpc: '2.0';
  id: number | string;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

export class MCPServerTestHelper extends EventEmitter {
  private server: ChildProcess | null = null;
  private requestId = 1;
  private pendingRequests = new Map<number | string, {
    resolve: (response: MCPResponse) => void;
    reject: (error: Error) => void;
    timeout: NodeJS.Timeout;
  }>();
  private isStarted = false;
  private instanceId: string;

  constructor(private serverPath: string = 'dist/server.js') {
    super();
    // Create unique instance ID for parallel test execution
    this.instanceId = `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Start the MCP server
   */
  async start(): Promise<void> {
    if (this.isStarted) {
      return;
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Server startup timeout'));
      }, 10000);

      this.server = spawn('node', [this.serverPath], {
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { 
          ...process.env,
          TEST_INSTANCE_ID: this.instanceId,
          // Add required Coralogix environment variables for testing
          CORALOGIX_API_KEY: process.env.CORALOGIX_API_KEY || 'test-api-key',
          CORALOGIX_DOMAIN: process.env.CORALOGIX_DOMAIN || 'coralogix.com',
          // Add some randomization to avoid conflicts
          PORT: String(3000 + Math.floor(Math.random() * 1000))
        }
      });

      if (!this.server.stdout || !this.server.stdin || !this.server.stderr) {
        clearTimeout(timeout);
        reject(new Error('Failed to create server process streams'));
        return;
      }

      // Handle server output
      this.server.stdout.on('data', (data) => {
        const lines = data.toString().split('\n').filter((line: string) => line.trim());
        
        lines.forEach((line: string) => {
          try {
            const response: MCPResponse = JSON.parse(line);
            this.handleResponse(response);
          } catch (e) {
            // Ignore non-JSON lines (server logs)
          }
        });
      });

      // Handle server errors
      this.server.stderr.on('data', (data) => {
        const errorMsg = data.toString();
        if (errorMsg.includes('INFO: Coralogix MCP Server started successfully')) {
          clearTimeout(timeout);
          this.isStarted = true;
          resolve();
        } else if (errorMsg.includes('ERROR:') && !errorMsg.includes('INFO:')) {
          clearTimeout(timeout);
          reject(new Error(`Server startup error: ${errorMsg}`));
        }
      });

      this.server.on('close', (code) => {
        this.isStarted = false;
        this.emit('close', code);
      });

      this.server.on('error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });
    });
  }

  /**
   * Stop the MCP server
   */
  async stop(): Promise<void> {
    if (!this.server || !this.isStarted) {
      return;
    }

    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        if (this.server) {
          this.server.kill('SIGKILL');
        }
        resolve();
      }, 5000);

      this.server!.on('close', () => {
        clearTimeout(timeout);
        this.isStarted = false;
        resolve();
      });
      
      this.server!.kill('SIGTERM');
    });
  }

  /**
   * Send a request to the MCP server with timeout
   */
  async sendRequest(method: string, params?: any, timeoutMs: number = 15000): Promise<MCPResponse> {
    if (!this.server || !this.server.stdin || !this.isStarted) {
      throw new Error('Server not started');
    }

    const id = this.requestId++;
    const request: MCPRequest = {
      jsonrpc: '2.0',
      id,
      method,
      params
    };

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(id);
        reject(new Error(`Request timeout (${timeoutMs}ms) for method: ${method}`));
      }, timeoutMs);

      this.pendingRequests.set(id, { resolve, reject, timeout });
      
      try {
        this.server!.stdin!.write(JSON.stringify(request) + '\n');
      } catch (error) {
        clearTimeout(timeout);
        this.pendingRequests.delete(id);
        reject(new Error(`Failed to send request: ${error}`));
      }
    });
  }

  /**
   * Handle response from server
   */
  private handleResponse(response: MCPResponse): void {
    const pending = this.pendingRequests.get(response.id);
    if (pending) {
      clearTimeout(pending.timeout);
      this.pendingRequests.delete(response.id);
      pending.resolve(response);
    }
  }

  /**
   * List available tools
   */
  async listTools(): Promise<any[]> {
    const response = await this.sendRequest('tools/list', undefined, 5000);
    if (response.error) {
      throw new Error(`Failed to list tools: ${response.error.message}`);
    }
    return response.result?.tools || [];
  }

  /**
   * Call a tool with timeout
   */
  async callTool(name: string, arguments_: any, timeoutMs: number = 20000): Promise<any> {
    const response = await this.sendRequest('tools/call', {
      name,
      arguments: arguments_
    }, timeoutMs);
    
    if (response.error) {
      throw new Error(`Tool call failed: ${response.error.message}`);
    }
    
    return response.result;
  }

  /**
   * Check if server is running
   */
  isRunning(): boolean {
    return this.isStarted && this.server !== null && !this.server.killed;
  }
} 