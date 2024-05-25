import { Octokit } from 'octokit';

export const processGithubPullRequest = async (octokit: Octokit, body: any, externalId?: string) => {
    if ("pull_request" in body && "head" in body.pull_request && "base" in body.pull_request) {
        // Only process PRs that are labeled upon approval
        if (body.pull_request.labels.some(label => label.name === "integration")) {
            console.debug(`PR labeled with "integration"`);
            // Get the reviews for the PR
            // https://docs.github.com/en/graphql/reference/objects#repository
            console.trace(`sending Github GraphQL...`);
            const query = `query {
                repository(
                    followRenames: true,
                    name: "${body.pull_request.base.repo.name}",
                    owner: "${body.pull_request.base.repo.owner.login}"
                ) {
                    collaborators(first: 100) {
                        edges {
                            permission
                            node {
                                login
                            }
                        }
                    }
                    pullRequest(number: ${body.pull_request.number}) {
                        state
                        mergeable
                        reviewDecision
                        latestReviews(first: 100) {
                            nodes {
                                state
                                author {
                                    login
                                }
                                updatedAt
                            }
                        }
                    }
                }
            }`;
            console.debug(query);
            const graphql = await octokit.graphql(query);
            console.debug(`octokit.graphql.repository:\n${JSON.stringify(graphql, null, 2)}`);

            if ((graphql.repository.pullRequest["state"] === "OPEN") && // not "CLOSED" nor "MERGED"
            (graphql.repository.pullRequest.reviewDecision === "APPROVED") && // not "REVIEW_REQUIRED" nor "CHANGES_REQUIRED"
            (graphql.repository.pullRequest.mergeable === "MERGEABLE") // not "CONFLICTING" nor "UNKNOWN"
            ) {
                console.debug(`PR is "OPEN" and "APPROVED" and "MERGEABLE"`);

                // The GitHub App owner and Collaborators with "ADMIN"
                const repositoryIntegrators = graphql.repository.collaborators.edges.filter(edge => edge.permission === "ADMIN").map(edge => edge.node.login);
                console.debug(`repositoryIntegrators:\n${JSON.stringify(repositoryIntegrators, null, 2)}`);

                if (graphql.repository.pullRequest.latestReviews !== null) {
                    console.debug(`graphql.repository.pullRequest.latestReviews.nodes:\n${JSON.stringify(graphql.repository.pullRequest.latestReviews.nodes, null, 2)}`);

                    // Check if a latest review has an "APPROVED" from a Collaborator with "ADMIN"
                    if (graphql.repository.pullRequest.latestReviews.nodes.some(review => (
                        (repositoryIntegrators.indexOf(review.author.login) > -1) && (review["state"] === "APPROVED")
                    ))) {
                        //TODO: Add a message to an AWS SQS FIFO Queue
                        // Use AWS Javascript SDK to send an AWS SQS SendMessageCommand
                        console.log(`TODO Sending message to AWS SQS FIFO Queue...`);

                        // Send an SQS Message
                        //const sqsHelper = SqSHelper.getInstance();
                        // const sqsSendMessageOutput = sqsHelper.sendMessageCommand(sqsSendMessageInput);
                        // const externalId = event.requestContext.requestId; // switch to SQS `MessageId`

                        const checkRuns = await octokit.request('POST /repos/{owner}/{repo}/check-runs', {
                            owner: body.pull_request.base.repo.owner.login,
                            repo: body.pull_request.base.repo.name,
                            name: 'integration',
                            head_sha: body.pull_request.head.sha,
                            status: 'queued', // can only be 'queued', 'in_progress', or 'pending'
                            external_id: externalId,
                            started_at: new Date().toISOString(),
                            //NOTE: The identifiers will the conclusion at completion.
                            actions: [
                                {
                                    label: 'run',
                                    description: 'run the check',
                                    identifier: externalId,
                                },
                                {
                                    label: 'fail',
                                    description: 'manually fail',
                                    identifier: 'failure',
                                },
                                {
                                    label: 'skip',
                                    description: 'manually skip',
                                    identifier: 'skipped',
                                },
                            ],
                            output: {
                                title: 'Integration Test Report',
                                summary: 'This will run a deployment and integration test in an AWS account',
                                text: ''
                            },
                            headers: {
                                'X-GitHub-Api-Version': '2022-11-28'
                            }
                        });
                        console.debug(`octokit.request.check-runs:\n${JSON.stringify(checkRuns, null, 2)}`);
                        console.info(`octokit.request.check-runs.id:\n${checkRuns.id}`);
                        //TODO: update the check run with the identifier to the check run's id
                    } else {
                        console.debug(`No integrators "APPROVED"`);
                    }
                } else {
                    //TOOD: Is there ever a case where this can happen?
                    console.warn(`How come there are no reviews when "APPROVED"???`);
                }
            } else {
                console.debug(`PR not "OPEN" or "APPROVED" or "MERGEABLE"`);
            }
        } else {
            console.debug(`PR not labeled with "integration"`);
        }
    } else {
        console.debug(`There isn't a PR with a head and base: ${JSON.stringify(body, null, 2)}`)
    }
}
