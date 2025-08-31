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
  ListAlertDefsRequest,
  ListAlertDefsWithFilterResponse,
  GetAlertEventResponse,
  AlertEventStatistics,
  RuleGroup,
  CreateRuleGroupRequest,
  GetAllRulesResponse,
  ExportRulesRequest,
  LegacyRuleGroup,
  LegacyRule,
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
   * List all alert definitions (simple)
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
   * List alert definitions with advanced filtering and pagination
   */
  async listAlertDefsWithFilter(request?: ListAlertDefsRequest): Promise<ListAlertDefsWithFilterResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      if (request?.queryFilter) {
        const filter = request.queryFilter;
        
        // Name filter
        if (filter.nameFilter) {
          filter.nameFilter.name.forEach(name => 
            queryParams.append('queryFilter.nameFilter.name', name)
          );
          queryParams.append('queryFilter.nameFilter.matcher', filter.nameFilter.matcher);
        }
        
        // Type filter
        if (filter.typeFilter) {
          filter.typeFilter.type.forEach(type => 
            queryParams.append('queryFilter.typeFilter.type', type)
          );
          queryParams.append('queryFilter.typeFilter.matcher', filter.typeFilter.matcher);
        }
        
        // Entity labels filter
        if (filter.entityLabelsFilter) {
          if (filter.entityLabelsFilter.entityLabels) {
            queryParams.append('queryFilter.entityLabelsFilter.entityLabels', filter.entityLabelsFilter.entityLabels);
          }
          queryParams.append('queryFilter.entityLabelsFilter.valuesOperator', filter.entityLabelsFilter.valuesOperator);
        }
        
        // Priority filter
        if (filter.priorityFilter) {
          filter.priorityFilter.priority.forEach(priority => 
            queryParams.append('queryFilter.priorityFilter.priority', priority)
          );
          queryParams.append('queryFilter.priorityFilter.matcher', filter.priorityFilter.matcher);
        }
        
        // Enabled filter
        if (filter.enabledFilter) {
          queryParams.append('queryFilter.enabledFilter.enabled', filter.enabledFilter.enabled.toString());
        }
        
        // Modified time range filter
        if (filter.modifiedTimeRangeFilter) {
          queryParams.append('queryFilter.modifiedTimeRangeFilter.modifiedAtRange.startTime', filter.modifiedTimeRangeFilter.modifiedAtRange.startTime);
          queryParams.append('queryFilter.modifiedTimeRangeFilter.modifiedAtRange.endTime', filter.modifiedTimeRangeFilter.modifiedAtRange.endTime);
        }
        
        // Last triggered time range filter
        if (filter.lastTriggeredTimeRangeFilter) {
          queryParams.append('queryFilter.lastTriggeredTimeRangeFilter.lastTriggeredAtRange.startTime', filter.lastTriggeredTimeRangeFilter.lastTriggeredAtRange.startTime);
          queryParams.append('queryFilter.lastTriggeredTimeRangeFilter.lastTriggeredAtRange.endTime', filter.lastTriggeredTimeRangeFilter.lastTriggeredAtRange.endTime);
        }
        
        // SLO filter
        if (filter.typeSpecificFilter?.sloFilter) {
          filter.typeSpecificFilter.sloFilter.sloId.forEach(sloId => 
            queryParams.append('queryFilter.typeSpecificFilter.sloFilter.sloId', sloId)
          );
          queryParams.append('queryFilter.typeSpecificFilter.sloFilter.matcher', filter.typeSpecificFilter.sloFilter.matcher);
        }
      }
      
      // Pagination
      if (request?.pagination) {
        if (request.pagination.pageSize) {
          queryParams.append('pagination.pageSize', request.pagination.pageSize.toString());
        }
        if (request.pagination.pageToken) {
          queryParams.append('pagination.pageToken', request.pagination.pageToken);
        }
      }

      const queryString = queryParams.toString();
      const url = `/mgmt/openapi/v3/alert-defs${queryString ? `?${queryString}` : ''}`;
      
      const response: AxiosResponse<ListAlertDefsWithFilterResponse> = await this.client.get(url);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to list alert definitions with filter');
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
   * Delete alert definition (proper v3 endpoint)
   */
  async deleteAlertDef(id: string): Promise<any> {
    try {
      const response = await this.client.delete(`/mgmt/openapi/v3/alert-defs/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to delete alert definition');
    }
  }

  /**
   * Enable/disable alert definition (proper v3 endpoint with query parameter)
   */
  async setAlertDefActive(id: string, active: boolean): Promise<any> {
    try {
      const response = await this.client.post(
        `/mgmt/openapi/v3/alert-defs/${id}:setActive?active=${active}`
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to set alert definition active state');
    }
  }

  /**
   * Download alerts in bulk
   */
  async downloadAlerts(): Promise<any> {
    try {
      const response = await this.client.get('/mgmt/openapi/v3/alert-defs:download');
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to download alerts');
    }
  }

  /**
   * Get alert definition by alert version ID
   */
  async getAlertDefByVersionId(versionId: string): Promise<GetAlertDefResponse> {
    try {
      const response: AxiosResponse<GetAlertDefResponse> = await this.client.get(
        `/mgmt/openapi/v3/alert-defs/by-version/${versionId}`
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to get alert definition by version ID');
    }
  }

  // ========== ALERT EVENTS API ==========

  /**
   * Get alert event by ID
   */
  async getAlertEvent(eventId: string): Promise<GetAlertEventResponse> {
    try {
      const response: AxiosResponse<GetAlertEventResponse> = await this.client.get(
        `/mgmt/openapi/v2/alert-events/${eventId}`
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to get alert event');
    }
  }

  /**
   * Get alert events statistics
   */
  async getAlertEventsStatistics(params?: {
    startTime?: string;
    endTime?: string;
    alertDefIds?: string[];
    priorities?: string[];
    status?: string[];
  }): Promise<AlertEventStatistics> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.startTime) queryParams.append('startTime', params.startTime);
      if (params?.endTime) queryParams.append('endTime', params.endTime);
      if (params?.alertDefIds) {
        params.alertDefIds.forEach(id => queryParams.append('alertDefIds', id));
      }
      if (params?.priorities) {
        params.priorities.forEach(priority => queryParams.append('priorities', priority));
      }
      if (params?.status) {
        params.status.forEach(s => queryParams.append('status', s));
      }

      const queryString = queryParams.toString();
      const url = `/mgmt/openapi/v2/alert-events/statistics${queryString ? `?${queryString}` : ''}`;
      
      const response: AxiosResponse<AlertEventStatistics> = await this.client.get(url);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to get alert events statistics');
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
    const response = await this.client.get('/mgmt/openapi/api/v2/events2metrics');
    return response.data;
  }

  async getEvents2Metrics(id: string): Promise<any> {
    const response = await this.client.get(`/mgmt/openapi/api/v2/events2metrics/${id}`);
    return response.data;
  }

  async getEvents2MetricsLimits(): Promise<any> {
    const response = await this.client.get('/mgmt/openapi/api/v2/events2metrics/limits');
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
    const url = `/mgmt/openapi/api/v2/events2metrics/labels_cardinality${queryString ? `?${queryString}` : ''}`;
    const response = await this.client.get(url);
    return response.data;
  }

  // ============================================================================
  // RULE GROUPS METHODS
  // ============================================================================

  async listRuleGroups(): Promise<any> {
    const response = await this.client.get('/mgmt/openapi/api/v1/rulegroups');
    return response.data;
  }

  async getRuleGroup(groupId: string): Promise<any> {
    const response = await this.client.get(`/mgmt/openapi/api/v1/rulegroups/${groupId}`);
    return response.data;
  }

  async createRuleGroup(ruleGroup: any): Promise<any> {
    try {
      const response = await this.client.post('/mgmt/openapi/api/v1/rulegroups', ruleGroup);
      return response.data;
    } catch (error: any) {
      // Enhance error message for rule group creation
      if (error.response?.status === 400) {
        const errorDetails = error.response.data?.message || error.response.data?.error || 'Invalid parameters';
        throw new Error(`Failed to create rule group: ${errorDetails}. Please check the rule group structure and required fields.`);
      }
      throw this.handleError(error, 'Failed to create rule group');
    }
  }

  async updateRuleGroup(groupId: string, ruleGroup: any): Promise<any> {
    const response = await this.client.put(`/mgmt/openapi/api/v1/rulegroups/${groupId}`, ruleGroup);
    return response.data;
  }

  async deleteRuleGroup(groupId: string): Promise<any> {
    const response = await this.client.delete(`/mgmt/openapi/api/v1/rulegroups/${groupId}`);
    return response.data;
  }

  async setRuleGroupActive(groupId: string, active: boolean): Promise<any> {
    // Get the current rule group first
    const currentRuleGroup = await this.getRuleGroup(groupId);
    
    // Update the enabled status
    const updatedRuleGroup = {
      ...currentRuleGroup.ruleGroup,
      enabled: active
    };
    
    // Update the rule group
    const response = await this.updateRuleGroup(groupId, updatedRuleGroup);
    return response;
  }

  async getRuleGroupLimits(): Promise<any> {
    const response = await this.client.post('/mgmt/openapi/api/v1/rulegroups/company-limits', {});
    return response.data;
  }

  // ============================================================================
  // ENRICHMENTS METHODS
  // ============================================================================

  async listEnrichments(): Promise<any> {
    const response = await this.client.get('/mgmt/openapi/enrichments');
    return response.data;
  }

  async getEnrichmentLimits(): Promise<any> {
    const response = await this.client.get('/mgmt/openapi/enrichments/limit');
    return response.data;
  }

  async getEnrichmentSettings(): Promise<any> {
    const response = await this.client.get('/mgmt/openapi/enrichments/settings');
    return response.data;
  }

  async listCustomEnrichments(): Promise<any> {
    const response = await this.client.get('/mgmt/openapi/v1/custom_enrichment');
    return response.data;
  }

  async getCustomEnrichment(id: number): Promise<any> {
    const response = await this.client.get(`/mgmt/openapi/v1/custom_enrichment/${id}`);
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

  // ============================================================================
  // PARSING RULES METHODS
  // ============================================================================

  /**
   * Create a new parsing rule group with rules
   */
  async createParsingRuleGroup(request: CreateRuleGroupRequest): Promise<RuleGroup> {
    try {
      const response: AxiosResponse<RuleGroup> = await this.client.post(
        '/api/v1/external/rule/rule-set',
        request
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to create parsing rule group');
    }
  }

  /**
   * Get all parsing rule groups
   */
  async getAllParsingRules(): Promise<GetAllRulesResponse> {
    try {
      const response: AxiosResponse<GetAllRulesResponse> = await this.client.get(
        '/api/v1/external/rules'
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to get all parsing rules');
    }
  }

  /**
   * Get a specific parsing rule group by ID
   */
  async getParsingRuleGroup(groupId: string): Promise<RuleGroup> {
    try {
      const response: AxiosResponse<RuleGroup> = await this.client.get(
        `/api/v1/external/rule/rule-set/${groupId}`
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to get parsing rule group');
    }
  }

  /**
   * Update a parsing rule group
   */
  async updateParsingRuleGroup(ruleGroup: RuleGroup): Promise<RuleGroup> {
    try {
      const response: AxiosResponse<RuleGroup> = await this.client.put(
        '/api/v1/external/rule/rule-set',
        ruleGroup
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to update parsing rule group');
    }
  }

  /**
   * Delete a parsing rule group
   */
  async deleteParsingRuleGroup(groupId: string): Promise<void> {
    try {
      await this.client.delete(`/api/v1/external/rule/rule-set/${groupId}`);
    } catch (error) {
      throw this.handleError(error, 'Failed to delete parsing rule group');
    }
  }

  /**
   * Delete a specific parsing rule
   */
  async deleteParsingRule(ruleId: string, groupId: string): Promise<void> {
    try {
      await this.client.delete(`/api/v1/external/rule/${ruleId}/group/${groupId}`);
    } catch (error) {
      throw this.handleError(error, 'Failed to delete parsing rule');
    }
  }

  /**
   * Export/import rules between teams
   */
  async exportRules(request: ExportRulesRequest): Promise<any> {
    try {
      const response = await this.client.post('/api/v1/external/rules/export', request);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to export rules');
    }
  }

  // Legacy API methods
  /**
   * Create a legacy rule group
   */
  async createLegacyRuleGroup(request: LegacyRuleGroup): Promise<LegacyRuleGroup> {
    try {
      const response: AxiosResponse<LegacyRuleGroup> = await this.client.post(
        '/api/v1/external/group',
        request
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to create legacy rule group');
    }
  }

  /**
   * Get legacy rule group
   */
  async getLegacyRuleGroup(groupId: string): Promise<LegacyRuleGroup> {
    try {
      const response: AxiosResponse<LegacyRuleGroup> = await this.client.get(
        `/api/v1/external/group/${groupId}`
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to get legacy rule group');
    }
  }

  /**
   * Update legacy rule group
   */
  async updateLegacyRuleGroup(groupId: string, request: LegacyRuleGroup): Promise<LegacyRuleGroup> {
    try {
      const response: AxiosResponse<LegacyRuleGroup> = await this.client.put(
        `/api/v1/external/group/${groupId}`,
        request
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to update legacy rule group');
    }
  }

  /**
   * Delete legacy rule group
   */
  async deleteLegacyRuleGroup(groupId: string): Promise<void> {
    try {
      await this.client.delete(`/api/v1/external/group/${groupId}`);
    } catch (error) {
      throw this.handleError(error, 'Failed to delete legacy rule group');
    }
  }

  /**
   * Create a legacy parsing rule
   */
  async createLegacyRule(groupId: string, request: LegacyRule): Promise<any> {
    try {
      const response = await this.client.post(`/api/v1/external/rule/${groupId}`, request);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to create legacy rule');
    }
  }

  /**
   * Get legacy parsing rule
   */
  async getLegacyRule(ruleId: string, groupId: string): Promise<any> {
    try {
      const response = await this.client.get(`/api/v1/external/rule/${ruleId}/group/${groupId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to get legacy rule');
    }
  }

  /**
   * Update legacy parsing rule
   */
  async updateLegacyRule(ruleId: string, groupId: string, request: Partial<LegacyRule>): Promise<any> {
    try {
      const response = await this.client.put(`/api/v1/external/rule/${ruleId}/group/${groupId}`, request);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to update legacy rule');
    }
  }

  /**
   * Delete legacy parsing rule
   */
  async deleteLegacyRule(ruleId: string, groupId: string): Promise<void> {
    try {
      await this.client.delete(`/api/v1/external/rule/${ruleId}/group/${groupId}`);
    } catch (error) {
      throw this.handleError(error, 'Failed to delete legacy rule');
    }
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