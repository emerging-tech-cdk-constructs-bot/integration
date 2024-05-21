import { APIGatewayEvent } from 'aws-lambda';
import { processGithubPullRequest } from './process-github-pull-request';

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
    if (!(X_GITHUB_HOOK_INSTALLATION_TARGET_ID in event.headers) || isNaN(parseInt(String(event.headers[X_GITHUB_HOOK_INSTALLATION_TARGET_ID])))) {
        throw new Error(`Missing or Invalid "${X_GITHUB_HOOK_INSTALLATION_TARGET_ID}" in headers`);
    }
    const appId = Number(event.headers[X_GITHUB_HOOK_INSTALLATION_TARGET_ID]);

    const githubBody = JSON.parse(String(event.body));
    const githubAction = githubBody["action"];
    const githubPayload = githubBody[githubEvent];
    let processPullRequest = false;

    console.debug(`${githubEvent}.${githubAction}`);
    switch (githubEvent) {
        case "pull_request":
            processPullRequest = true;
            switch (githubAction) {
                case "opened":
                    break;
                case "reopened":
                    break;
                case "closed":
                    processPullRequest = false;
                    break;            
                case "synchronize":
                    break;
                case "labeled":
                    break;
                case "unlabeled":
                    processPullRequest = false;
                    break;            
                case "ready_for_review":
                    break;
                case "review_requested":
                    break;
                case "review_request_removed":
                    processPullRequest = false;
                    break;            
                case "synchronized":
                    break;
                default:
                    console.warn(`Unhandled action`);
                    processPullRequest = false;
                    break;
            }
            break;
        case "pull_request_review": // Add "pull_request" to this???
            // actions: submitted, edited, dismissed
            processPullRequest = true;
            switch(githubAction) {
                case "submitted":
                    break;
                case "edited":
                    break;
                case "dismissed":
                    processPullRequest = false;
                    break;            
                default:
                    console.warn(`Unhandled action`);
                    processPullRequest = false;
                    break;
            }
            break;
        case "check_suite":
            switch (githubAction) {
                case "requested":
                    break;            
                case "requested_in_branch":
                    break;
                case "rerequested":
                    break;
                case "rerequested_in_branch":
                    break;            
                case "completed":
                    break;
                default:
                    console.warn(`Unhandled action`);
                    processPullRequest = false;
                    break;
            }
            break;
        case "check_run":
            switch (githubAction) {
                case "created":
                    break;            
                case "requested_action":
                    break;
                case "rerequested_action":
                    break;
                case "completed":
                    break;            
                case "queued":
                    break;
                default:
                    console.warn(`Unhandled action`);
                    processPullRequest = false;
                    break;
            }
            //TODO: See if the check_suite.app.id is this app
            //TODO: 
            // const checkRunRequestAction = githubPayload["action"];
            // const checkRunPayload = githubPayload[githubEvent];
            // const checkRunId = checkRunPayload.id;
            // const checkRunStatus = checkRunPayload["state"];
            // const checkRunCheckSuiteAppId = checkRunPayload.check_suite.app.id;
            // if this is the "integration" that "queued"
            break;
        default:
            console.warn(`Unhandled event`);
            processPullRequest = false;
            break;
    }
    //const pullRequest = await processGithubPullRequest(appId, githubBody); //, githubBody["pull_request"]);

    return githubBody;
}
