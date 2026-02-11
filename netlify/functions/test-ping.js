export const handler = async (event) => {
    return {
        statusCode: 200,
        body: JSON.stringify({ message: 'pong', time: new Date().toISOString() }),
    }
}
