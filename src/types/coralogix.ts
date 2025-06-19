/**
 * Coralogix API Types
 * 
 * This file contains type definitions for the working Coralogix APIs in EU2 region:
 * - Query APIs (DataPrime, Lucene, Background queries)
 * - Alert Definitions
 * - Dashboard Catalog
 * - Target Management
 */

// ============================================================================
// QUERY TYPES
// ============================================================================

export type QuerySyntax = 
  | 'QUERY_SYNTAX_UNSPECIFIED'
  | 'QUERY_SYNTAX_LUCENE'
  | 'QUERY_SYNTAX_DATAPRIME'
  | 'QUERY_SYNTAX_LUCENE_UTF8_BASE64'
  | 'QUERY_SYNTAX_DATAPRIME_UTF8_BASE64';

export type Tier = 
  | 'TIER_UNSPECIFIED'
  | 'TIER_ARCHIVE'
  | 'TIER_FREQUENT_SEARCH';

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

export interface QueryRequest {
  query: string;
  metadata?: QueryMetadata;
}

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

// ============================================================================
// DOMAIN MAPPING
// ============================================================================

export const DOMAIN_ENDPOINTS: Record<string, string> = {
  'coralogix.com': 'https://api.coralogix.com',
  'coralogix.us': 'https://api.coralogix.us',
  'cx498.coralogix.com': 'https://api.cx498.coralogix.com',
  'eu2.coralogix.com': 'https://api.eu2.coralogix.com',
  'coralogix.in': 'https://api.coralogix.in',
  'coralogixsg.com': 'https://api.coralogixsg.com',
  'ap3.coralogix.com': 'https://api.ap3.coralogix.com',
};

// ============================================================================
// ALERT DEFINITION TYPES
// ============================================================================

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

// ============================================================================
// DASHBOARD TYPES
// ============================================================================

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