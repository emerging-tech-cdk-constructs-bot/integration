import { APIGatewayEvent } from 'aws-lambda';

export const processGithubPullRequest = (event: APIGatewayEvent) => {

//             // Only process PRs that are labeled upon approval
//             if (pullRequestPayload.labels.some(label => label.name === "integration")) {
//                 console.log(`PR labeled with "integration"`);

//                 // https://github.com/octokit/octokit.js/?tab=readme-ov-file#authentication
//                 const octokit = await app.getInstallationOctokit(githubPayload.installation.id);

//                 // Get the reviews for the PR
//                 // https://docs.github.com/en/graphql/reference/objects#repository
//                 const graphql = await octokit.graphql(`query {
//                     repository(
//                         followRenames: true,
//                         name: "${githubPayload.pull_request.head.repo.name}",
//                         owner: "${githubPayload.pull_request.head.repo.owner.login}"
//                     ) {
//                         collaborators(first: 100) {
//                             edges {
//                                 permission
//                                 node {
//                                     login
//                                 }
//                             }
//                             totalCount
//                         }
//                         pullRequest(number: ${githubPayload.pull_request.number}) {
//                             state
//                             mergeable
//                             reviewDecision
//                             latestReviews(first: 100) {
//                                 nodes {
//                                     state
//                                     author {
//                                         login
//                                     }
//                                     updatedAt
//                                 }
//                             }
//                         }
//                     }
//                 }`);
//                 console.log(`octokit.graphql.repository:\n${JSON.stringify(graphql, null, 2)}`);
//                 if ((graphql.repository.pullRequest["state"] === "OPEN") && // not "CLOSED" nor "MERGED"
//                     (graphql.repository.pullRequest.reviewDecision === "APPROVED") && // not "REVIEW_REQUIRED" nor "CHANGES_REQUIRED"
//                     (graphql.repository.pullRequest.mergeable === "MERGEABLE") // not "CONFLICTING" nor "UNKNOWN"
//                 ) {
//                     console.log(`PR is "OPEN" and "APPROVED" and "MERGEABLE"`);
//                     // The GitHub App owner and Collaborators with "ADMIN"
//                     const repositoryIntegrators = [...new Set([pullRequestPayload.app.owner.login].concat(graphql.repository.collaborators.edges.filter(edge => edge.permission === "ADMIN").map(edge => edge.node.login)))];
//                     console.log(`repositoryIntegrators:\n${JSON.stringify(repositoryIntegrators, null, 2)}`);

//                     if (graphql.repository.pullRequest.latestReviews !== null) {
//                         console.log(`graphql.repository.pullRequest.latestReviews.nodes:\n${JSON.stringify(graphql.repository.pullRequest.latestReviews.nodes, null, 2)}`);
//                         // Check if the latest reviews are from the GitHub App owner and Collaborators with "ADMIN"
//                         if (graphql.repository.pullRequest.latestReviews.nodes.some(review => (
//                             (review.author.login in repositoryIntegrators) && (review["state"] === "APPROVED")
//                         ))) {
//                             //TODO: Add a message to an AWS SQS FIFO Queue
//                             // Use AWS Javascript SDK to send an AWS SQS SendMessageCommand
//                             console.log(`Sending message to AWS SQS FIFO Queue...`);

//                             // Send an SQS Message
//                             //const sqsHelper = SqSHelper.getInstance();
//                             // const sqsSendMessageOutput = sqsHelper.sendMessageCommand(sqsSendMessageInput);
//                             const externalId = event.requestContext.requestId; // switch to SQS `MessageId`

//                             const checkRuns = await octokit.request('POST /repos/{owner}/{repo}/check-runs', {
//                                 owner: githubPayload.pull_request.head.repo.owner.login,
//                                 repo: githubPayload.pull_request.head.repo.name,
//                                 name: 'integration_test',
//                                 head_sha: githubPayload.pull_request.head.sha,
//                                 status: 'queued',
//                                 external_id: externalId,
//                                 started_at: new Date().toISOString(),
//                                 output: {
//                                     title: 'Integration Test Report',
//                                     summary: 'This runs an integration test',
//                                     text: ''
//                                 },
//                                 headers: {
//                                     'X-GitHub-Api-Version': '2022-11-28'
//                                 }
//                             });
//                             console.log(`octokit.request.check-runs:\n${JSON.stringify(checkRuns, null, 2)}`);
//                         } else {
//                             console.log(`No integrators "APPROVED"`);
//                         }
//                     } else {
//                         //TOOD: Is there ever a case where this can happen?
//                         console.warn(`How come there are no reviews when "APPROVED"???`);
//                     }
//                 } else {
//                     console.log(`PR not "OPEN" or "APPROVED" or "MERGEABLE"`);
//                 }
//             } else {
//                 console.log(`PR not labeled with "integration"`);
//             }
}
