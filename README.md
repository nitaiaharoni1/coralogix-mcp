# Coralogix MCP Server

A Model Context Protocol (MCP) server for integrating with Coralogix APIs. This server provides comprehensive tools for querying logs, managing alerts, dashboards, incidents, SLOs, and monitoring data usage.

## Features

### 🔍 Query & Search Tools
- **DataPrime Queries**: Execute DataPrime queries on logs, metrics, and traces
- **Lucene Queries**: Perform Lucene-based searches on indexed logs  
- **Background Queries**: Submit long-running queries for extensive analytical tasks
- **Query Management**: Check status, retrieve results, and cancel background queries

### 🚨 Alert Management
- **Alert Definitions**: Create, update, delete, and manage alert definitions
- **Alert Types**: Support for logs immediate, threshold, anomaly, metric, and flow alerts
- **Alert Control**: Enable/disable alerts and configure priorities
- **Alert Monitoring**: List and track all alert definitions with their status

### 📊 Dashboard Management
- **Dashboard Operations**: Create, read, update, and delete dashboards
- **Dashboard Catalog**: Browse and organize dashboards by folders
- **Dashboard Configuration**: Set time frames, add descriptions, and manage locks
- **Dashboard Visualization**: Support for widgets, variables, and filters

### 🔥 Incident Management
- **Incident Tracking**: List and filter incidents by status, severity, and time
- **Incident Actions**: Acknowledge, resolve, and close incidents
- **Incident Details**: Get comprehensive incident information and history
- **Incident Filtering**: Filter by application, subsystem, and custom criteria

### 🎯 Service Level Objectives (SLOs)
- **SLO Management**: Create, update, and delete SLOs
- **SLO Monitoring**: Track service reliability and performance targets
- **SLO Configuration**: Set target thresholds and time frames
- **SLO Reporting**: Monitor SLO compliance and performance

### 💰 Data Usage & Billing
- **Usage Analytics**: Get detailed data usage information
- **Quota Monitoring**: Track quota consumption and limits
- **Cost Optimization**: Monitor data processing and storage costs

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd coralogix-mcp
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env
```

Edit `.env` with your Coralogix credentials:
```
CORALOGIX_API_KEY=your_api_key_here
CORALOGIX_DOMAIN=your_domain_here
```

4. Build the project:
```bash
npm run build
```

5. Start the server:
```bash
npm start
```

## Environment Variables

- `CORALOGIX_API_KEY`: Your Coralogix API key
- `CORALOGIX_DOMAIN`: Your Coralogix domain (e.g., `coralogix.com`, `coralogix.us`, `eu2.coralogix.com`)

## Supported Domains

- `coralogix.com` (US)
- `coralogix.us` (US2)  
- `cx498.coralogix.com` (EU)
- `eu2.coralogix.com` (EU2)
- `coralogix.in` (India)
- `coralogixsg.com` (Singapore)
- `ap3.coralogix.com` (Asia Pacific)

## Available Tools

### Query Tools

#### `query_dataprime`
Execute DataPrime queries for logs, metrics, and traces.

**Parameters:**
- `query` (required): DataPrime query string
- `tier`: Data tier (`TIER_FREQUENT_SEARCH` or `TIER_ARCHIVE`)
- `limit`: Maximum results (default: 2000)
- `startDate`: Start date (ISO 8601)
- `endDate`: End date (ISO 8601)

**Example:**
```
query_dataprime({
  "query": "source logs | filter severity == 'ERROR' | limit 100",
  "tier": "TIER_FREQUENT_SEARCH",
  "startDate": "2023-05-29T11:20:00.00Z",
  "endDate": "2023-05-29T11:30:00.00Z"
})
```

#### `query_lucene`
Execute Lucene queries on indexed logs.

**Parameters:**
- `query` (required): Lucene query string  
- `tier`: Data tier
- `limit`: Maximum results
- `startDate`: Start date
- `endDate`: End date

**Example:**
```
query_lucene({
  "query": "level:ERROR AND NOT env:staging",
  "limit": 50
})
```

#### `submit_background_query`
Submit long-running background queries.

**Parameters:**
- `query` (required): Query string
- `syntax` (required): Query syntax (`QUERY_SYNTAX_DATAPRIME` or `QUERY_SYNTAX_LUCENE`)
- `startDate`: Start date
- `endDate`: End date

### Alert Management Tools

#### `list_alerts`
List all alert definitions.

#### `create_alert`
Create a new alert definition.

**Parameters:**
- `name` (required): Alert name
- `priority` (required): Priority level (P1-P5)
- `type` (required): Alert type
- `description`: Alert description
- `enabled`: Enable immediately (default: true)

**Example:**
```
create_alert({
  "name": "High Error Rate Alert",
  "priority": "ALERT_DEF_PRIORITY_P2",
  "type": "ALERT_DEF_TYPE_LOGS_THRESHOLD",
  "description": "Alert when error rate exceeds threshold"
})
```

#### `get_alert`
Get alert details by ID.

#### `update_alert`
Update an existing alert.

#### `delete_alert`
Delete an alert definition.

#### `enable_alert`
Enable or disable an alert.

### Dashboard Management Tools

#### `list_dashboards`
List all dashboards with folder organization.

#### `create_dashboard`
Create a new dashboard.

**Parameters:**
- `name` (required): Dashboard name
- `description`: Dashboard description
- `relativeTimeFrame`: Default time frame (default: "24h")
- `isLocked`: Lock dashboard (default: false)

**Example:**
```
create_dashboard({
  "name": "Application Performance",
  "description": "Monitor key application metrics",
  "relativeTimeFrame": "1h"
})
```

#### `get_dashboard`
Get dashboard details by ID.

#### `update_dashboard`
Update dashboard properties.

#### `delete_dashboard`
Delete a dashboard.

### Incident Management Tools

#### `list_incidents`
List incidents with filtering options.

**Parameters:**
- `status`: Filter by status (array)
- `severity`: Filter by severity (array)
- `state`: Filter by state (array)
- `applicationName`: Filter by applications (array)
- `startTime`: Start time filter
- `endTime`: End time filter
- `pageSize`: Results per page (default: 50)

**Example:**
```
list_incidents({
  "status": ["INCIDENT_STATUS_TRIGGERED"],
  "severity": ["INCIDENT_SEVERITY_CRITICAL"],
  "pageSize": 25
})
```

#### `get_incident`
Get detailed incident information.

#### `acknowledge_incidents`
Acknowledge incidents.

**Parameters:**
- `incidentIds` (required): Array of incident IDs

#### `resolve_incidents`
Mark incidents as resolved.

#### `close_incidents`
Close incidents.

### SLO Management Tools

#### `list_slos`
List all Service Level Objectives.

#### `create_slo`
Create a new SLO.

**Parameters:**
- `name` (required): SLO name
- `targetThresholdPercentage` (required): Target percentage
- `sloTimeFrame`: Time frame (7/14/21/28 days)
- `description`: SLO description
- `creator`: Creator name/email

**Example:**
```
create_slo({
  "name": "API Response Time SLO",
  "targetThresholdPercentage": 99.9,
  "sloTimeFrame": "SLO_TIME_FRAME_28_DAYS",
  "description": "99.9% of API requests should respond within 200ms"
})
```

#### `get_slo`
Get SLO details by ID.

#### `update_slo`
Update SLO configuration.

#### `delete_slo`
Delete an SLO.

### Data Usage Tools

#### `get_data_usage`
Get detailed data usage information.

#### `get_current_quota`
Get current quota and usage information.

## Development

### Testing

Run the test suite:
```bash
npm test
```

Run E2E tests:
```bash
npm run test:e2e
```

### Building

Build the TypeScript code:
```bash
npm run build
```

### Linting

Run ESLint:
```bash
npm run lint
```

## API Coverage

This MCP server implements the most important Coralogix APIs:

- ✅ **Query APIs** - DataPrime, Lucene, background queries
- ✅ **Alert Definitions** - Full CRUD operations
- ✅ **Dashboard Management** - Create, read, update, delete
- ✅ **Incident Management** - List, acknowledge, resolve, close  
- ✅ **SLO Management** - Full lifecycle management
- ✅ **Data Usage** - Usage analytics and quota monitoring
- 🔄 **Additional APIs** - More APIs can be added based on requirements

## Error Handling

The server includes comprehensive error handling:

- Authentication errors (401, 403)
- Rate limiting (429) 
- Bad requests (400)
- Network timeouts
- API-specific error responses

All errors are returned with descriptive messages to help diagnose issues.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

[Add your license information here]

## Support

For issues and questions:
- Check the [Issues](./issues) page
- Review the [Coralogix API Documentation](https://coralogix.com/docs/api/)
- Contact the development team 