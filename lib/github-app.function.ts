import { Context, APIGatewayProxyResult, APIGatewayEvent } from 'aws-lambda';
import { App, Octokit } from 'octokit';

// Modified from https://docs.github.com/en/webhooks/using-webhooks/validating-webhook-deliveries
import * as crypto from 'crypto';

const GITHUB_APP_WEBHOOK_SECRET: string = String(process.env.GITHUB_APP_WEBHOOK_SECRET);
const X_HUB_SIGNATURE_256 = "X-Hub-Signature-256";

const verifySignature = (event: APIGatewayEvent) => {
    if ((event.headers[X_HUB_SIGNATURE_256] === undefined) || (event.headers[X_HUB_SIGNATURE_256] === null)) {
        console.warn(`Missing ${X_HUB_SIGNATURE_256} header:\n${JSON.stringify(event.headers)}`);
        return false;
    }
    const signature = crypto
        .createHmac("sha256", GITHUB_APP_WEBHOOK_SECRET)
        .update(String(event.body), 'ascii')
        .digest("hex");
    let trusted = Buffer.from(`sha256=${signature}`, 'ascii');
    let untrusted =  Buffer.from(event.headers[X_HUB_SIGNATURE_256], 'ascii');
    return crypto.timingSafeEqual(trusted, untrusted);
};

const app = new App({
    appId: String(process.env.GITHUB_APP_ID),
    privateKey: String(process.env.GITHUB_APP_WEBHOOK_SECRET),
});

const octokit = new Octokit({
    auth: process.env.GITHUB_APP_TOKEN,
});

export const handler = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
    console.log(`Event: ${JSON.stringify(event, null, 2)}`);
    console.log(`Context: ${JSON.stringify(context, null, 2)}`);
    if (!verifySignature(event)) {
        return {
            statusCode: 401,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: 'Unauthorized: Unable to verify signature',
            }),
        };
    }
    return {
        statusCode: 202,
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            message: 'github app',
        }),
    };
};
