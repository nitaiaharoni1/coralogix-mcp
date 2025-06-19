/**
 * Coralogix API Client
 */

import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  QueryRequest,
  QueryResponse,
  SubmitBackgroundQueryRequest,
  SubmitBackgroundQueryResponse,
  GetBackgroundQueryStatusRequest,
  GetBackgroundQueryStatusResponse,
  GetBackgroundQueryDataRequest,
  GetBackgroundQueryDataResponse,
  CancelBackgroundQueryRequest,
  CancelBackgroundQueryResponse,
  DataUsageRequest,
  DataUsageResponse,
  QuotaInfo,
  DOMAIN_ENDPOINTS,
  CreateAlertDefRequest,
  CreateAlertDefResponse,
  GetAlertDefResponse,
  ListAlertDefsResponse,
  CreateDashboardRequest,
  CreateDashboardResponse,
  GetDashboardResponse,
  GetDashboardCatalogResponse,
  ListIncidentsRequest,
  ListIncidentsResponse,
  GetIncidentResponse,
  AcknowledgeIncidentsRequest,
  AcknowledgeIncidentsResponse,
  CreatePolicyRequest,
  CreatePolicyResponse,
  GetPolicyResponse,
  ListPoliciesResponse,
  CreateSloRequest,
  CreateSloResponse,
  GetSloResponse,
  ListSlosResponse,
  SourceType,
} from '../types/coralogix.js';

export class CoralogixClient {
  private client: AxiosInstance;
  private baseUrl: string;

  constructor(apiKey: string, domain: string) {
    this.baseUrl = DOMAIN_ENDPOINTS[domain];
    if (!this.baseUrl) {
      throw new Error(`Unsupported Coralogix domain: ${domain}. Supported domains: ${Object.keys(DOMAIN_ENDPOINTS).join(', ')}`);
    }

    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30 seconds timeout
    });

    // Add response interceptor to handle NDJSON responses
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        // Handle NDJSON responses for query endpoints
        if (response.headers['content-type']?.includes('application/x-ndjson') || 
            typeof response.data === 'string' && response.data.includes('\n{')) {
          const lines = response.data.split('\n').filter((line: string) => line.trim());
          const parsedLines = lines.map((line: string) => JSON.parse(line));
          response.data = parsedLines;
        }
        return response;
      },
      (error: any) => {
        if (error.response?.status === 403) {
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

  /**
   * Execute a DataPrime or Lucene query
   */
  async query(request: QueryRequest): Promise<QueryResponse[]> {
    try {
      const response: AxiosResponse<QueryResponse[]> = await this.client.post(
        '/api/v1/dataprime/query',
        request
      );
      return response.data;
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

  /**
   * Generic HTTP request method
   */
  private async makeRequest(method: 'GET' | 'POST' | 'PUT' | 'DELETE', endpoint: string, data?: any): Promise<any> {
    try {
      const response = await this.client.request({
        method,
        url: endpoint,
        data
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error, `Failed to make ${method} request to ${endpoint}`);
    }
  }

  /**
   * Get detailed data usage information
   */
  async getDataUsage(filter: {
    dateRange: {
      fromDate: string;
      toDate: string;
    };
    resolution?: string;
    aggregate?: string[];
  }): Promise<{ entries: any[] }> {
    const params = new URLSearchParams();
    params.append('dateRange.fromDate', filter.dateRange.fromDate);
    params.append('dateRange.toDate', filter.dateRange.toDate);
    if (filter.resolution) {
      params.append('resolution', filter.resolution);
    }
    if (filter.aggregate) {
      filter.aggregate.forEach(agg => params.append('aggregate', agg));
    }

    const response = await this.makeRequest('GET', `/v2/datausage?${params.toString()}`);
    return response;
  }

  async getDailyUsageTokens(range?: string, dateRange?: { fromDate: string; toDate: string }): Promise<{ tokens: any[] }> {
    const body: any = {};
    if (range) {
      body.range = range;
    }
    if (dateRange) {
      body.dateRange = dateRange;
    }

    const response = await this.makeRequest('POST', '/v2/datausage/daily/evaluation_tokens', body);
    return response;
  }

  async getDailyUsageGBs(range?: string, dateRange?: { fromDate: string; toDate: string }): Promise<{ gbs: any[] }> {
    const body: any = {};
    if (range) {
      body.range = range;
    }
    if (dateRange) {
      body.dateRange = dateRange;
    }

    const response = await this.makeRequest('POST', '/v2/datausage/daily/processed_gbs', body);
    return response;
  }

  async getDailyUsageUnits(range?: string, dateRange?: { fromDate: string; toDate: string }): Promise<{ units: any[] }> {
    const body: any = {};
    if (range) {
      body.range = range;
    }
    if (dateRange) {
      body.dateRange = dateRange;
    }

    const response = await this.makeRequest('POST', '/v2/datausage/daily/units', body);
    return response;
  }

  async getDataUsageExportStatus(): Promise<{ enabled: boolean }> {
    const response = await this.makeRequest('GET', '/v2/datausage/exportstatus');
    return response;
  }

  async updateDataUsageExportStatus(enabled: boolean): Promise<{ enabled: boolean }> {
    const response = await this.makeRequest('POST', '/v2/datausage/exportstatus', { enabled });
    return response;
  }

  /**
   * Get current quota information
   */
  async getQuotaInfo(): Promise<QuotaInfo> {
    try {
      // Try to get quota information through the data usage API
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const request = {
        resolution: '1d',
        dateRange: {
          fromDate: yesterday.toISOString(),
          toDate: today.toISOString()
        }
      };

      const usageData = await this.getDataUsage(request);
      
      // Calculate totals from usage data
      let totalUnits = 0;
      let totalSizeGb = 0;
      
      if (usageData.entries && usageData.entries.length > 0) {
        for (const entry of usageData.entries) {
          totalUnits += entry.units || 0;
          totalSizeGb += entry.sizeGb || 0;
        }
      }

      return {
        usedQuotaGb: totalSizeGb,
        units: {
          usedUnits: totalUnits
        }
      };
    } catch (error) {
      throw this.handleError(error, 'Failed to get quota information');
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

  // ========== INCIDENTS API ==========

  /**
   * List incidents with filters
   */
  async listIncidents(request: ListIncidentsRequest): Promise<ListIncidentsResponse> {
    try {
      const response: AxiosResponse<ListIncidentsResponse> = await this.client.post(
        '/mgmt/openapi/v1/incidents',
        request
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to list incidents');
    }
  }

  /**
   * Get incident by ID
   */
  async getIncident(id: string): Promise<GetIncidentResponse> {
    try {
      const response: AxiosResponse<GetIncidentResponse> = await this.client.get(
        `/mgmt/openapi/v1/incidents/${id}`
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to get incident');
    }
  }

  /**
   * Acknowledge incidents
   */
  async acknowledgeIncidents(request: AcknowledgeIncidentsRequest): Promise<AcknowledgeIncidentsResponse> {
    try {
      const response: AxiosResponse<AcknowledgeIncidentsResponse> = await this.client.post(
        '/mgmt/openapi/v1/incidents:acknowledge',
        request
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to acknowledge incidents');
    }
  }

  /**
   * Resolve incidents
   */
  async resolveIncidents(request: { incidentIds: string[] }): Promise<AcknowledgeIncidentsResponse> {
    try {
      const response: AxiosResponse<AcknowledgeIncidentsResponse> = await this.client.post(
        '/mgmt/openapi/v1/incidents:resolve',
        request
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to resolve incidents');
    }
  }

  /**
   * Close incidents
   */
  async closeIncidents(request: { incidentIds: string[] }): Promise<AcknowledgeIncidentsResponse> {
    try {
      const response: AxiosResponse<AcknowledgeIncidentsResponse> = await this.client.post(
        '/mgmt/openapi/v1/incidents:close',
        request
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to close incidents');
    }
  }

  // ========== POLICIES API ==========

  /**
   * List policies
   */
  async listPolicies(enabledOnly: boolean, sourceType: SourceType): Promise<ListPoliciesResponse> {
    try {
      const response: AxiosResponse<ListPoliciesResponse> = await this.client.get(
        `/mgmt/openapi/v1/policies?enabledOnly=${enabledOnly}&sourceType=${sourceType}`
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to list policies');
    }
  }

  /**
   * Create a new policy
   */
  async createPolicy(request: CreatePolicyRequest): Promise<CreatePolicyResponse> {
    try {
      const response: AxiosResponse<CreatePolicyResponse> = await this.client.post(
        '/mgmt/openapi/v1/policies',
        request
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to create policy');
    }
  }

  /**
   * Get policy by ID
   */
  async getPolicy(id: string): Promise<GetPolicyResponse> {
    try {
      const response: AxiosResponse<GetPolicyResponse> = await this.client.get(
        `/mgmt/openapi/v1/policies/${id}`
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to get policy');
    }
  }

  /**
   * Update policy
   */
  async updatePolicy(request: any): Promise<CreatePolicyResponse> {
    try {
      const response: AxiosResponse<CreatePolicyResponse> = await this.client.put(
        '/mgmt/openapi/v1/policies',
        request
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to update policy');
    }
  }

  /**
   * Delete policy
   */
  async deletePolicy(id: string): Promise<void> {
    try {
      await this.client.delete(`/mgmt/openapi/v1/policies/${id}`);
    } catch (error) {
      throw this.handleError(error, 'Failed to delete policy');
    }
  }

  async getPolicies(enabledOnly: boolean, sourceType: SourceType): Promise<ListPoliciesResponse> {
    return this.listPolicies(enabledOnly, sourceType);
  }

  async togglePolicy(id: string, enabled: boolean): Promise<void> {
    try {
      await this.client.put(`/mgmt/openapi/v1/policies/${id}/toggle`, { enabled });
    } catch (error) {
      throw this.handleError(error, 'Failed to toggle policy');
    }
  }

  async reorderPolicies(orders: Array<{ id: string; order: number }>, sourceType: SourceType): Promise<void> {
    try {
      await this.client.put('/mgmt/openapi/v1/policies/reorder', { orders, sourceType });
    } catch (error) {
      throw this.handleError(error, 'Failed to reorder policies');
    }
  }

  // ========== SLOs API ==========

  /**
   * List SLOs
   */
  async listSlos(): Promise<ListSlosResponse> {
    try {
      const response: AxiosResponse<ListSlosResponse> = await this.client.get(
        '/mgmt/openapi/v1/slo/slos'
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to list SLOs');
    }
  }

  /**
   * Create a new SLO
   */
  async createSlo(request: CreateSloRequest): Promise<CreateSloResponse> {
    try {
      const response: AxiosResponse<CreateSloResponse> = await this.client.post(
        '/mgmt/openapi/v1/slo/slos',
        request
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to create SLO');
    }
  }

  /**
   * Get SLO by ID
   */
  async getSlo(id: string): Promise<GetSloResponse> {
    try {
      const response: AxiosResponse<GetSloResponse> = await this.client.get(
        `/mgmt/openapi/v1/slo/slos/${id}`
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to get SLO');
    }
  }

  /**
   * Update SLO
   */
  async updateSlo(request: any): Promise<CreateSloResponse> {
    try {
      const response: AxiosResponse<CreateSloResponse> = await this.client.put(
        '/mgmt/openapi/v1/slo/slos',
        request
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to update SLO');
    }
  }

  /**
   * Delete SLO
   */
  async deleteSlo(id: string): Promise<void> {
    try {
      await this.client.delete(`/mgmt/openapi/v1/slo/slos/${id}`);
    } catch (error) {
      throw this.handleError(error, 'Failed to delete SLO');
    }
  }

  // ========== TARGETS API ==========

  async getTarget(): Promise<any> {
    try {
      const response = await this.client.get('/mgmt/openapi/v1/archiving/targets');
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to get target');
    }
  }

  async setTarget(request: any): Promise<any> {
    try {
      const response = await this.client.post('/mgmt/openapi/v1/archiving/targets', request);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to set target');
    }
  }

  async validateTarget(request: any): Promise<any> {
    try {
      const response = await this.client.post('/mgmt/openapi/v1/archiving/targets/validate', request);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to validate target');
    }
  }

  // ========== TEAM PERMISSIONS API ==========

  async getTeamGroups(teamId?: number): Promise<any> {
    try {
      const url = teamId ? `/mgmt/openapi/v1/team-groups?teamId=${teamId}` : '/mgmt/openapi/v1/team-groups';
      const response = await this.client.get(url);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to get team groups');
    }
  }

  async createTeamGroup(request: any): Promise<any> {
    try {
      const response = await this.client.post('/mgmt/openapi/v1/team-groups', request);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to create team group');
    }
  }

  async updateTeamGroup(request: any): Promise<void> {
    try {
      await this.client.put('/mgmt/openapi/v1/team-groups', request);
    } catch (error) {
      throw this.handleError(error, 'Failed to update team group');
    }
  }

  async getTeamGroup(groupId: number): Promise<any> {
    try {
      const response = await this.client.get(`/mgmt/openapi/v1/team-groups/${groupId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to get team group');
    }
  }

  async deleteTeamGroup(groupId: number): Promise<void> {
    try {
      await this.client.delete(`/mgmt/openapi/v1/team-groups/${groupId}`);
    } catch (error) {
      throw this.handleError(error, 'Failed to delete team group');
    }
  }

  async getTeamGroupUsers(groupId: number, pageSize?: number, pageToken?: string): Promise<any> {
    try {
      let url = `/mgmt/openapi/v1/team-groups/${groupId}/users`;
      const params = new URLSearchParams();
      if (pageSize) params.append('pageSize', pageSize.toString());
      if (pageToken) params.append('pageToken', pageToken);
      if (params.toString()) url += `?${params.toString()}`;
      
      const response = await this.client.get(url);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to get team group users');
    }
  }

  async addUsersToTeamGroup(groupId: number, userIds: string[]): Promise<any> {
    try {
      const response = await this.client.post(`/mgmt/openapi/v1/team-groups/${groupId}/users`, { userIds });
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to add users to team group');
    }
  }

  async removeUsersFromTeamGroup(groupId: number): Promise<void> {
    try {
      await this.client.delete(`/mgmt/openapi/v1/team-groups/${groupId}/users`);
    } catch (error) {
      throw this.handleError(error, 'Failed to remove users from team group');
    }
  }

  private handleError(error: any, context: string): Error {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || error.message;
      return new Error(`${context} (HTTP ${status}): ${message}`);
    }
    if (error.request) {
      return new Error(`${context}: Network error - ${error.message}`);
    }
    return new Error(`${context}: ${error.message}`);
  }
}

// Singleton instance
let clientInstance: CoralogixClient | null = null;

export function getCoralogixClient(): CoralogixClient {
  if (!clientInstance) {
    const apiKey = process.env.CORALOGIX_API_KEY;
    const domain = process.env.CORALOGIX_DOMAIN;

    if (!apiKey || !domain) {
      throw new Error('CORALOGIX_API_KEY and CORALOGIX_DOMAIN environment variables are required');
    }

    clientInstance = new CoralogixClient(apiKey, domain);
  }

  return clientInstance;
} 