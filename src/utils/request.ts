const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api'

class Request {
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    const token = localStorage.getItem('user_token')
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    return headers
  }

  async get<T = any>(url: string): Promise<T> {
    const response = await fetch(`${apiBaseUrl}${url}`, {
      headers: this.getHeaders(),
    })
    const result = await response.json()
    return result.data || result
  }

  async post<T = any>(url: string, data?: any): Promise<T> {
    const response = await fetch(`${apiBaseUrl}${url}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    })
    const result = await response.json()
    return result.data || result
  }
}

export const request = new Request()
