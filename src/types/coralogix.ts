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
  startDate: string; // Required for background queries
  endDate: string;   // Required for background queries
  nowDate?: string;
  tier?: Tier;       // Optional for background queries
  limit?: number;    // Optional, default 2000, max 1000000
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
  | 'ALERT_DEF_TYPE_LOGS_RATIO_THRESHOLD'
  | 'ALERT_DEF_TYPE_LOGS_NEW_VALUE'
  | 'ALERT_DEF_TYPE_LOGS_UNIQUE_COUNT'
  | 'ALERT_DEF_TYPE_LOGS_TIME_RELATIVE_THRESHOLD'
  | 'ALERT_DEF_TYPE_METRIC_THRESHOLD'
  | 'ALERT_DEF_TYPE_METRIC_ANOMALY'
  | 'ALERT_DEF_TYPE_TRACING_IMMEDIATE'
  | 'ALERT_DEF_TYPE_TRACING_THRESHOLD'
  | 'ALERT_DEF_TYPE_FLOW'
  | 'ALERT_DEF_TYPE_SLO_THRESHOLD';

// Log Filter Operation Types
export type LogFilterOperationType = 
  | 'LOG_FILTER_OPERATION_TYPE_IS_OR_UNSPECIFIED'
  | 'LOG_FILTER_OPERATION_TYPE_IS_NOT'
  | 'LOG_FILTER_OPERATION_TYPE_STARTS_WITH'
  | 'LOG_FILTER_OPERATION_TYPE_ENDS_WITH'
  | 'LOG_FILTER_OPERATION_TYPE_CONTAINS'
  | 'LOG_FILTER_OPERATION_TYPE_NOT_CONTAINS';

export type LogSeverity = 
  | 'LOG_SEVERITY_VERBOSE_UNSPECIFIED'
  | 'LOG_SEVERITY_DEBUG'
  | 'LOG_SEVERITY_INFO'
  | 'LOG_SEVERITY_WARNING'
  | 'LOG_SEVERITY_ERROR'
  | 'LOG_SEVERITY_CRITICAL';

// Tracing Filter Operation Types
export type TracingFilterOperationType = 
  | 'TRACING_FILTER_OPERATION_TYPE_IS_OR_UNSPECIFIED'
  | 'TRACING_FILTER_OPERATION_TYPE_IS_NOT'
  | 'TRACING_FILTER_OPERATION_TYPE_STARTS_WITH'
  | 'TRACING_FILTER_OPERATION_TYPE_ENDS_WITH'
  | 'TRACING_FILTER_OPERATION_TYPE_CONTAINS'
  | 'TRACING_FILTER_OPERATION_TYPE_NOT_CONTAINS';

// Time Window Types
export type LogsTimeWindowValue = 
  | 'LOGS_TIME_WINDOW_VALUE_MINUTES_5_OR_UNSPECIFIED'
  | 'LOGS_TIME_WINDOW_VALUE_MINUTES_10'
  | 'LOGS_TIME_WINDOW_VALUE_MINUTES_15'
  | 'LOGS_TIME_WINDOW_VALUE_MINUTES_20'
  | 'LOGS_TIME_WINDOW_VALUE_MINUTES_30'
  | 'LOGS_TIME_WINDOW_VALUE_HOURS_1'
  | 'LOGS_TIME_WINDOW_VALUE_HOURS_2'
  | 'LOGS_TIME_WINDOW_VALUE_HOURS_4'
  | 'LOGS_TIME_WINDOW_VALUE_HOURS_6'
  | 'LOGS_TIME_WINDOW_VALUE_HOURS_12'
  | 'LOGS_TIME_WINDOW_VALUE_HOURS_24';

export type MetricTimeWindowValue = 
  | 'METRIC_TIME_WINDOW_VALUE_MINUTES_1_OR_UNSPECIFIED'
  | 'METRIC_TIME_WINDOW_VALUE_MINUTES_5'
  | 'METRIC_TIME_WINDOW_VALUE_MINUTES_10'
  | 'METRIC_TIME_WINDOW_VALUE_MINUTES_15'
  | 'METRIC_TIME_WINDOW_VALUE_MINUTES_30'
  | 'METRIC_TIME_WINDOW_VALUE_HOURS_1'
  | 'METRIC_TIME_WINDOW_VALUE_HOURS_2'
  | 'METRIC_TIME_WINDOW_VALUE_HOURS_4'
  | 'METRIC_TIME_WINDOW_VALUE_HOURS_6'
  | 'METRIC_TIME_WINDOW_VALUE_HOURS_12'
  | 'METRIC_TIME_WINDOW_VALUE_HOURS_24';

// Condition Types
export type LogsThresholdConditionType = 
  | 'LOGS_THRESHOLD_CONDITION_TYPE_MORE_THAN_OR_UNSPECIFIED'
  | 'LOGS_THRESHOLD_CONDITION_TYPE_LESS_THAN'
  | 'LOGS_THRESHOLD_CONDITION_TYPE_EQUALS'
  | 'LOGS_THRESHOLD_CONDITION_TYPE_NOT_EQUALS';

export type MetricThresholdConditionType = 
  | 'METRIC_THRESHOLD_CONDITION_TYPE_MORE_THAN_OR_UNSPECIFIED'
  | 'METRIC_THRESHOLD_CONDITION_TYPE_LESS_THAN'
  | 'METRIC_THRESHOLD_CONDITION_TYPE_EQUALS'
  | 'METRIC_THRESHOLD_CONDITION_TYPE_NOT_EQUALS';

// Day of Week enum
export type DayOfWeek = 
  | 'DAY_OF_WEEK_MONDAY_OR_UNSPECIFIED'
  | 'DAY_OF_WEEK_TUESDAY'
  | 'DAY_OF_WEEK_WEDNESDAY'
  | 'DAY_OF_WEEK_THURSDAY'
  | 'DAY_OF_WEEK_FRIDAY'
  | 'DAY_OF_WEEK_SATURDAY'
  | 'DAY_OF_WEEK_SUNDAY';

// Notification Types
export type NotifyOn = 
  | 'NOTIFY_ON_TRIGGERED_ONLY_UNSPECIFIED'
  | 'NOTIFY_ON_TRIGGERED_AND_RESOLVED';

// Filter Interfaces
export interface LogLabelFilter {
  value: string;
  operation: LogFilterOperationType;
}

export interface LogLabelFilters {
  applicationName?: LogLabelFilter[];
  subsystemName?: LogLabelFilter[];
  severities?: LogSeverity[];
}

export interface SimpleLogFilter {
  luceneQuery?: string;
  labelFilters?: LogLabelFilters;
}

export interface LogsFilter {
  simpleFilter?: SimpleLogFilter;
}

export interface TracingLabelFilter {
  values: string[];
  operation: TracingFilterOperationType;
}

export interface SpanFieldFilter {
  key: string;
  filterType: {
    values: string[];
    operation: TracingFilterOperationType;
  };
}

export interface TracingLabelFilters {
  applicationName?: TracingLabelFilter[];
  subsystemName?: TracingLabelFilter[];
  serviceName?: TracingLabelFilter[];
  operationName?: TracingLabelFilter[];
  spanFields?: SpanFieldFilter[];
}

export interface SimpleTracingFilter {
  tracingLabelFilters?: TracingLabelFilters;
  latencyThresholdMs?: number;
}

export interface TracingFilter {
  simpleFilter?: SimpleTracingFilter;
}

// Time Window Interfaces
export interface LogsTimeWindow {
  logsTimeWindowSpecificValue?: LogsTimeWindowValue;
}

export interface MetricTimeWindow {
  metricTimeWindowSpecificValue?: MetricTimeWindowValue;
  metricTimeWindowDynamicDuration?: string;
}

// Condition Interfaces
export interface LogsThresholdCondition {
  threshold: number;
  timeWindow: LogsTimeWindow;
  conditionType: LogsThresholdConditionType;
}

export interface MetricThresholdCondition {
  threshold: number;
  forOverPct?: number;
  ofTheLast: MetricTimeWindow;
  conditionType: MetricThresholdConditionType;
}

// Rule Interfaces
export interface LogsThresholdRule {
  condition: LogsThresholdCondition;
  override?: {
    priority?: AlertDefPriority;
  };
}

export interface MetricThresholdRule {
  condition: MetricThresholdCondition;
  override?: {
    priority?: AlertDefPriority;
  };
}

// Alert Type Specific Interfaces
export interface LogsImmediate {
  logsFilter: LogsFilter;
  notificationPayloadFilter?: string[];
}

export interface TracingImmediate {
  tracingFilter: TracingFilter;
  notificationPayloadFilter?: string[];
}

export interface LogsThreshold {
  logsFilter: LogsFilter;
  undetectedValuesManagement?: {
    triggerUndetectedValues?: boolean;
    autoRetireTimeframe?: string;
  };
  rules: LogsThresholdRule[];
  notificationPayloadFilter?: string[];
  evaluationDelayMs?: number;
}

export interface MetricThreshold {
  metricFilter: {
    promql: string;
  };
  rules: MetricThresholdRule[];
  undetectedValuesManagement?: {
    triggerUndetectedValues?: boolean;
    autoRetireTimeframe?: string;
  };
  missingValues?: {
    replaceWithZero?: boolean;
    minNonNullValuesPct?: number;
  };
  evaluationDelayMs?: number;
}

// Active Time Configuration
export interface TimeOfDay {
  hours: number;
  minutes: number;
}

export interface ActiveOn {
  dayOfWeek?: DayOfWeek[];
  startTime?: TimeOfDay;
  endTime?: TimeOfDay;
}

// Notification Configuration
export interface WebhookIntegration {
  integrationId: number;
  recipients?: {
    emails?: string[];
  };
}

export interface WebhookSettings {
  minutes?: number;
  notifyOn?: NotifyOn;
  integration?: WebhookIntegration;
}

export interface NotificationDestination {
  connectorId: string;
  presetId?: string;
  notifyOn?: NotifyOn;
  triggeredRoutingOverrides?: any;
  resolvedRouteOverrides?: any;
}

export interface NotificationRouter {
  id: string;
  notifyOn?: NotifyOn;
}

export interface NotificationGroup {
  groupByKeys?: string[];
  webhooks?: WebhookSettings[];
  destinations?: NotificationDestination[];
  router?: NotificationRouter;
}

export interface IncidentsSettings {
  minutes?: number;
  notifyOn?: NotifyOn;
}

// Complete Alert Definition Properties
export interface AlertDefProperties {
  name: string;
  description?: string;
  enabled?: boolean;
  priority: AlertDefPriority;
  activeOn?: ActiveOn;
  type: AlertDefType;
  
  // Alert Type Specific Configurations
  logsImmediate?: LogsImmediate;
  tracingImmediate?: TracingImmediate;
  logsThreshold?: LogsThreshold;
  metricThreshold?: MetricThreshold;
  // TODO: Add other alert types (logsRatioThreshold, logsAnomaly, etc.)
  
  // Common Properties
  groupByKeys?: string[];
  incidentsSettings?: IncidentsSettings;
  notificationGroup?: NotificationGroup;
  notificationGroupExcess?: NotificationGroup[];
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
  lastTriggeredTime?: string;
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

// Alert Events API Types
export interface AlertEvent {
  id: string;
  alertDefId: string;
  alertDefName: string;
  alertDefPriority: AlertDefPriority;
  alertDefType: AlertDefType;
  timestamp: string;
  status: 'TRIGGERED' | 'RESOLVED';
  groupByValues?: Record<string, string>;
  entityLabels?: Record<string, string>;
  logEntries?: any[];
  metricData?: any[];
  tracingData?: any[];
}

export interface GetAlertEventResponse {
  alertEvent: AlertEvent;
}

export interface AlertEventStatistics {
  totalCount: number;
  triggeredCount: number;
  resolvedCount: number;
  timeRange: {
    startTime: string;
    endTime: string;
  };
}

// Advanced Alert Filtering Types
export type FilterMatcher = 
  | 'FILTER_MATCHER_UNSPECIFIED'
  | 'FILTER_MATCHER_EQUALS'
  | 'FILTER_MATCHER_NOT_EQUALS'
  | 'FILTER_MATCHER_CONTAINS';

export type FilterValuesOperator = 
  | 'FILTER_VALUES_OPERATOR_UNSPECIFIED'
  | 'FILTER_VALUES_OPERATOR_OR'
  | 'FILTER_VALUES_OPERATOR_AND';

export interface NameFilter {
  name: string[];
  matcher: FilterMatcher;
}

export interface TypeFilter {
  type: AlertDefType[];
  matcher: FilterMatcher;
}

export interface EntityLabelsFilter {
  entityLabels?: string;
  valuesOperator: FilterValuesOperator;
}

export interface PriorityFilter {
  priority: AlertDefPriority[];
  matcher: FilterMatcher;
}

export interface EnabledFilter {
  enabled: boolean;
}

export interface TimeRangeFilter {
  startTime: string;
  endTime: string;
}

export interface ModifiedTimeRangeFilter {
  modifiedAtRange: TimeRangeFilter;
}

export interface LastTriggeredTimeRangeFilter {
  lastTriggeredAtRange: TimeRangeFilter;
}

export interface SloFilter {
  sloId: string[];
  matcher: FilterMatcher;
}

export interface TypeSpecificFilter {
  sloFilter?: SloFilter;
}

export interface AlertQueryFilter {
  nameFilter?: NameFilter;
  typeFilter?: TypeFilter;
  entityLabelsFilter?: EntityLabelsFilter;
  priorityFilter?: PriorityFilter;
  enabledFilter?: EnabledFilter;
  modifiedTimeRangeFilter?: ModifiedTimeRangeFilter;
  lastTriggeredTimeRangeFilter?: LastTriggeredTimeRangeFilter;
  typeSpecificFilter?: TypeSpecificFilter;
}

export interface Pagination {
  pageSize?: number;
  pageToken?: string;
}

export interface PaginationResponse {
  totalSize?: number;
  nextPageToken?: string;
}

export interface ListAlertDefsRequest {
  queryFilter?: AlertQueryFilter;
  pagination?: Pagination;
}

export interface ListAlertDefsWithFilterResponse {
  alertDefs: AlertDef[];
  pagination?: PaginationResponse;
}

// ============================================================================
// PARSING RULES TYPES
// ============================================================================

export type ParsingRuleType = 
  | 'block'
  | 'extract'
  | 'parse'
  | 'jsonextract'
  | 'replace'
  | 'timestampextract'
  | 'removefields'
  | 'stringify'
  | 'parsejson';

export type RuleMatcherField = 
  | 'applicationName'
  | 'subsystemName'
  | 'severity';

export type SeverityValue = 
  | 'debug'
  | 'verbose'
  | 'info'
  | 'warning'
  | 'error'
  | 'critical';

export type JsonExtractDestinationField = 
  | 'category'
  | 'className'
  | 'methodName'
  | 'severity'
  | 'threadId';

export type TimestampFormatStandard = 
  | 'javasdf'
  | 'golang'
  | 'strftime'
  | 'secondsts'
  | 'millits'
  | 'microts'
  | 'nanots';

export interface RuleMatcher {
  field: RuleMatcherField;
  constraint: string;
}

export interface ParsingRule {
  id?: string;
  name: string;
  description?: string;
  enabled?: boolean;
  type: ParsingRuleType;
  rule?: string; // Not required for removefields and timestampextract
  sourceField?: string;
  destinationField?: string;
  replaceNewVal?: string; // Required for replace type
  timeFormat?: string; // Required for timestampextract
  formatStandard?: TimestampFormatStandard; // Required for timestampextract
  order?: number;
  ruleMatchers?: RuleMatcher[] | null;
  keepBlockedLogs?: boolean;
  deleteSource?: boolean;
  escapedValue?: boolean;
  overrideDest?: boolean;
}

export interface RulesGroup {
  id?: string;
  name?: string;
  order: number;
  enabled?: boolean;
  rules: ParsingRule[];
  type?: string;
}

export interface RuleGroup {
  id?: string;
  name: string;
  description?: string;
  enabled?: boolean;
  creator?: string;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
  ruleMatchers?: RuleMatcher[] | null;
  rulesGroups: RulesGroup[];
  hidden?: boolean;
}

export interface CreateRuleGroupRequest {
  name: string;
  description?: string;
  enabled?: boolean;
  creator?: string;
  order?: number;
  ruleMatchers?: RuleMatcher[];
  rulesGroups: RulesGroup[];
}

export interface GetAllRulesResponse {
  companyRulesData: RuleGroup[];
}

export interface ExportRulesRequest {
  companyRulesData: RuleGroup[];
}

// Legacy API types
export interface LegacyRuleGroup {
  id?: string;
  name: string;
  description?: string;
  enabled?: boolean;
  creator?: string;
  order?: number;
  createdAt?: string;
  ruleMatchers: RuleMatcher[];
  rulesGroups?: any[];
}

export interface LegacyRule {
  type: ParsingRuleType;
  description?: string;
  enabled?: boolean;
  name: string;
  rule?: string;
  sourceField?: string;
  destinationField?: string;
  replaceNewVal?: string;
  timeFormat?: string;
  formatStandard?: TimestampFormatStandard;
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