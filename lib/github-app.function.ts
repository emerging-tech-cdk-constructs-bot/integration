import { Context, APIGatewayProxyResult, APIGatewayEvent } from 'aws-lambda';
import { App, Octokit } from 'octokit';

// https://docs.github.com/en/webhooks/using-webhooks/validating-webhook-deliveries
// import * as crypto from 'crypto';

// const WEBHOOK_SECRET: string = process.env.WEBHOOK_SECRET;

// const verify_signature = (req: Request) => {
//   const signature = crypto
//     .createHmac("sha256", WEBHOOK_SECRET)
//     .update(JSON.stringify(req.body))
//     .digest("hex");
//   let trusted = Buffer.from(`sha256=${signature}`, 'ascii');
//   let untrusted =  Buffer.from(req.headers.get("x-hub-signature-256"), 'ascii');
//   return crypto.timingSafeEqual(trusted, untrusted);
// };

// const handleWebhook = (req: Request, res: Response) => {
//   if (!verify_signature(req)) {
//     res.status(401).send("Unauthorized");
//     return;
//   }
//   // The rest of your logic here
// };

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
    return {
        statusCode: 200,
        body: JSON.stringify({
            message: 'github app',
        }),
    };
};
