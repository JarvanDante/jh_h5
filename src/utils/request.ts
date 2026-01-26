const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api'

class Request {
  async get<T = any>(url: string): Promise<T> {
    const response = await fetch(`${apiBaseUrl}${url}`)
    const result = await response.json()
    // 返回 data 部分
    return result.data || result
  }

  async post<T = any>(url: string, data?: any): Promise<T> {
    const response = await fetch(`${apiBaseUrl}${url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    const result = await response.json()
    // 返回 data 部分
    return result.data || result
  }
}

export const request = new Request()
