export function successResponse(response, data, message) {
    return response.status(200).json({ success: true, message, data });
}

export function errorResponse(response, status, error) {
    return response.status(status).json({ success: false, error });
}