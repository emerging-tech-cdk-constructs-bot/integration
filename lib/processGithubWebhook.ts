import { APIGatewayEvent } from 'aws-lambda';
import SecretHelper from './secrets-helper';

export const X_GITHUB_DELIVERY = "X-GitHub-Delivery"; // A globally unique identifier (GUID) to identify the delivery.
// const X_GITHUB_HOOK_ID = "X-GitHub-Hook-ID"; // The unique identifier of the webhook.
const X_GITHUB_EVENT = "X-GitHub-Event"; // The name of the event that triggered the delivery.
export const X_GITHUB_HOOK_INSTALLATION_TARGET_ID = "X-GitHub-Hook-Installation-Target-ID"; // The unique identifier of the resource where the webhook was created.
// const X_GITHUB_INSTALLATION_TARGET_TYPE = "X-GitHub-Installation-Target-Type"; // The type of resource where the webhook was created.
export const X_HUB_SIGNATURE_256 = "X-Hub-Signature-256";

export async function processGithubWebhook(event: APIGatewayEvent) {
    const githubDelivery = event.headers[X_GITHUB_DELIVERY];
    if (githubDelivery === undefined || githubDelivery === null || githubDelivery === "") {
        throw new Error(`Missing or Invalid "${X_GITHUB_DELIVERY}" in headers`);
    }
    const githubEvent = event.headers[X_GITHUB_EVENT];
    if (githubEvent === undefined || githubEvent === null || githubEvent === "") {
        throw new Error(`Missing or Invalid "${X_GITHUB_EVENT}" in headers`);
    }
    if (!(X_GITHUB_HOOK_INSTALLATION_TARGET_ID in event.headers) || Number.isInteger(event.headers[X_GITHUB_HOOK_INSTALLATION_TARGET_ID])) {
        throw new Error(`Missing or Invalid "${X_GITHUB_HOOK_INSTALLATION_TARGET_ID}" in headers`);
    }
    const appId = Number(event.headers[X_GITHUB_HOOK_INSTALLATION_TARGET_ID]);

    const githubBody = JSON.parse(String(event.body));
    const githubAction = githubBody["action"]; // all but the "ping" event
    console.log(`Github "${githubEvent}.${githubAction}"`)
    console.log(`AppId(${appId}) with Body:\n${JSON.stringify(githubBody, null, 2)}`);

    const githubPayload = githubBody[githubEvent];

    // const pullRequestPayload = githubBody["pull_request"];

    // switch (githubEvent) {
    //     case "installation":
    //         // actions: created, deleted, new_permissions_accepted
    //         break;
    //     case "pull_request":
    //         // actions: opened, reopened, closed, synchronize, labeled, unlabeled, ready_for_review, review_requested, review_request_removed, synchronized, 
    //         const pullRequest = await processGithubPullRequest(app, pullRequestPayload);
    //         break;
    //     case "pull_request_review": // Add "pull_request" to this???
    //         // actions: submitted, edited, dismissed
    //         const pullRequestReview = await processGithubPullRequest(app, pullRequestPayload);
    //         break;
    //     case "check_suite":
    //         // actions: requested, requested_in_branch, rerequested, rerequested_in_branch, completed
    //         const checkSuiteRequestAction = githubPayload["action"];
    //         const checkSuitePayload = githubPayload[githubEvent];
    //         break;
    //     case "check_run":
    //         // actions: created, requested_action, rerequested_action, completed, queued
    //         //TODO: See if the check_suite.app.id is this app
    //         //TODO: 
    //         // const checkRunRequestAction = githubPayload["action"];
    //         // const checkRunPayload = githubPayload[githubEvent];
    //         // const checkRunId = checkRunPayload.id;
    //         // const checkRunStatus = checkRunPayload["state"];
    //         // const checkRunCheckSuiteAppId = checkRunPayload.check_suite.app.id;
    //         // if this is the "integration" that "queued"
    //         break;
    //     case "ping":
    //         break;
    //     default:
    //         console.warn(`Unhandled event`);
    //         break;
    // }

    return githubPayload;
}
