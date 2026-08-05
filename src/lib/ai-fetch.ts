import { fetch as undiciFetch, ProxyAgent, type Dispatcher } from "undici";

// Some networks (e.g. China mainland) cannot reach the Agnes AI endpoints
// directly — route AI fetches through an optional HTTP(S) proxy.
// Node's global fetch ignores proxy env vars, and Next's patched fetch drops
// the `dispatcher` option, so use undici directly with an explicit dispatcher.
const proxyUrl = process.env.AI_API_PROXY || process.env.HTTPS_PROXY || process.env.HTTP_PROXY || "";

const dispatcher: Dispatcher | undefined = proxyUrl ? new ProxyAgent(proxyUrl) : undefined;

export function aiFetch(
  input: Parameters<typeof undiciFetch>[0],
  init?: Parameters<typeof undiciFetch>[1]
): Promise<Response> {
  // undici's Response/Headers types are structurally incompatible with the
  // DOM lib types (HeadersIterator vs SpecIterableIterator), but at runtime
  // this IS a standard web Response — route handlers stream it directly.
  return undiciFetch(input, dispatcher ? { ...init, dispatcher } : init) as unknown as Promise<Response>;
}
