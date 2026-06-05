import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const MOCK_SUMMARY = `## Company Overview

*   **Business Description:** KPMG in Singapore is a member firm of the global KPMG network of independent professional services firms. It provides high-value professional services to local and international clients.
*   **Industry Vertical:** Business Consulting, Professional Services, and Capital Markets.
*   **Company Size:** 1,001–5,000 employees in Singapore; part of a larger global organization of 276,000 partners and employees.
*   **Key Products/Services:** Specialist services are organized into Audit (including Tech Assurance, US Audit), Tax (including ESG Reporting, domestic and international tax regulations), and Advisory/Consulting (including Cyber, Risk, Tech Consulting, Corporate Transformation). It also provides Deal Advisory services including Capital Markets Advisory, Corporate Finance, and Infrastructure Advisory.
*   **Business Model:** Limited Liability Partnership (LLP) registered in Singapore, operating a B2B professional services model.
*   **Market Position:** KPMG is one of the leading global professional services networks, advising major corporations, governments, and financial institutions.

## Recent Developments

*   **Singapore Capital Markets Focus (Q1 2025):** KPMG published viewpoints on revitalizing Singapore's capital markets, focusing on tax incentives such as the Corporate Income Tax (CIT) rebate and the 5% concessionary tax rate for listed fund managers to attract global listings.
*   **Budget 2025 Proposal (January 2025):** Collaborated with the Singapore Institute of Directors (SID) to release "Designing Singapore's future together: Ready, refreshed and resilient for tomorrow" to attract talent and leverage capital markets for growth.
*   **Agentic AI & Operations Launch:** KPMG introduced "Global Business Services with KPMG Velocity," enabled by ServiceNow. This platform focuses on transforming operations using agentic AI.
*   **International Tax Implementation (2025):** KPMG Singapore is currently implementing the Income Inclusion Rule (IIR) and the Qualified Domestic Minimum Top-up Tax (QDMTT) to guide multinational enterprise (MNE) groups through compliance shifts.
*   **Global Restructuring:** KPMG is initiating plans to merge dozens of its national partnerships globally in an effort to streamline operations, cut costs, and boost market reach.

## Key Decision Makers

*   **Sze Yeng Lee:** Singapore Representative (Global Leadership/ASPAC Region Team)
*   **Martin Sheppard:** Chair, KPMG’s ASPAC Region
*   **Tim Walsh:** Global Leadership Team / U.S. Chair and CEO
*   **Atif Zaim:** U.S. Managing Principal-elect (involved in global strategy/technology investments)

## Strategic Priorities & Pain Points

*   **Revitalizing Capital Markets:** A key challenge is encouraging global businesses to list in Singapore. KPMG is highly focused on helping clients leverage tax incentives (CIT rebates) and building out value-creation frameworks.
*   **Navigating Complex Tax Reforms:** The deployment of IIR and QDMTT in 2025 poses a resource-heavy transition for both KPMG and its MNE clients. Standardizing compliance for these complex regulations is a continuous priority.
*   **Scaling AI & Operational Automation:** Driven by the ServiceNow-enabled "KPMG Velocity" launch, the firm is prioritizing global business services powered by agentic AI to lower operational costs and improve execution speed.
*   **Consolidation and Structural Efficiency:** Merging national partnerships represents a major operational and cultural alignment priority to eliminate silos across geographic borders.

## Sales Intelligence

### Recommended Outreach Angle
Approach KPMG’s Capital Markets Advisory or Tech Consulting leadership with solutions that assist in accelerating compliance workflows (specifically for the IIR/QDMTT updates in 2025) or scale their newly announced ServiceNow-enabled agentic AI capabilities.

### Specific Talking Points
*   **Reference their Capital Markets Viewpoints:** "I recently read KPMG’s viewpoint on revitalizing Singapore's capital markets and your joint Budget 2025 proposal with SID. If you are helping clients scale their listing readiness amidst new CIT rebates, our platform can streamline..."
*   **Leverage the ServiceNow partnership & Agentic AI:** "Given KPMG's recent global launch of 'KPMG Velocity' powered by ServiceNow, we help enterprise firms integrate custom operational tools that complement ServiceNow to maximize the ROI of agentic AI workflows."
*   **Address 2025 International Tax Compliance updates:** "With KPMG Singapore actively helping MNEs implement the Income Inclusion Rule (IIR) and QDMTT in 2025, our technology can help your advisory teams automate tax data collection, minimizing manual risk assessment cycles."

## Quick Reference

*   **Industry:** Business Consulting and Services
*   **Estimated Size:** 1,001 - 5,000 employees (Singapore)
*   **Headquarters/Region:** 12 Marina View #15-01, Asia Square Tower 2, Singapore, 018961
*   **Key Competitors:** *Not available in research data* (Traditional Big Four competitors are not explicitly named in the provided sources)
*   **Sources:**
    *   https://kpmg.com/sg/en/media/press-releases/2025/03/4-faqs-on-revitalising-singapore-s-capital-markets--kpmg-s-viewp.html
    *   https://assets.kpmg.com/content/dam/kpmg/sg/pdf/2024/08/our-impact-plan-2024-singapore.pdf
    *   https://sg.linkedin.com/company/kpmg-singapore`;


export async function POST(request: Request) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { company_name, division, region, prospect_id, refresh } = body;

  let finalProspectId = prospect_id;

  // Create or fetch prospect record
  if (!refresh) {
    if (!company_name) {
      return NextResponse.json({ error: "company_name is required" }, { status: 400 });
    }

    const { data: prospect, error: insertError } = await supabase
      .from("prospects")
      .insert({ company_name, division: division || null, region: region || null, created_by: user.id })
      .select("id")
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    finalProspectId = prospect.id;
  }

  if (process.env.MOCK_N8N === "true") {
    // Dev mode: skip n8n, write the cached summary instantly as completed.
    // Set MOCK_N8N=true in .env.local to use this path; remove it for production.
    const { error: mockError } = await supabase
      .from("research_results")
      .insert({
        prospect_id: finalProspectId,
        source: "n8n_agent",
        raw_data: { mock: true },
        summary: MOCK_SUMMARY,
        status: "completed",
      });
    if (mockError) {
      return NextResponse.json({ error: mockError.message }, { status: 500 });
    }
    return NextResponse.json({ prospectId: finalProspectId });
  }

  // Create a pending research record
  const { error: researchError } = await supabase
    .from("research_results")
    .insert({
      prospect_id: finalProspectId,
      source: "n8n_agent",
      raw_data: {},
      status: "pending",
    });

  if (researchError) {
    return NextResponse.json({ error: researchError.message }, { status: 500 });
  }

  // Fire n8n webhook (non-blocking)
  const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
  if (n8nWebhookUrl) {
    fetch(n8nWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prospect_id: finalProspectId, company_name, division, region }),
    }).catch(() => {
      // n8n failure is non-fatal — research_results row stays "pending"
    });
  }

  return NextResponse.json({ prospectId: finalProspectId });
}
