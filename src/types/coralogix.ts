/**
 * Coralogix API Types
 */

// Query syntax types
export type QuerySyntax = 
  | 'QUERY_SYNTAX_UNSPECIFIED'
  | 'QUERY_SYNTAX_LUCENE'
  | 'QUERY_SYNTAX_DATAPRIME'
  | 'QUERY_SYNTAX_LUCENE_UTF8_BASE64'
  | 'QUERY_SYNTAX_DATAPRIME_UTF8_BASE64';

// Tier types
export type Tier = 
  | 'TIER_UNSPECIFIED'
  | 'TIER_ARCHIVE'
  | 'TIER_FREQUENT_SEARCH';

// Query metadata
export interface QueryMetadata {
  tier?: Tier;
  syntax?: QuerySyntax;
  limit?: number;
  startDate?: string;
  endDate?: string;
  defaultSource?: string;
  strictFieldsValidation?: boolean;
  nowDate?: string;
}

// Query request
export interface QueryRequest {
  query: string;
  metadata?: QueryMetadata;
}

// Query response types
export interface KeyValue {
  key: string;
  value: string;
}

export interface DataprimeResults {
  metadata: KeyValue[];
  labels: KeyValue[];
  userData: string;
}

export interface DataprimeResult {
  results: DataprimeResults[];
}

export interface QueryId {
  queryId: string;
}

export interface DataprimeError {
  message: string;
  code?: {
    rateLimitReached?: {};
  };
}

export interface DataprimeWarning {
  compileWarning?: {
    warningMessage: string;
  };
  timeRangeWarning?: {
    warningMessage: string;
    startDate?: string;
    endDate?: string;
  };
  numberOfResultsLimitWarning?: {
    numberOfResultsLimit: number;
  };
  bytesScannedLimitWarning?: {};
  deprecationWarning?: {
    warningMessage: string;
  };
  blocksLimitWarning?: {};
  aggregationBucketsLimitWarning?: {
    aggregationBucketsLimit: number;
  };
  archiveWarning?: {
    noMetastoreData?: {};
    bucketAccessDenied?: {};
    bucketReadFailed?: {};
    missingData?: {};
  };
  scrollTimeoutWarning?: {};
  fieldCountLimitWarning?: {};
  shuffleFileSizeLimitReachedWarning?: {};
  filesReadLimitWarning?: {};
  sidebarFilterCardinalityLimitWarning?: {
    fields: string[];
    cardinalityLimit: string;
  };
}

export interface QueryResponse {
  error?: DataprimeError;
  result?: DataprimeResult;
  warning?: DataprimeWarning;
  queryId?: QueryId;
}

// Background query types
export interface SubmitBackgroundQueryRequest {
  query: string;
  syntax: QuerySyntax;
  startDate?: string;
  endDate?: string;
  nowDate?: string;
}

export interface SubmitBackgroundQueryResponse {
  warnings: DataprimeWarning[];
  queryId: string;
}

export interface GetBackgroundQueryStatusRequest {
  queryId: string;
}

export interface BackgroundQueryStatus {
  running?: {
    runningSince: string;
  };
  terminated?: {
    success?: {};
    error?: {
      cancelled?: {};
      failed?: {
        reason: string;
      };
      timedOut?: {};
    };
    cancelled?: {};
    runningSince: string;
    terminatedAt: string;
  };
  waitingForExecution?: {};
  submittedAt: string;
}

export interface GetBackgroundQueryStatusResponse {
  running?: BackgroundQueryStatus['running'];
  terminated?: BackgroundQueryStatus['terminated'];
  metadata: Array<{
    statistics: {
      bytesScanned: string;
    };
  }>;
  warnings: DataprimeWarning[];
  waitingForExecution?: {};
  submittedAt: string;
}

export interface GetBackgroundQueryDataRequest {
  queryId: string;
}

export interface GetBackgroundQueryDataResponse {
  response?: {
    results: DataprimeResult;
  };
}

export interface CancelBackgroundQueryRequest {
  queryId: string;
}

export interface CancelBackgroundQueryResponse {}

// Domain mapping for API endpoints
export const DOMAIN_ENDPOINTS: Record<string, string> = {
  'coralogix.com': 'https://ng-api-http.coralogix.com',
  'coralogix.us': 'https://ng-api-http.coralogix.us',
  'cx498.coralogix.com': 'https://ng-api-http.cx498.coralogix.com',
  'eu2.coralogix.com': 'https://ng-api-http.eu2.coralogix.com',
  'coralogix.in': 'https://ng-api-http.coralogix.in',
  'coralogixsg.com': 'https://ng-api-http.coralogixsg.com',
  'ap3.coralogix.com': 'https://ng-api-http.ap3.coralogix.com',
};

// Data Usage and Billing Types
export interface DataUsageRequest {
  resolution?: string;
  dateRange?: {
    fromDate: string;
    toDate: string;
  };
}

export interface DataUsageDimension {
  tier?: string;
  pillar?: string;
  severity?: string;
  genericDimension?: {
    key: string;
    value: string;
  };
}

export interface DataUsageEntry {
  timestamp: string;
  applicationName?: string;
  subsystemName?: string;
  pillar?: 'logs' | 'metrics' | 'traces';
  priority?: 'high' | 'medium' | 'low' | 'block';
  processedGigabytes: number;
  evaluationTokens?: number;
  units?: number;
}

export interface DataUsageFilter {
  dateRange: {
    fromDate: string;
    toDate: string;
  };
  resolution?: string;
  aggregate?: Array<'AGGREGATE_BY_APPLICATION' | 'AGGREGATE_BY_SUBSYSTEM' | 'AGGREGATE_BY_PILLAR' | 'AGGREGATE_BY_PRIORITY'>;
}

export interface DailyUsageTokens {
  date: string;
  evaluationTokens: number;
}

export interface DailyUsageGBs {
  date: string;
  processedGigabytes: number;
}

export interface DailyUsageUnits {
  date: string;
  units: number;
}

export interface DataUsageResponse {
  data: DataUsageEntry[];
}

export interface QuotaInfo {
  dailyQuotaGb?: number;
  usedQuotaGb?: number;
  remainingQuotaGb?: number;
  units?: {
    dailyQuotaUnits?: number;
    usedUnits?: number;
    remainingUnits?: number;
  };
}

// Alert Definition Types
export type AlertDefPriority = 
  | 'ALERT_DEF_PRIORITY_P5_OR_UNSPECIFIED'
  | 'ALERT_DEF_PRIORITY_P4'
  | 'ALERT_DEF_PRIORITY_P3'
  | 'ALERT_DEF_PRIORITY_P2'
  | 'ALERT_DEF_PRIORITY_P1';

export type AlertDefType = 
  | 'ALERT_DEF_TYPE_LOGS_IMMEDIATE_OR_UNSPECIFIED'
  | 'ALERT_DEF_TYPE_LOGS_THRESHOLD'
  | 'ALERT_DEF_TYPE_LOGS_ANOMALY'
  | 'ALERT_DEF_TYPE_METRIC_THRESHOLD'
  | 'ALERT_DEF_TYPE_FLOW';

export interface AlertDefProperties {
  name: string;
  description?: string;
  enabled?: boolean;
  priority: AlertDefPriority;
  type: AlertDefType;
  groupByKeys?: string[];
  entityLabels?: Record<string, string>;
  phantomMode?: boolean;
  deleted?: boolean;
}

export interface AlertDef {
  alertDefProperties: AlertDefProperties;
  id: string;
  alertVersionId?: string;
  createdTime?: string;
  updatedTime?: string;
}

export interface CreateAlertDefRequest {
  alertDefProperties: AlertDefProperties;
}

export interface CreateAlertDefResponse {
  alertDef: AlertDef;
}

export interface GetAlertDefResponse {
  alertDef: AlertDef;
}

export interface ListAlertDefsResponse {
  alertDefs: AlertDef[];
}

// Dashboard Types
export interface Dashboard {
  id?: string;
  name: string;
  description?: string;
  layout?: any;
  variables?: any[];
  filters?: any[];
  absoluteTimeFrame?: any;
  relativeTimeFrame?: string;
  folderId?: any;
  folderPath?: any;
  annotations?: any[];
}

export interface CreateDashboardRequest {
  requestId: string;
  dashboard: Dashboard;
  isLocked?: boolean;
}

export interface CreateDashboardResponse {
  dashboardId: string;
}

export interface GetDashboardResponse {
  dashboard: Dashboard;
  updatedAt?: string;
  createdAt?: string;
  updaterAuthorId?: string;
  updaterName?: string;
  authorId?: string;
  authorName?: string;
  isLocked?: boolean;
}

export interface DashboardCatalogItem {
  id: string;
  name: string;
  description?: string;
  folderId?: string;
  isPinned?: boolean;
}

export interface GetDashboardCatalogResponse {
  items: DashboardCatalogItem[];
}

// Incident Types
export type IncidentState = 
  | 'INCIDENT_STATE_UNSPECIFIED'
  | 'INCIDENT_STATE_OPEN'
  | 'INCIDENT_STATE_CLOSED';

export type IncidentStatus = 
  | 'INCIDENT_STATUS_UNSPECIFIED'
  | 'INCIDENT_STATUS_TRIGGERED'
  | 'INCIDENT_STATUS_ACKNOWLEDGED'
  | 'INCIDENT_STATUS_RESOLVED';

export type IncidentSeverity = 
  | 'INCIDENT_SEVERITY_UNSPECIFIED'
  | 'INCIDENT_SEVERITY_INFO'
  | 'INCIDENT_SEVERITY_WARNING'
  | 'INCIDENT_SEVERITY_CRITICAL';

export interface Incident {
  id: string;
  name: string;
  state: IncidentState;
  status: IncidentStatus;
  assignments?: any[];
  description?: string;
  severity: IncidentSeverity;
  contextualLabels?: Record<string, string>;
  displayLabels?: Record<string, string>;
  events?: any[];
  createdAt?: string;
  closedAt?: string;
  lastStateUpdateTime?: string;
  lastStateUpdateKey?: string;
  isMuted?: boolean;
  metaLabels?: string[];
  duration?: string;
}

export interface IncidentQueryFilter {
  assignee?: string[];
  status?: IncidentStatus[];
  state?: IncidentState[];
  severity?: IncidentSeverity[];
  contextualLabels?: Record<string, string>;
  startTime?: string;
  endTime?: string;
  applicationName?: string[];
  subsystemName?: string[];
  isMuted?: boolean;
}

export interface PaginationRequest {
  pageSize?: number;
  pageToken?: string;
}

export interface PaginationResponse {
  totalSize?: number;
  nextPageToken?: string;
}

export interface ListIncidentsRequest {
  filter?: IncidentQueryFilter;
  pagination?: PaginationRequest;
}

export interface ListIncidentsResponse {
  incidents: Incident[];
  pagination?: PaginationResponse;
}

export interface GetIncidentResponse {
  incident: Incident;
}

export interface AcknowledgeIncidentsRequest {
  incidentIds: string[];
}

export interface AcknowledgeIncidentsResponse {
  incidents: Incident[];
}

// Policy Types
export type Priority = 
  | 'PRIORITY_TYPE_UNSPECIFIED'
  | 'PRIORITY_TYPE_BLOCK'
  | 'PRIORITY_TYPE_LOW'
  | 'PRIORITY_TYPE_MEDIUM'
  | 'PRIORITY_TYPE_HIGH';

export type SourceType = 
  | 'SOURCE_TYPE_UNSPECIFIED'
  | 'SOURCE_TYPE_LOGS'
  | 'SOURCE_TYPE_SPANS';

export interface Policy {
  id: string;
  companyId: number;
  name: string;
  description?: string;
  priority: 'PRIORITY_TYPE_BLOCK' | 'PRIORITY_TYPE_LOW' | 'PRIORITY_TYPE_MEDIUM' | 'PRIORITY_TYPE_HIGH';
  deleted: boolean;
  enabled: boolean;
  order: number;
  applicationRule?: {
    ruleTypeId: string;
    name: string;
  };
  subsystemRule?: {
    ruleTypeId: string;
    name: string;
  };
  logRules?: {
    severities: string[];
  };
  spanRules?: {
    serviceRule?: any;
    actionRule?: any;
    tagRules?: any[];
  };
  createdAt: string;
  updatedAt: string;
  archiveRetention?: {
    id: string;
  };
}

export interface CreatePolicyRequest {
  name: string;
  description?: string;
  priority: 'PRIORITY_TYPE_BLOCK' | 'PRIORITY_TYPE_LOW' | 'PRIORITY_TYPE_MEDIUM' | 'PRIORITY_TYPE_HIGH';
  applicationRule?: {
    ruleTypeId: string;
    name: string;
  };
  subsystemRule?: {
    ruleTypeId: string;
    name: string;
  };
  logRules?: {
    severities: string[];
  };
  spanRules?: any;
  archiveRetention?: {
    id: string;
  };
}

export interface UpdatePolicyRequest {
  id: string;
  name?: string;
  description?: string;
  priority?: 'PRIORITY_TYPE_BLOCK' | 'PRIORITY_TYPE_LOW' | 'PRIORITY_TYPE_MEDIUM' | 'PRIORITY_TYPE_HIGH';
  applicationRule?: {
    ruleTypeId: string;
    name: string;
  };
  subsystemRule?: {
    ruleTypeId: string;
    name: string;
  };
  logRules?: {
    severities: string[];
  };
  spanRules?: any;
  enabled?: boolean;
  archiveRetention?: {
    id: string;
  };
}

export interface CreatePolicyResponse {
  policy: Policy;
}

export interface GetPolicyResponse {
  policy: Policy;
}

export interface ListPoliciesResponse {
  policies: Policy[];
}

// SLO Types
export type SloTimeFrame = 
  | 'SLO_TIME_FRAME_UNSPECIFIED'
  | 'SLO_TIME_FRAME_7_DAYS'
  | 'SLO_TIME_FRAME_14_DAYS'
  | 'SLO_TIME_FRAME_21_DAYS'
  | 'SLO_TIME_FRAME_28_DAYS';

export interface Slo {
  id?: string;
  name: string;
  description?: string;
  creator?: string;
  labels?: Record<string, string>;
  createTime?: string;
  updateTime?: string;
  targetThresholdPercentage: number;
  sloTimeFrame?: SloTimeFrame;
}

export interface CreateSloRequest {
  name: string;
  description?: string;
  creator?: string;
  labels?: Record<string, string>;
  targetThresholdPercentage: number;
  sloTimeFrame?: SloTimeFrame;
}

export interface CreateSloResponse {
  slo: Slo;
}

export interface GetSloResponse {
  slo: Slo;
}

export interface ListSlosResponse {
  slos: Slo[];
}



// ============================================================================
// TARGET SERVICE TYPES
// ============================================================================

export interface Target {
  s3?: {
    bucket: string;
    region: string;
  };
  ibmCos?: {
    bucketCrn: string;
    endpoint: string;
    serviceCrn: string;
    bucketType: string;
  };
  archiveSpec?: any;
}

export interface SetTargetRequest {
  isActive: boolean;
  s3?: {
    bucket: string;
    region: string;
  };
  ibmCos?: {
    bucketCrn: string;
    endpoint: string;
    serviceCrn: string;
    bucketType: string;
  };
}

export interface ValidateTargetRequest {
  isActive: boolean;
  s3?: {
    bucket: string;
    region: string;
  };
  ibmCos?: {
    bucketCrn: string;
    endpoint: string;
    serviceCrn: string;
    bucketType: string;
  };
}

// ============================================================================
// TEAM PERMISSIONS TYPES
// ============================================================================

export interface TeamGroup {
  groupId: {
    id: number;
  };
  name: string;
  description?: string;
  externalId?: string;
  groupOrigin: string;
  teamId: {
    id: number;
  };
  roles: any[];
  scope?: any;
  createdAt: string;
  updatedAt: string;
  nextGenScopeId?: string;
}

export interface CreateTeamGroupRequest {
  name: string;
  teamId?: {
    id: number;
  };
  description?: string;
  externalId?: string;
  roleIds?: Array<{
    id: string;
  }>;
  userIds?: Array<{
    id: string;
  }>;
  scopeFilters?: {
    subsystems: string[];
    applications: string[];
  };
  nextGenScopeId?: string;
}

export interface UpdateTeamGroupRequest {
  groupId: {
    id: number;
  };
  name?: string;
  description?: string;
  externalId?: string;
  roleUpdates?: {
    roleIds: Array<{
      id: string;
    }>;
  };
  userUpdates?: {
    userIds: Array<{
      id: string;
    }>;
  };
  scopeFilters?: {
    subsystems: string[];
    applications: string[];
  };
  nextGenScopeId?: string;
}

// ============================================================================
// RETENTIONS TYPES
// ============================================================================

export interface Retention {
  id: string;
  name: string;
  days: number;
}

export interface RetentionUpdateElement {
  retentionId: string;
  newRetentionDays: number;
} 