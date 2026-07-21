import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

export function getAccounts() {
  return api.get('/accounts/')
}

export function deleteAccount(id) {
  return api.delete(`/accounts/${id}`)
}

export function getKeys() {
  return api.get('/keys/')
}

export function toggleKey(id, active) {
  return api.patch(`/keys/${id}/toggle?active=${active}`)
}

export function deleteKey(id) {
  return api.delete(`/keys/${id}`)
}

export function getProxyStats() {
  return api.get('/proxy/stats')
}

export function refreshProxyKeys() {
  return api.post('/proxy/refresh')
}

export function importAccount(data) {
  return api.post('/accounts/import', data)
}

export function importKey(data) {
  return api.post('/keys/import', data)
}

export function getProxyPool() {
  return api.get('/proxy/pool')
}

export function addProxy(proxyUrl) {
  return api.post('/proxy/pool/add', { proxy_url: proxyUrl })
}

export function clearProxyPool() {
  return api.post('/proxy/pool/clear')
}

export function registerAccount(data) {
  return api.post('/accounts/register', data)
}

export function getHealthCheckResults() {
  return api.get('/proxy/health-check')
}

export function runHealthCheck() {
  return api.post('/proxy/health-check/run')
}

export function healthCheck() {
  return api.get('/health')
}
