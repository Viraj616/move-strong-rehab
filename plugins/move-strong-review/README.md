# Move Strong Daily Adaptation plugin

This private Codex plugin connects to the authenticated `/mcp` endpoint on the existing Move Strong Cloudflare Worker. It reads only the daily all-history snapshot, automatically derived skill pathways, recent detailed days and notes that the user explicitly enabled in the app. It saves tomorrow's reviewed plan, which Move Strong validates and activates automatically on the next sync.

Deployment requires the Worker database migration and an `MCP_ACCESS_TOKEN` Worker secret. Install the plugin with the same token as its bearer API key.
