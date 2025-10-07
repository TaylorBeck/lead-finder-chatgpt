"""Business Lead Finder MCP Server

This server implements the Model Context Protocol to provide AI-powered lead
generation tools for ChatGPT. It follows the OpenAI Apps SDK patterns with
FastMCP for easy tool registration and widget management.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from typing import Any, Dict, List

import mcp.types as types
from mcp.server.fastmcp import FastMCP
from pydantic import BaseModel, Field, ValidationError

# Widget definitions
@dataclass(frozen=True)
class LeadFinderWidget:
    """Widget configuration for a lead finder tool."""
    identifier: str
    title: str
    template_uri: str
    invoking: str
    invoked: str
    html: str
    response_text: str


widgets: List[LeadFinderWidget] = [
    LeadFinderWidget(
        identifier="find-business-leads",
        title="Find Business Leads",
        template_uri="ui://widget/lead-finder.html",
        invoking="Searching for high-quality business leads",
        invoked="Found business leads",
        html=(
            '<div id="lead-finder-root"></div>\n'
            '<link rel="stylesheet" href="http://localhost:4444/lead-finder.css">\n'
            '<script type="module" src="http://localhost:4444/lead-finder.js"></script>'
        ),
        response_text="Found business leads with AI-powered analysis!",
    ),
    LeadFinderWidget(
        identifier="analyze-lead-trends",
        title="Analyze Lead Trends",
        template_uri="ui://widget/lead-dashboard.html",
        invoking="Generating analytics dashboard",
        invoked="Dashboard ready",
        html=(
            '<div id="lead-dashboard-root"></div>\n'
            '<link rel="stylesheet" href="http://localhost:4444/lead-dashboard.css">\n'
            '<script type="module" src="http://localhost:4444/lead-dashboard.js"></script>'
        ),
        response_text="Analytics dashboard generated!",
    ),
    LeadFinderWidget(
        identifier="export-to-crm",
        title="Export to CRM",
        template_uri="ui://widget/crm-export.html",
        invoking="Preparing CRM export",
        invoked="Export ready",
        html=(
            '<div id="crm-export-root"></div>\n'
            '<link rel="stylesheet" href="http://localhost:4444/crm-export.css">\n'
            '<script type="module" src="http://localhost:4444/crm-export.js"></script>'
        ),
        response_text="CRM export prepared!",
    ),
]

MIME_TYPE = "text/html+skybridge"

WIDGETS_BY_ID: Dict[str, LeadFinderWidget] = {w.identifier: w for w in widgets}
WIDGETS_BY_URI: Dict[str, LeadFinderWidget] = {w.template_uri: w for w in widgets}


# Input schemas
class LeadSearchInput(BaseModel):
    """Input schema for find_business_leads tool."""
    search_terms: List[str] = Field(..., description="Keywords to search for")
    industry_focus: str | None = Field(None, description="Industry to focus on")
    intent_keywords: List[str] = Field(
        default=["looking for", "need", "seeking", "want to buy"],
        description="Intent signals to look for"
    )
    platforms: List[str] = Field(
        default=["reddit", "twitter", "linkedin"],
        description="Social platforms to search"
    )
    geographic_filter: str | None = Field(None, description="Geographic location")
    company_size_filter: str | None = Field(None, description="Company size filter")
    max_leads: int = Field(default=50, description="Maximum leads to return")


class EnrichmentInput(BaseModel):
    """Input schema for enrich_prospect_data tool."""
    prospect_ids: List[str] = Field(..., description="IDs of prospects to enrich")
    enrichment_level: str = Field(
        default="standard",
        description="Enrichment level: basic, standard, premium"
    )
    include_contact_info: bool = Field(default=True)
    include_company_insights: bool = Field(default=True)


class CRMExportInput(BaseModel):
    """Input schema for export_to_crm tool."""
    lead_ids: List[str] = Field(..., description="Lead IDs to export")
    crm_system: str = Field(..., description="CRM: salesforce, hubspot, pipedrive")
    create_tasks: bool = Field(default=True, description="Create follow-up tasks")
    set_reminders: bool = Field(default=True, description="Set reminders")


# Initialize FastMCP server
mcp = FastMCP(
    name="business-lead-finder",
    sse_path="/mcp",
    message_path="/mcp/messages",
    stateless_http=True,
)


# Mock data generator
def generate_mock_leads(
    search_terms: List[str],
    industry_focus: str | None = None,
    max_leads: int = 50
) -> List[Dict[str, Any]]:
    """Generate mock lead data for demonstration."""
    mock_leads = [
        {
            "id": "lead-001",
            "prospect_name": "Sarah Johnson",
            "company": "TechCorp Solutions",
            "title": "VP of Marketing",
            "industry": "Technology",
            "location": "San Francisco, CA",
            "source_platform": "LinkedIn",
            "source_url": "https://linkedin.com/posts/sarah-johnson",
            "source_content": f"Looking for a great {search_terms[0] if search_terms else 'solution'} to streamline our marketing operations",
            "lead_score": 0.85,
            "score_breakdown": {
                "intent_strength": 0.9,
                "company_fit": 0.8,
                "role_relevance": 0.85,
                "engagement_level": 0.8,
                "timing_signals": 0.9
            },
            "intent_analysis": {
                "has_intent": True,
                "confidence": 0.85,
                "intent_level": "high",
                "urgency_level": "high",
                "solution_seeking": search_terms[:2],
                "pain_points": ["manual processes", "data silos"]
            },
            "contact_info": {
                "email": "sarah.johnson@techcorp.com",
                "email_confidence": 0.9,
                "phone": "+1-555-0123",
                "social_profiles": {
                    "linkedin": "https://linkedin.com/in/sarah-johnson",
                    "twitter": "@sarahj_tech"
                }
            },
            "company_insights": {
                "industry": "Technology",
                "size": "201-1000",
                "revenue": "$50M-$100M",
                "technologies": ["Salesforce", "HubSpot", "Slack"],
                "recent_news": ["Series B funding", "New product launch"]
            }
        },
        {
            "id": "lead-002",
            "prospect_name": "Michael Chen",
            "company": "GrowthCo Inc",
            "title": "Head of Sales",
            "industry": "SaaS",
            "location": "Austin, TX",
            "source_platform": "Reddit",
            "source_url": "https://reddit.com/r/sales/comments/xyz",
            "source_content": f"Need help with {search_terms[0] if search_terms else 'our processes'}",
            "lead_score": 0.78,
            "score_breakdown": {
                "intent_strength": 0.8,
                "company_fit": 0.75,
                "role_relevance": 0.8,
                "engagement_level": 0.7,
                "timing_signals": 0.8
            },
            "intent_analysis": {
                "has_intent": True,
                "confidence": 0.78,
                "intent_level": "medium",
                "urgency_level": "medium",
                "solution_seeking": search_terms[:2],
                "pain_points": ["low conversion rates", "manual prospecting"]
            },
            "contact_info": {
                "email": "michael.chen@growthco.com",
                "email_confidence": 0.85,
                "phone": "+1-555-0456",
                "social_profiles": {
                    "linkedin": "https://linkedin.com/in/michael-chen",
                    "twitter": "@mchen_sales"
                }
            },
            "company_insights": {
                "industry": "SaaS",
                "size": "51-200",
                "revenue": "$10M-$50M",
                "technologies": ["Pipedrive", "Zoom", "Calendly"],
                "recent_news": ["Team expansion", "Product update"]
            }
        },
        {
            "id": "lead-003",
            "prospect_name": "Emily Rodriguez",
            "company": "HealthTech Solutions",
            "title": "Marketing Director",
            "industry": "Healthcare",
            "location": "Boston, MA",
            "source_platform": "Twitter",
            "source_url": "https://twitter.com/emily_health/status/123",
            "source_content": f"Seeking recommendations for {search_terms[0] if search_terms else 'tools'}",
            "lead_score": 0.72,
            "score_breakdown": {
                "intent_strength": 0.7,
                "company_fit": 0.75,
                "role_relevance": 0.7,
                "engagement_level": 0.75,
                "timing_signals": 0.65
            },
            "intent_analysis": {
                "has_intent": True,
                "confidence": 0.72,
                "intent_level": "medium",
                "urgency_level": "low",
                "solution_seeking": search_terms[:2],
                "pain_points": ["campaign tracking", "ROI measurement"]
            },
            "contact_info": {
                "email": "emily.rodriguez@healthtech.com",
                "email_confidence": 0.8,
                "phone": "+1-555-0789",
                "social_profiles": {
                    "linkedin": "https://linkedin.com/in/emily-rodriguez",
                    "twitter": "@emily_health"
                }
            },
            "company_insights": {
                "industry": "Healthcare",
                "size": "201-1000",
                "revenue": "$100M-$500M",
                "technologies": ["Epic", "Salesforce", "Tableau"],
                "recent_news": ["FDA approval", "Partnership announcement"]
            }
        }
    ]
    
    # Filter by industry if specified
    if industry_focus:
        mock_leads = [
            lead for lead in mock_leads 
            if lead["industry"].lower() == industry_focus.lower()
        ]
    
    return mock_leads[:max_leads]


def _resource_description(widget: LeadFinderWidget) -> str:
    """Generate resource description for a widget."""
    return f"{widget.title} widget markup"


def _tool_meta(widget: LeadFinderWidget) -> Dict[str, Any]:
    """Generate tool metadata for a widget."""
    return {
        "openai/outputTemplate": widget.template_uri,
        "openai/toolInvocation/invoking": widget.invoking,
        "openai/toolInvocation/invoked": widget.invoked,
        "openai/widgetAccessible": True,
        "openai/resultCanProduceWidget": True,
        "annotations": {
            "destructiveHint": False,
            "openWorldHint": False,
            "readOnlyHint": True,
        }
    }


def _embedded_widget_resource(widget: LeadFinderWidget) -> types.EmbeddedResource:
    """Create an embedded widget resource."""
    return types.EmbeddedResource(
        type="resource",
        resource=types.TextResourceContents(
            uri=widget.template_uri,
            mimeType=MIME_TYPE,
            text=widget.html,
            title=widget.title,
        ),
    )


# MCP Protocol Handlers
@mcp._mcp_server.list_tools()
async def _list_tools() -> List[types.Tool]:
    """List all available tools."""
    tools = []
    
    # Find business leads tool
    tools.append(types.Tool(
        name="find-business-leads",
        title="Find Business Leads",
        description="Find high-quality business leads by analyzing social media conversations for purchase intent signals",
        inputSchema={
            "type": "object",
            "properties": {
                "search_terms": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "Keywords to search for business leads"
                },
                "industry_focus": {
                    "type": "string",
                    "description": "Industry to focus on (optional)"
                },
                "intent_keywords": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "Intent signals to look for",
                    "default": ["looking for", "need", "seeking", "want to buy"]
                },
                "platforms": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "Social platforms to search",
                    "default": ["reddit", "twitter", "linkedin"]
                },
                "geographic_filter": {
                    "type": "string",
                    "description": "Geographic location filter (optional)"
                },
                "company_size_filter": {
                    "type": "string",
                    "description": "Company size filter (optional)"
                },
                "max_leads": {
                    "type": "integer",
                    "description": "Maximum number of leads to return",
                    "default": 50
                }
            },
            "required": ["search_terms"],
            "additionalProperties": False
        },
        _meta=_tool_meta(WIDGETS_BY_ID["find-business-leads"]),
    ))
    
    # Analyze trends tool
    tools.append(types.Tool(
        name="analyze-lead-trends",
        title="Analyze Lead Trends",
        description="Show analytics dashboard with lead trends and metrics",
        inputSchema={
            "type": "object",
            "properties": {
                "time_range": {
                    "type": "string",
                    "description": "Time range: 7d, 30d, 90d",
                    "default": "30d"
                }
            },
            "additionalProperties": False
        },
        _meta=_tool_meta(WIDGETS_BY_ID["analyze-lead-trends"]),
    ))
    
    # Export to CRM tool
    tools.append(types.Tool(
        name="export-to-crm",
        title="Export to CRM",
        description="Export leads to CRM systems like Salesforce, HubSpot, or Pipedrive",
        inputSchema={
            "type": "object",
            "properties": {
                "lead_ids": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "Lead IDs to export"
                },
                "crm_system": {
                    "type": "string",
                    "enum": ["salesforce", "hubspot", "pipedrive"],
                    "description": "Target CRM system"
                },
                "create_tasks": {
                    "type": "boolean",
                    "description": "Create follow-up tasks",
                    "default": True
                },
                "set_reminders": {
                    "type": "boolean",
                    "description": "Set follow-up reminders",
                    "default": True
                }
            },
            "required": ["lead_ids", "crm_system"],
            "additionalProperties": False
        },
        _meta=_tool_meta(WIDGETS_BY_ID["export-to-crm"]),
    ))
    
    return tools


@mcp._mcp_server.list_resources()
async def _list_resources() -> List[types.Resource]:
    """List all widget resources."""
    return [
        types.Resource(
            name=widget.title,
            title=widget.title,
            uri=widget.template_uri,
            description=_resource_description(widget),
            mimeType=MIME_TYPE,
            _meta=_tool_meta(widget),
        )
        for widget in widgets
    ]


@mcp._mcp_server.list_resource_templates()
async def _list_resource_templates() -> List[types.ResourceTemplate]:
    """List all widget resource templates."""
    return [
        types.ResourceTemplate(
            name=widget.title,
            title=widget.title,
            uriTemplate=widget.template_uri,
            description=_resource_description(widget),
            mimeType=MIME_TYPE,
            _meta=_tool_meta(widget),
        )
        for widget in widgets
    ]


async def _handle_read_resource(req: types.ReadResourceRequest) -> types.ServerResult:
    """Handle resource read requests."""
    widget = WIDGETS_BY_URI.get(str(req.params.uri))
    if widget is None:
        return types.ServerResult(
            types.ReadResourceResult(
                contents=[],
                _meta={"error": f"Unknown resource: {req.params.uri}"},
            )
        )

    contents = [
        types.TextResourceContents(
            uri=widget.template_uri,
            mimeType=MIME_TYPE,
            text=widget.html,
            _meta=_tool_meta(widget),
        )
    ]

    return types.ServerResult(types.ReadResourceResult(contents=contents))


async def _call_tool_request(req: types.CallToolRequest) -> types.ServerResult:
    """Handle tool call requests."""
    tool_name = req.params.name
    arguments = req.params.arguments or {}
    
    try:
        if tool_name == "find-business-leads":
            # Validate and parse input
            payload = LeadSearchInput.model_validate(arguments)
            
            # Generate mock leads
            leads = generate_mock_leads(
                search_terms=payload.search_terms,
                industry_focus=payload.industry_focus,
                max_leads=payload.max_leads
            )
            
            # Calculate metrics
            metrics = {
                "total_conversations_analyzed": len(leads) * 3,
                "qualified_leads_found": len(leads),
                "average_lead_score": sum(l["lead_score"] for l in leads) / len(leads) if leads else 0,
                "platform_breakdown": {
                    "LinkedIn": len([l for l in leads if l["source_platform"] == "LinkedIn"]),
                    "Reddit": len([l for l in leads if l["source_platform"] == "Reddit"]),
                    "Twitter": len([l for l in leads if l["source_platform"] == "Twitter"])
                },
                "industry_breakdown": {
                    industry: len([l for l in leads if l["industry"] == industry])
                    for industry in set(l["industry"] for l in leads)
                },
                "geographic_distribution": {
                    location: len([l for l in leads if l["location"] == location])
                    for location in set(l["location"] for l in leads)
                }
            }
            
            widget = WIDGETS_BY_ID["find-business-leads"]
            widget_resource = _embedded_widget_resource(widget)
            
            return types.ServerResult(
                types.CallToolResult(
                    content=[
                        types.TextContent(
                            type="text",
                            text=f"Found {len(leads)} high-quality business leads with an average score of {metrics['average_lead_score']:.2f}",
                        )
                    ],
                    structuredContent={
                        "leads": leads,
                        "metrics": metrics,
                        "search_parameters": {
                            "keywords": payload.search_terms,
                            "industry": payload.industry_focus,
                            "platforms": payload.platforms,
                            "intent_keywords": payload.intent_keywords,
                            "filters_applied": {
                                "geographic": payload.geographic_filter,
                                "company_size": payload.company_size_filter,
                                "min_score": 0.6
                            }
                        },
                        "generated_at": datetime.now().isoformat()
                    },
                    _meta={
                        "openai.com/widget": widget_resource.model_dump(mode="json"),
                        "openai/outputTemplate": widget.template_uri,
                        "openai/widgetAccessible": True,
                        "openai/resultCanProduceWidget": True,
                    },
                )
            )
        
        elif tool_name == "analyze-lead-trends":
            widget = WIDGETS_BY_ID["analyze-lead-trends"]
            widget_resource = _embedded_widget_resource(widget)
            
            return types.ServerResult(
                types.CallToolResult(
                    content=[
                        types.TextContent(
                            type="text",
                            text="Generated analytics dashboard with lead trends",
                        )
                    ],
                    structuredContent={
                        "analytics": {
                            "total_leads": 150,
                            "hot_leads": 45,
                            "warm_leads": 78,
                            "cold_leads": 27,
                            "conversion_rate": 0.12,
                            "avg_response_time": "2.3 days"
                        },
                        "trends": {
                            "weekly_growth": 0.15,
                            "monthly_growth": 0.23,
                            "top_industries": ["Technology", "SaaS", "Healthcare"],
                            "top_locations": ["San Francisco", "Austin", "Boston"]
                        },
                        "time_series": [
                            {"date": "2025-09-07", "leads": 12, "conversions": 2},
                            {"date": "2025-09-14", "leads": 18, "conversions": 3},
                            {"date": "2025-09-21", "leads": 25, "conversions": 5},
                            {"date": "2025-09-28", "leads": 30, "conversions": 6},
                            {"date": "2025-10-05", "leads": 35, "conversions": 8},
                        ]
                    },
                    _meta={
                        "openai.com/widget": widget_resource.model_dump(mode="json"),
                        "openai/outputTemplate": widget.template_uri,
                        "openai/widgetAccessible": True,
                        "openai/resultCanProduceWidget": True,
                    },
                )
            )
        
        elif tool_name == "export-to-crm":
            payload = CRMExportInput.model_validate(arguments)
            widget = WIDGETS_BY_ID["export-to-crm"]
            widget_resource = _embedded_widget_resource(widget)
            
            return types.ServerResult(
                types.CallToolResult(
                    content=[
                        types.TextContent(
                            type="text",
                            text=f"Prepared {len(payload.lead_ids)} leads for export to {payload.crm_system.title()}",
                        )
                    ],
                    structuredContent={
                        "export_config": {
                            "crm_system": payload.crm_system,
                            "lead_count": len(payload.lead_ids),
                            "create_tasks": payload.create_tasks,
                            "set_reminders": payload.set_reminders
                        },
                        "export_options": {
                            "crm_systems": ["Salesforce", "HubSpot", "Pipedrive"],
                            "formats": ["CSV", "JSON", "CRM Native"],
                            "fields": ["Contact Info", "Company Data", "Lead Score", "Intent Analysis"],
                            "automation": ["Create Tasks", "Set Reminders", "Assign Owner"]
                        },
                        "export_status": "ready",
                        "lead_ids": payload.lead_ids
                    },
                    _meta={
                        "openai.com/widget": widget_resource.model_dump(mode="json"),
                        "openai/outputTemplate": widget.template_uri,
                        "openai/widgetAccessible": True,
                        "openai/resultCanProduceWidget": True,
                    },
                )
            )
        
        else:
            return types.ServerResult(
                types.CallToolResult(
                    content=[
                        types.TextContent(
                            type="text",
                            text=f"Unknown tool: {tool_name}",
                        )
                    ],
                    isError=True,
                )
            )
            
    except ValidationError as exc:
        return types.ServerResult(
            types.CallToolResult(
                content=[
                    types.TextContent(
                        type="text",
                        text=f"Input validation error: {exc.errors()}",
                    )
                ],
                isError=True,
            )
        )
    except Exception as exc:
        return types.ServerResult(
            types.CallToolResult(
                content=[
                    types.TextContent(
                        type="text",
                        text=f"Error: {str(exc)}",
                    )
                ],
                isError=True,
            )
        )


# Register handlers
mcp._mcp_server.request_handlers[types.CallToolRequest] = _call_tool_request
mcp._mcp_server.request_handlers[types.ReadResourceRequest] = _handle_read_resource

# Create FastAPI app
app = mcp.streamable_http_app()

# Add CORS middleware
try:
    from starlette.middleware.cors import CORSMiddleware

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_methods=["*"],
        allow_headers=["*"],
        allow_credentials=False,
    )
except Exception:
    pass


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

