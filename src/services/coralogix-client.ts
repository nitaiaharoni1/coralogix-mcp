/**
 * Coralogix API Client
 */

import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  QueryRequest,
  QueryResponse,
  QueryMetadata,
  SubmitBackgroundQueryRequest,
  SubmitBackgroundQueryResponse,
  GetBackgroundQueryStatusRequest,
  GetBackgroundQueryStatusResponse,
  GetBackgroundQueryDataRequest,
  GetBackgroundQueryDataResponse,
  CancelBackgroundQueryRequest,
  CancelBackgroundQueryResponse,
  DOMAIN_ENDPOINTS,
  AlertDef,
  CreateAlertDefRequest,
  CreateAlertDefResponse,
  GetAlertDefResponse,
  ListAlertDefsResponse,
  Dashboard,
  CreateDashboardRequest,
  CreateDashboardResponse,
  GetDashboardResponse,
  GetDashboardCatalogResponse
} from '../types/coralogix.js';

let coralogixClient: CoralogixClient | null = null;

/**
 * Coralogix API Client
 * Handles authentication and API requests to Coralogix services
 * 
 * Working APIs in EU2 region:
 * - Query APIs (DataPrime, Lucene, Background queries)
 * - Alert Definitions (/v3/alert-defs)
 * - Dashboard Catalog (/v1/dashboards/catalog)
 * - Target Management (/v2/target)
 */
export class CoralogixClient {
  private client: AxiosInstance;
  private baseUrl: string;
  private domain: string;

  constructor(apiKey: string, domain: string) {
    this.domain = domain;
    this.baseUrl = DOMAIN_ENDPOINTS[domain] || `https://api.${domain}`;

    // Create axios instance with default configuration
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30 second timeout
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          throw new Error('Authentication failed. Please check your API key and permissions.');
        }
        if (error.response?.status === 400) {
          throw new Error(`Bad request: ${error.response.data?.message || 'Invalid query or parameters'}`);
        }
        if (error.response?.status === 429) {
          throw new Error('Rate limit exceeded. Please wait before making more requests.');
        }
        throw error;
      }
    );
  }

  // ========== QUERY APIs ==========

  /**
   * Execute a DataPrime or Lucene query
   */
  async query(request: QueryRequest): Promise<QueryResponse[]> {
    try {
      const response: AxiosResponse<string> = await this.client.post(
        '/api/v1/dataprime/query',
        request,
        {
          // Expect text response since it's newline-delimited JSON
          responseType: 'text'
        }
      );
      
      // Parse newline-delimited JSON response
      const lines = response.data.trim().split('\n');
      const results: QueryResponse[] = [];
      
      for (const line of lines) {
        if (line.trim()) {
          try {
            const parsed = JSON.parse(line);
            results.push(parsed);
          } catch (parseError) {
            console.error('Failed to parse JSON line:', line, parseError);
          }
        }
      }
      
      return results;
    } catch (error) {
      throw this.handleError(error, 'Failed to execute query');
    }
  }

  /**
   * Submit a background query for long-running operations
   */
  async submitBackgroundQuery(request: SubmitBackgroundQueryRequest): Promise<SubmitBackgroundQueryResponse> {
    try {
      const response: AxiosResponse<SubmitBackgroundQueryResponse> = await this.client.post(
        '/api/v1/dataprime/background-query',
        request
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to submit background query');
    }
  }

  /**
   * Get the status of a background query
   */
  async getBackgroundQueryStatus(request: GetBackgroundQueryStatusRequest): Promise<GetBackgroundQueryStatusResponse> {
    try {
      const response: AxiosResponse<GetBackgroundQueryStatusResponse> = await this.client.post(
        '/api/v1/dataprime/background-query/status',
        request
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to get background query status');
    }
  }

  /**
   * Get the data from a completed background query
   */
  async getBackgroundQueryData(request: GetBackgroundQueryDataRequest): Promise<GetBackgroundQueryDataResponse> {
    try {
      const response: AxiosResponse<GetBackgroundQueryDataResponse> = await this.client.post(
        '/api/v1/dataprime/background-query/data',
        request
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to get background query data');
    }
  }

  /**
   * Cancel a running background query
   */
  async cancelBackgroundQuery(request: CancelBackgroundQueryRequest): Promise<CancelBackgroundQueryResponse> {
    try {
      const response: AxiosResponse<CancelBackgroundQueryResponse> = await this.client.post(
        '/api/v1/dataprime/background-query/cancel',
        request
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to cancel background query');
    }
  }

  // ========== ALERT DEFINITIONS API ==========

  /**
   * List all alert definitions
   */
  async listAlertDefs(): Promise<ListAlertDefsResponse> {
    try {
      const response: AxiosResponse<ListAlertDefsResponse> = await this.client.get(
        '/mgmt/openapi/v3/alert-defs'
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to list alert definitions');
    }
  }

  /**
   * Create a new alert definition
   */
  async createAlertDef(request: CreateAlertDefRequest): Promise<CreateAlertDefResponse> {
    try {
      const response: AxiosResponse<CreateAlertDefResponse> = await this.client.post(
        '/mgmt/openapi/v3/alert-defs',
        request
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to create alert definition');
    }
  }

  /**
   * Get alert definition by ID
   */
  async getAlertDef(id: string): Promise<GetAlertDefResponse> {
    try {
      const response: AxiosResponse<GetAlertDefResponse> = await this.client.get(
        `/mgmt/openapi/v3/alert-defs/${id}`
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to get alert definition');
    }
  }

  /**
   * Update alert definition
   */
  async updateAlertDef(request: { alertDefProperties: any; id: string }): Promise<GetAlertDefResponse> {
    try {
      const response: AxiosResponse<GetAlertDefResponse> = await this.client.put(
        '/mgmt/openapi/v3/alert-defs',
        request
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to update alert definition');
    }
  }

  /**
   * Delete alert definition
   */
  async deleteAlertDef(id: string): Promise<void> {
    try {
      await this.client.delete(`/mgmt/openapi/v3/alert-defs/${id}`);
    } catch (error) {
      throw this.handleError(error, 'Failed to delete alert definition');
    }
  }

  /**
   * Enable/disable alert definition
   */
  async setAlertDefActive(id: string, active: boolean): Promise<void> {
    try {
      await this.client.post(
        `/mgmt/openapi/v3/alert-defs/${id}:setActive?active=${active}`
      );
    } catch (error) {
      throw this.handleError(error, 'Failed to set alert definition active state');
    }
  }

  // ========== DASHBOARDS API ==========

  /**
   * Get dashboard catalog
   */
  async getDashboardCatalog(): Promise<GetDashboardCatalogResponse> {
    try {
      const response: AxiosResponse<GetDashboardCatalogResponse> = await this.client.get(
        '/mgmt/openapi/v1/dashboards/catalog'
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to get dashboard catalog');
    }
  }

  /**
   * Create a new dashboard
   */
  async createDashboard(request: CreateDashboardRequest): Promise<CreateDashboardResponse> {
    try {
      const response: AxiosResponse<CreateDashboardResponse> = await this.client.post(
        '/mgmt/openapi/v1/dashboards/dashboards',
        request
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to create dashboard');
    }
  }

  /**
   * Get dashboard by ID
   */
  async getDashboard(dashboardId: string): Promise<GetDashboardResponse> {
    try {
      const response: AxiosResponse<GetDashboardResponse> = await this.client.get(
        `/mgmt/openapi/v1/dashboards/dashboards/${dashboardId}`
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to get dashboard');
    }
  }

  /**
   * Update dashboard
   */
  async updateDashboard(request: CreateDashboardRequest): Promise<void> {
    try {
      await this.client.put('/mgmt/openapi/v1/dashboards/dashboards', request);
    } catch (error) {
      throw this.handleError(error, 'Failed to update dashboard');
    }
  }

  /**
   * Delete dashboard
   */
  async deleteDashboard(dashboardId: string, requestId: string): Promise<void> {
    try {
      await this.client.delete(
        `/mgmt/openapi/v1/dashboards/dashboards/${dashboardId}?requestId=${requestId}`
      );
    } catch (error) {
      throw this.handleError(error, 'Failed to delete dashboard');
    }
  }

  // ========== TARGETS API ==========

  /**
   * Get current target configuration
   */
  async getTarget(): Promise<any> {
    try {
      const response = await this.client.get('/mgmt/openapi/v2/target');
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to get target configuration');
    }
  }

  /**
   * Set target configuration
   */
  async setTarget(request: any): Promise<any> {
    try {
      const response = await this.client.post('/mgmt/openapi/v2/target', request);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to set target configuration');
    }
  }

  /**
   * Validate target configuration
   */
  async validateTarget(request: any): Promise<any> {
    try {
      const response = await this.client.post('/mgmt/openapi/v2/target:validate', request);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to validate target configuration');
    }
  }

  // ========== ERROR HANDLING ==========

  private handleError(error: any, context: string): Error {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || error.response.statusText;
      
      if (status === 404) {
        return new Error(`${context}: API endpoint not found (HTTP 404). This endpoint may not be available in your region.`);
      }
      
      return new Error(`${context}: ${message} (HTTP ${status})`);
    }
    
    if (error.request) {
      return new Error(`${context}: No response received from server`);
    }
    
    return new Error(`${context}: ${error.message}`);
  }

  // ============================================================================
  // EVENTS2METRICS METHODS
  // ============================================================================

  async listEvents2Metrics(): Promise<any> {
    const response = await this.client.get('/api/v2/events2metrics');
    return response.data;
  }

  async getEvents2Metrics(id: string): Promise<any> {
    const response = await this.client.get(`/api/v2/events2metrics/${id}`);
    return response.data;
  }

  async getEvents2MetricsLimits(): Promise<any> {
    const response = await this.client.get('/api/v2/events2metrics/limits');
    return response.data;
  }

  async getEvents2MetricsCardinality(spansQuery?: any, logsQuery?: any): Promise<any> {
    const params = new URLSearchParams();
    
    if (spansQuery) {
      if (spansQuery.lucene) params.append('spansQuery.lucene', spansQuery.lucene);
      if (spansQuery.applicationnameFilters) {
        spansQuery.applicationnameFilters.forEach((filter: string) => 
          params.append('spansQuery.applicationnameFilters', filter)
        );
      }
      if (spansQuery.subsystemnameFilters) {
        spansQuery.subsystemnameFilters.forEach((filter: string) => 
          params.append('spansQuery.subsystemnameFilters', filter)
        );
      }
      if (spansQuery.actionFilters) {
        spansQuery.actionFilters.forEach((filter: string) => 
          params.append('spansQuery.actionFilters', filter)
        );
      }
      if (spansQuery.serviceFilters) {
        spansQuery.serviceFilters.forEach((filter: string) => 
          params.append('spansQuery.serviceFilters', filter)
        );
      }
    }

    if (logsQuery) {
      if (logsQuery.lucene) params.append('logsQuery.lucene', logsQuery.lucene);
      if (logsQuery.applicationnameFilters) {
        logsQuery.applicationnameFilters.forEach((filter: string) => 
          params.append('logsQuery.applicationnameFilters', filter)
        );
      }
      if (logsQuery.subsystemnameFilters) {
        logsQuery.subsystemnameFilters.forEach((filter: string) => 
          params.append('logsQuery.subsystemnameFilters', filter)
        );
      }
      if (logsQuery.severityFilters) {
        logsQuery.severityFilters.forEach((filter: string) => 
          params.append('logsQuery.severityFilters', filter)
        );
      }
    }

    const queryString = params.toString();
    const url = `/api/v2/events2metrics/labels_cardinality${queryString ? `?${queryString}` : ''}`;
    const response = await this.client.get(url);
    return response.data;
  }

  // ============================================================================
  // RULE GROUPS METHODS
  // ============================================================================

  async listRuleGroups(): Promise<any> {
    const response = await this.client.get('/api/v1/rulegroups');
    return response.data;
  }

  async getRuleGroup(groupId: string): Promise<any> {
    const response = await this.client.get(`/api/v1/rulegroups/${groupId}`);
    return response.data;
  }

  async getRuleGroupLimits(): Promise<any> {
    const response = await this.client.post('/api/v1/rulegroups/company-limits', {});
    return response.data;
  }

  // ============================================================================
  // ENRICHMENTS METHODS
  // ============================================================================

  async listEnrichments(): Promise<any> {
    const response = await this.client.get('/enrichments');
    return response.data;
  }

  async getEnrichmentLimits(): Promise<any> {
    const response = await this.client.get('/enrichments/limit');
    return response.data;
  }

  async getEnrichmentSettings(): Promise<any> {
    const response = await this.client.get('/enrichments/settings');
    return response.data;
  }

  async listCustomEnrichments(): Promise<any> {
    const response = await this.client.get('/v1/custom_enrichment');
    return response.data;
  }

  async getCustomEnrichment(id: number): Promise<any> {
    const response = await this.client.get(`/v1/custom_enrichment/${id}`);
    return response.data;
  }

  async createCustomEnrichment(name: string, description: string, file: object, lookupKey: string, outputFields: string[]): Promise<any> {
    const request = {
      name,
      description,
      file,
      lookupKey,
      outputFields
    };
    const response = await this.client.post('/mgmt/openapi/v1/custom_enrichment', request);
    return response.data;
  }

  async updateCustomEnrichment(enrichmentId: string, enrichment: object): Promise<any> {
    const response = await this.client.put(`/mgmt/openapi/v1/custom_enrichment/${enrichmentId}`, enrichment);
    return response.data;
  }

  async deleteCustomEnrichment(enrichmentId: string): Promise<any> {
    const response = await this.client.delete(`/mgmt/openapi/v1/custom_enrichment/${enrichmentId}`);
    return response.data;
  }
}

export function getCoralogixClient(): CoralogixClient {
  const apiKey = process.env.CORALOGIX_API_KEY;
  const domain = process.env.CORALOGIX_DOMAIN;

  if (!apiKey || !domain) {
    throw new Error('CORALOGIX_API_KEY and CORALOGIX_DOMAIN environment variables are required');
  }

  if (!coralogixClient) {
    coralogixClient = new CoralogixClient(apiKey, domain);
  }

  return coralogixClient;
} 