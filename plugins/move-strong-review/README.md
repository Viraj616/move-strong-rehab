# Move Strong Weekly Review plugin

This private Codex plugin connects to the authenticated `/mcp` endpoint on the existing Move Strong Cloudflare Worker. It can read only weekly snapshots that the user explicitly enabled in the app and can save draft plans only. Drafts require approval inside Move Strong before they become active.

Deployment requires the Worker database migration and an `MCP_ACCESS_TOKEN` Worker secret. Install the plugin with the same token as its bearer API key.
