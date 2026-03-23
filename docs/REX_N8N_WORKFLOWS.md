# Rex Platform Engineer - n8n Automation Workflows

## Prerequisites
1. Run Supabase migration first:
   ```bash
   cd zeniva-web
   supabase db push
   # Or manually run: supabase/migrations/20260323000000_create_rex_maintenance_log.sql
   ```

2. Set up Slack webhook for Rex alerts

---

## Workflow #1: Rex 6am Daily Maintenance

**Name:** `Rex - Daily 6am Health Check`
**Schedule:** Every day at 6:00 AM EST

### Nodes:

1. **Schedule Trigger**
   - Type: `Schedule Trigger`
   - Cron: `0 6 * * *` (6:00 AM daily)

2. **Health Check API Call**
   - Type: `HTTP Request`
   - Method: `GET`
   - URL: `https://www.zenivatravel.com/api/rex/health-check`
   - Headers:
     - `Authorization`: `Bearer zeniva-secret-2025`
   - Output: Store as `healthReport`

3. **Check for Issues**
   - Type: `IF`
   - Condition: `{{ $json.issuesFound }} > 0`

4a. **Send Alert (if issues found)**
   - Type: `Slack` / `HTTP Request` (webhook)
   - Channel: Alexandre's main channel
   - Message:
     ```
     ⚠️ Rex Daily Check — {{ $now.toFormat('yyyy-MM-dd') }}

     Issues Found: {{ $json.issuesFound }}

     Failed Checks:
     {{ $json.checks.filter(c => c.status !== 'success').map(c => `• ${c.name}: ${c.issues.join(', ')}`).join('\n') }}

     Full report: https://www.zenivatravel.com/agent/control-tower
     ```

4b. **Send Success (if no issues)**
   - Type: `Slack` / `HTTP Request` (webhook)
   - Channel: Alexandre's main channel
   - Message:
     ```
     ✅ Rex Daily Check — {{ $now.toFormat('yyyy-MM-dd') }}

     All systems nominal
     0 issues found
     ```

5. **Refresh Dashboard Stats**
   - Type: `HTTP Request`
   - Method: `GET`
   - URL: `https://www.zenivatravel.com/api/rex/dashboard-stats`
   - Headers:
     - `Authorization`: `Bearer zeniva-secret-2025`
   - Purpose: Trigger cache refresh

6. **Check Failed n8n Workflows (last 24h)**
   - Type: `n8n` internal node or API call
   - Query: Get all failed executions from last 24h
   - Action: Restart failed workflows

---

## Workflow #2: Rex 11pm Nightly Validation

**Name:** `Rex - Nightly 11pm Data Validation`
**Schedule:** Every day at 11:00 PM EST

### Nodes:

1. **Schedule Trigger**
   - Type: `Schedule Trigger`
   - Cron: `0 23 * * *` (11:00 PM daily)

2. **Validate Bookings (no nulls)**
   - Type: `Supabase`
   - Operation: `Select rows`
   - Table: `bookings`
   - Filters: `created_at >= today AND (id IS NULL OR total_price IS NULL OR status IS NULL)`
   - Store count of invalid rows

3. **Validate Commissions (integrity check)**
   - Type: `Supabase`
   - Operation: `Select rows`
   - Table: `commissions`
   - Custom query:
     ```sql
     SELECT * FROM commissions
     WHERE created_at::date = CURRENT_DATE
     AND (
       agent_commission + influencer_commission + platform_commission != amount
       OR agent_commission < 0
       OR status IS NULL
     )
     ```

4. **Check Data Integrity**
   - Type: `IF`
   - Condition: Check if any validation queries returned rows

5a. **Send Alert (if issues found)**
   - Type: `Slack`
   - Message:
     ```
     🚨 Rex Nightly Validation — {{ $now.toFormat('yyyy-MM-dd HH:mm') }}

     Data integrity issues detected:
     • {{ $node["Validate Bookings"].json.length }} bookings with null fields
     • {{ $node["Validate Commissions"].json.length }} commission splits with errors

     Action Required: Review Supabase tables
     ```

5b. **Send Success**
   - Type: `Slack`
   - Message:
     ```
     ✅ Rex Nightly Validation — {{ $now.toFormat('yyyy-MM-dd HH:mm') }}

     Data integrity check passed
     All commission splits validated
     ```

6. **Log to rex_maintenance_log**
   - Type: `Supabase`
   - Operation: `Insert row`
   - Table: `rex_maintenance_log`
   - Data:
     ```json
     {
       "check_type": "nightly_11pm",
       "status": "{{ $json.issuesFound > 0 ? 'warning' : 'success' }}",
       "issue_found": "{{ $json.summary }}",
       "metadata": {
         "invalid_bookings": "{{ $node['Validate Bookings'].json.length }}",
         "invalid_commissions": "{{ $node['Validate Commissions'].json.length }}"
       }
     }
     ```

---

## Workflow #3: Rex Real-time Subscription Monitor

**Name:** `Rex - Real-time Subscription Health`
**Schedule:** Every 15 minutes

### Nodes:

1. **Schedule Trigger**
   - Type: `Schedule Trigger`
   - Cron: `*/15 * * * *` (every 15 min)

2. **Check Supabase Connection**
   - Type: `Supabase`
   - Operation: `Select rows`
   - Table: `rex_maintenance_log`
   - Limit: 1
   - Purpose: Verify Supabase is responding

3. **Connection Check**
   - Type: `IF`
   - Condition: `{{ $json.error }} !== undefined`

4. **Send Critical Alert (if down)**
   - Type: `Slack`
   - Message:
     ```
     🔴 CRITICAL: Supabase connection lost

     Rex detected connection failure at {{ $now.toISO() }}
     Dashboard may show stale data

     Auto-reconnect in progress...
     ```

5. **Log Downtime**
   - Type: `HTTP Request` (if Supabase is down, use external logging)
   - Backup: Write to local file or external monitoring service

---

## Setup Instructions

### Step 1: Import to n8n
1. Open n8n at your instance URL
2. Click "Add workflow" → "Import from file"
3. Create each workflow using the node configurations above

### Step 2: Configure Credentials
- **Supabase**: Add Supabase credentials with service role key
- **Slack**: Add webhook URL or bot token
- **HTTP Request**: Set authorization header `Bearer zeniva-secret-2025`

### Step 3: Activate Workflows
- Enable all 3 workflows
- Set timezone to EST
- Test each workflow manually first

### Step 4: Monitor
- Check n8n execution history daily
- Rex logs will appear in `rex_maintenance_log` table
- Slack alerts will notify Alexandre of any issues

---

## Testing

Test each workflow manually:

```bash
# Test health check API
curl -H "Authorization: Bearer zeniva-secret-2025" \
  https://www.zenivatravel.com/api/rex/health-check

# Test dashboard stats API
curl -H "Authorization: Bearer zeniva-secret-2025" \
  https://www.zenivatravel.com/api/rex/dashboard-stats
```

Expected response: JSON with health status and real metrics.

---

## Troubleshooting

**Q: Dashboard still shows $0**
A: Check browser console for errors, clear localStorage, hard refresh

**Q: Rex workflows not running**
A: Check n8n execution history, verify schedule trigger is active

**Q: No Slack alerts**
A: Verify webhook URL is correct, check n8n workflow execution logs

**Q: "Unauthorized" errors**
A: Ensure `Authorization: Bearer zeniva-secret-2025` header is present
