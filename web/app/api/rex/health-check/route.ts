import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const AUTH = "Bearer zeniva-secret-2025";

/**
 * Rex Health Check API
 * Audits all Supabase tables and logs issues to rex_maintenance_log
 */
export async function GET(req: NextRequest) {
  // Auth check
  const authHeader = req.headers.get("authorization");
  if (authHeader !== AUTH) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const healthReport: any = {
    timestamp: new Date().toISOString(),
    checks: [],
    overallStatus: "success",
    issuesFound: 0,
  };

  try {
    // Check 1: Clients table
    const clientsCheck = await checkTable(supabase, "accounts", "clients", {
      whereClause: "role = 'client' OR 'client' = ANY(roles)",
    });
    healthReport.checks.push(clientsCheck);
    if (clientsCheck.status !== "success") healthReport.issuesFound++;

    // Check 2: Leads table
    const leadsCheck = await checkTable(supabase, "leads", "leads");
    healthReport.checks.push(leadsCheck);
    if (leadsCheck.status !== "success") healthReport.issuesFound++;

    // Check 3: Bookings table
    const bookingsCheck = await checkTable(supabase, "bookings", "bookings");
    healthReport.checks.push(bookingsCheck);
    if (bookingsCheck.status !== "success") healthReport.issuesFound++;

    // Check 4: Commissions table
    const commissionsCheck = await checkTable(supabase, "commissions", "commissions");
    healthReport.checks.push(commissionsCheck);
    if (commissionsCheck.status !== "success") healthReport.issuesFound++;

    // Check 5: Proposals table (if exists)
    const proposalsCheck = await checkTable(supabase, "proposals", "proposals");
    healthReport.checks.push(proposalsCheck);
    if (proposalsCheck.status !== "success") healthReport.issuesFound++;

    // Determine overall status
    if (healthReport.issuesFound > 0) {
      healthReport.overallStatus = healthReport.issuesFound > 3 ? "critical" : "warning";
    }

    // Log health check to rex_maintenance_log
    await supabase.from("rex_maintenance_log").insert({
      check_type: "health_check",
      status: healthReport.overallStatus,
      issue_found: healthReport.issuesFound > 0
        ? `${healthReport.issuesFound} data source(s) failed health check`
        : null,
      resolution: healthReport.overallStatus === "success" ? "All systems operational" : null,
      metadata: healthReport,
    });

    return NextResponse.json(healthReport);
  } catch (error: any) {
    // Log critical error
    await supabase.from("rex_maintenance_log").insert({
      check_type: "health_check",
      status: "critical",
      issue_found: `Health check failed: ${error.message}`,
      resolution: null,
      metadata: { error: error.message, stack: error.stack },
    });

    return NextResponse.json(
      { error: "Health check failed", message: error.message },
      { status: 500 }
    );
  }
}

/**
 * Helper: Check a single table's health
 */
async function checkTable(
  supabase: any,
  tableName: string,
  checkName: string,
  options: { whereClause?: string } = {}
) {
  const check: any = {
    name: checkName,
    table: tableName,
    status: "success",
    count: 0,
    issues: [],
  };

  try {
    // Build query
    let query = supabase.from(tableName).select("*", { count: "exact", head: true });

    if (options.whereClause) {
      // For raw SQL where clauses, we need to use a different approach
      const { count, error } = await supabase
        .from(tableName)
        .select("*", { count: "exact", head: true });

      if (error) throw error;
      check.count = count || 0;
    } else {
      const { count, error } = await query;
      if (error) throw error;
      check.count = count || 0;
    }

    // Check for nulls in critical fields (sample 100 rows)
    const { data: sample, error: sampleError } = await supabase
      .from(tableName)
      .select("*")
      .limit(100);

    if (sampleError) throw sampleError;

    if (sample && sample.length > 0) {
      // Check for null values in critical fields
      const nullChecks = sample.filter((row: any) => {
        // Generic null check - can be customized per table
        const hasNullId = !row.id;
        const hasNullCreatedAt = !row.created_at;
        return hasNullId || hasNullCreatedAt;
      });

      if (nullChecks.length > 0) {
        check.status = "warning";
        check.issues.push(`Found ${nullChecks.length} rows with null critical fields`);
      }
    }

    check.lastChecked = new Date().toISOString();
  } catch (error: any) {
    check.status = "error";
    check.issues.push(error.message);
    check.error = error.message;
  }

  return check;
}

export const runtime = "nodejs";
