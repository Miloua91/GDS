const API_URL = 'http://localhost:8000/api/'

export const login = async ({ username, password }: { username: string; password: string }) => {
  const response = await fetch(`${API_URL}token/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })

  if (!response.ok) throw new Error('Invalid credentials')

  const data = await response.json()
  localStorage.setItem('access_token', data.access)
  localStorage.setItem('refresh_token', data.refresh)
}
