import { createClient } from 'redis';

let client = null;

export async function initializeRedisClient() {
    console.log("dawdwa")
    if (!client) {
        client = createClient();

        client.on("error", (error) => {
            console.error(error);
        });

        client.on("connect", () => {
            console.log("Redis connected");
        })

        await client.connect();
    }

    return client;
}