/**
 * Error de API con un código HTTP asociado. Los controllers/servicios lo
 * lanzan y el route handler lo convierte en una respuesta JSON coherente
 * (ver `handleApiError`).
 */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const unauthorized = (msg = "No autenticado") => new ApiError(401, msg);

export const forbidden = (msg = "No tenés permiso para esta acción") =>
  new ApiError(403, msg);

export const notFound = (msg = "Recurso no encontrado") =>
  new ApiError(404, msg);

export const badRequest = (msg = "Solicitud inválida", details?: unknown) =>
  new ApiError(400, msg, details);

export const conflict = (msg = "Conflicto con el estado actual") =>
  new ApiError(409, msg);
