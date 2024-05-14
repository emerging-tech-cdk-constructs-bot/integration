import { Context, APIGatewayProxyResult, APIGatewayEvent } from 'aws-lambda';
import { App, Octokit } from 'octokit';

// https://docs.github.com/en/webhooks/using-webhooks/validating-webhook-deliveries
import * as crypto from 'crypto';

const GITHUB_APP_WEBHOOK_SECRET: string = String(process.env.GITHUB_APP_WEBHOOK_SECRET);
const X_HUB_SIGNATURE_256 = "X-Hub-Signature-256";

const verifySignature = (event: APIGatewayEvent) => {
    if ((event.headers[X_HUB_SIGNATURE_256] === undefined) || (event.headers[X_HUB_SIGNATURE_256] === null)) {
        console.log(`No signature found in headers: ${JSON.stringify(event.headers)}`);
        return false;
    } else {
        console.log(`${X_HUB_SIGNATURE_256}: \n${event.headers[X_HUB_SIGNATURE_256]}`);
    }
    const signature = crypto
        .createHmac("sha256", GITHUB_APP_WEBHOOK_SECRET)
        .update(JSON.stringify(event.body))
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
                headers: event.headers,
            }),
        };
    }
    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            message: 'github app',
        }),
    };
};
