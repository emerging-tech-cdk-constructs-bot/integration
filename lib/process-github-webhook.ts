import { APIGatewayEvent } from 'aws-lambda';
import { processGithubPullRequest } from './process-github-pull-request';
import { updateGithubCheckRun, concludeGithubCheckRun } from './process-github-check-run';
import { App } from 'octokit';
import SecretHelper from './secrets-helper';
import {
    GITHUB_APP_SECRETS_MANAGER_PREFIX,
 } from './verify-signature';

export const X_GITHUB_DELIVERY = "X-GitHub-Delivery"; // A globally unique identifier (GUID) to identify the delivery.
// const X_GITHUB_HOOK_ID = "X-GitHub-Hook-ID"; // The unique identifier of the webhook.
const X_GITHUB_EVENT = "X-GitHub-Event"; // The name of the event that triggered the delivery.
export const X_GITHUB_HOOK_INSTALLATION_TARGET_ID = "X-GitHub-Hook-Installation-Target-ID"; // The unique identifier of the resource where the webhook was created.
// const X_GITHUB_INSTALLATION_TARGET_TYPE = "X-GitHub-Installation-Target-Type"; // The type of resource where the webhook was created.
export const X_HUB_SIGNATURE_256 = "X-Hub-Signature-256";

export async function processGithubWebhook(event: APIGatewayEvent) {
    console.trace(`"headers":\n${JSON.stringify(event.headers)}`);
    const githubDelivery = event.headers[X_GITHUB_DELIVERY];
    if (githubDelivery === undefined || githubDelivery === null || githubDelivery === "") {
        throw new Error(`Missing or Invalid "${X_GITHUB_DELIVERY}" in headers`);
    } else {
        console.info(`${X_GITHUB_DELIVERY}:\n${githubDelivery}`);
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
    console.debug(`"body":\n${JSON.stringify(githubBody)}`);

    if (("installation" in githubBody) && ("id" in githubBody.installation)) {
        console.trace(`Getting the secrets for the GitHub app...`);
        const secretHelper = SecretHelper.getInstance();
        const githubAppSecretsString = await secretHelper.getSecret(GITHUB_APP_SECRETS_MANAGER_PREFIX.concat(String(appId)));
        const githubAppSecrets = JSON.parse(githubAppSecretsString);
        const privateKey = String(githubAppSecrets.privateKey);
        console.trace(privateKey);
        console.trace(atob(privateKey));
    
        const app = new App({
            appId: String(appId),
            privateKey: atob(privateKey),
        });

        // https://github.com/octokit/octokit.js/?tab=readme-ov-file#authentication
        const octokit = await app.getInstallationOctokit(
            Number(githubBody.installation.id)
        );

        const githubAction = githubBody["action"];
        let processPullRequest = false;
        let processCheckRun = false;

        console.debug(`${githubEvent}.${githubAction}`);
        switch (githubEvent) {
            case "pull_request":
                console.trace(`a "pull_request", so process...`);
                processPullRequest = true;
                switch (githubAction) {
                    case "opened":
                        break;
                    case "reopened":
                        break;
                    case "closed":
                        console.trace(`but "closed" so don't process...`);
                        processPullRequest = false;
                        break;            
                    case "synchronize":
                        break;
                    case "labeled":
                        break;
                    case "unlabeled":
                        console.trace(`but "unlabeled" so don't process...`);
                        processPullRequest = false;
                        break;            
                    case "ready_for_review":
                        break;
                    case "review_requested":
                        break;
                    case "review_request_removed":
                        console.trace(`but "review_request_removed" so don't process...`);
                        processPullRequest = false;
                        break;            
                    case "synchronized":
                        break;
                    default:
                        console.trace(`but no action registered, so don't process...`);
                        console.warn(`Unhandled action`);
                        processPullRequest = false;
                        break;
                }
                break;
            case "pull_request_review": // Add "pull_request" to this???
                console.trace(`a "pull_request_review", so process...`);
                processPullRequest = true;
                switch(githubAction) {
                    case "submitted":
                        break;
                    case "edited":
                        break;
                    case "dismissed":
                        console.trace(`but "dismissed" so don't process...`);
                        processPullRequest = false;
                        break;            
                    default:
                        console.trace(`but no action registered, so don't process...`);
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
                        break;
                }
                break;
            case "check_run":
                if (githubBody.check_run.name === "integration" && githubBody.check_run.app.id === appId) {
                    processCheckRun = true;
                } else {
                    console.debug(`Skip, because not an "integration" check_run for the app`)
                }
                switch (githubAction) {
                    case "created":
                        // if (processCheckRun) {
                        //     const nextCheckStatus = await updateGithubCheckRun(
                        //         octokit, 
                        //         githubBody.repository.owner.login, 
                        //         githubBody.repository.name, 
                        //         githubBody.check_run.id,
                        //         "in_progress",
                        //     );
                        // }
                        break;            
                    case "requested_action":
                        // TODO: Paginate, retry, etc.
                        const query = `query {
                            repository(
                                followRenames: true,
                                name: "${githubBody.repository.name}",
                                owner: "${githubBody.repository.owner.login}"
                            ) {
                                collaborators(first: 100) {
                                    edges {
                                        permission
                                        node {
                                            login
                                        }
                                    }
                                }
                            }
                        }`;
                        const graphql = await octokit.graphql(query);
                        const repositoryIntegrators = graphql.repository.collaborators.edges.filter(edge => edge.permission === "ADMIN").map(edge => edge.node.login);
                        if (processCheckRun && repositoryIntegrators.indexOf(githubBody.sender.login) > -1) {
                            console.debug(`Completing the check`);
                            const nextCheckStatus = await concludeGithubCheckRun(
                                octokit, 
                                githubBody.repository.owner.login, 
                                githubBody.repository.name, 
                                githubBody.check_run.id,
                                githubBody[githubAction].identifier,
                                `${githubBody.sender.login} processed the request`,
                            );
                        } else {
                            console.debug(`Non-ADMIN attempted to take action`);
                        }
                        break;
                    case "rerequested_action":
                        break;
                    case "completed":
                        break;            
                    case "queued":
                        break;
                    default:
                        console.warn(`Unhandled action`);
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

        if (processPullRequest) {
            console.debug(`processing pull request`);
            // Unique delivery and requestid are GUID and 36 long and externalId is only allowing 20, need to compensate...
            const externalIdOnlyAllowsTwenty = new Date().now().toString() // is milliseconds since epoch 13 characters...
            // TODO: use the `githubDelivery` when expanded to longer than 20
            const pullRequest = await processGithubPullRequest(octokit, githubBody, externalIdOnlyAllowsTwenty);
        } else {
            console.debug(`not going to process pull request due to event and action`);
        }
    } else {
        console.warn(`no "installation.id", so nothing the GitHub app is going to do...`)
    }
    return githubBody;
}
