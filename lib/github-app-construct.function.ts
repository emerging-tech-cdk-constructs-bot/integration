import { Context, APIGatewayProxyResult, APIGatewayEvent } from 'aws-lambda';
import { processGithubWebhook } from './process-github-webhook';
import { verifySignature } from './verify-signature';

//TODO: Implement when Amazon API Gateway can reduce the time to first byte (TTFB) for AWS Lambda.
// https://aws.amazon.com/blogs/compute/introducing-aws-lambda-response-streaming/
export const handler = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
    console.trace(`"event":\n${JSON.stringify(event, null, 2)}`);
    console.trace(`"context":\n${JSON.stringify(context, null, 2)}`);

    try {    
        if (!await verifySignature(event)) {
            console.warn(`Signature verification failed`);
            return {
                statusCode: 401,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: 'Unauthorized: Unable to verify signature',
                }),
            };
        } else {
            console.debug(`Signature verification succeeded`);
            return {
                statusCode: 202,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: await processGithubWebhook(event),
                }),
            };
        }
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: error,
            }),
        };
    }
};
