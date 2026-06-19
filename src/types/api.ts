export interface ApiErrorBody {
  code?: string
  message?: string
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}
