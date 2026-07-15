<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Development Rules
- Every change must support hot-reload (HMR/Fast Refresh). After modifying code, the dev server should reflect changes without a manual restart. Do not introduce patterns that break HMR (e.g., modifying module scope state directly, using `module.exports` in pages, or editing files outside the module graph that require a full restart).
- After every modification, verify the page loads successfully without compile errors, runtime crashes, or blank screens. Do not leave the app in a broken state.

## Project Management
- After completing any feature update (whether implementing new functionality, fixing bugs, or optimizing), always update `PROJECT_PLAN.md` to reflect the current status — move completed items to ✅, update progress, and adjust upcoming plans accordingly.

## Developer Emails
- `1264867171@qq.com`
- `2633313990@qq.com`

## Deployment
- **腾讯云服务器 IP**: `43.161.245.49`
- SSH 登录方式：微信扫码认证（腾讯云 Cloud Shell）
