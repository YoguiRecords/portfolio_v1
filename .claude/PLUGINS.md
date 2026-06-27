# Plugins Configuration

## Available Plugins

Configure plugins in `settings.json` by setting `true` or `false`.

| Plugin | Marketplace | Description |
|--------|-------------|-------------|
| `context7` | `claude-plugins-official` | Fetch up-to-date docs & code examples from any library |
| `keybindings-help` | `anthropic-tools` | Customize keyboard shortcuts and keybindings |
| `simplify` | `anthropic-tools` | Review code quality, refactor, fix issues |
| `claude-developer-platform` | `anthropic-tools` | Build apps with Claude API & Anthropic SDKs |
| `superpower` | `anthropic-tools` | Superpowers skills (brainstorm, plan, execute) |

## Usage

```json
{
  "enabledPlugins": {
    "context7@claude-plugins-official": true,      // Currently enabled
    "keybindings-help@anthropic-tools": false,     // Disabled - enable as needed
    "simplify@anthropic-tools": false,
    "claude-developer-platform@anthropic-tools": false,
    "superpower@anthropic-tools": false
  }
}
```

Change `true`/`false` to enable/disable plugins per project.
