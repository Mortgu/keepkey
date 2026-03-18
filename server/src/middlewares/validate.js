export const validate = (schema) => (request, response, next) => {
    const result = schema.safeParse(request.body);

    if (!result.success) {
        return response.status(400).json({
            success: false, errrors: result.error.message
        });
    }

    next();
}