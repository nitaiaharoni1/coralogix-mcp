#!/usr/bin/env node

/**
 * Direct test for Coralogix billing and quota functionality
 */

import { CoralogixClient } from './dist/src/services/coralogix-client.js';

// Set credentials
const API_KEY = 'cxup_R10n62zZqlRVy8gcEZUlnY8qIC8Vvx';
const DOMAIN = 'eu2.coralogix.com';

async function testBilling() {
  console.log('🚀 Testing Coralogix Billing API');
  console.log('API Key:', API_KEY.substring(0, 10) + '...');
  console.log('Domain:', DOMAIN);
  console.log('=' * 50);

  try {
    const client = new CoralogixClient(API_KEY, DOMAIN);
    
    console.log('\n📊 Testing Data Usage API...');
    console.log('-'.repeat(30));
    
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const dataUsageRequest = {
      resolution: '1d',
      dateRange: {
        fromDate: weekAgo.toISOString(),
        toDate: now.toISOString()
      }
    };
    
    console.log('Request:', JSON.stringify(dataUsageRequest, null, 2));
    
    const usageData = await client.getDataUsage(dataUsageRequest);
    console.log('✅ Data Usage Response:');
    console.log(JSON.stringify(usageData, null, 2));
    
    console.log('\n💰 Testing Quota Info...');
    console.log('-'.repeat(30));
    
    const quotaInfo = await client.getQuotaInfo();
    console.log('✅ Quota Info Response:');
    console.log(JSON.stringify(quotaInfo, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Data:', error.response.data);
    }
  }
}

testBilling().catch(console.error); 