import {useAuth} from "@clerk/clerk-react";

export default function useAuthenticatedFetch() {
    const {getToken} = useAuth()

    return async (input: RequestInfo, init?: RequestInit) => {
        const token = await getToken({ template: 'DefaultJWT' })
        if (!token) {
            throw new Error('Not signed in')
        }

        const headers = new Headers(init?.headers || {})
        headers.set('Authorization', `Bearer ${token}`)

        const response = await fetch(input, {
            ...init,
            headers,
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        // Handle empty responses (like 204 No Content)
        const contentType = response.headers.get('content-type')
        if (!contentType || !contentType.includes('application/json')) {
            return null
        }

        return response.json()
    }
}
