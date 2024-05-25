import { Octokit } from 'octokit';

export const updateGithubCheckRun = async (octokit: Octokit, owner: string, repo: string, checkRunId: Number, checkRunStatus: string) => {
    // skip "completed", because that is in the other function...and "waiting", "requested", "pending" are GitHub actions only
    if (["queued", "in_progress"].indexOf(checkRunStatus) > -1) {
        const checkRuns = await octokit.request('PATCH /repos/{owner}/{repo}/check-runs/{check_run_id}', {
            owner: owner,
            repo: repo,
            check_run_id: checkRunId,
            status: checkRunStatus,
            headers: {
                'X-GitHub-Api-Version': '2022-11-28'
            }
        });
    } else {
        console.warn(`Illegal status, "${checkRunStatus}", for a check_run`);
    }
}

export const concludeGithubCheckRun = async (octokit: Octokit, owner: string, repo: string, checkRunId: Number, conclusion: string, text?: string) => {
    // skip stale, because only GitHub can ...
    if (["action_required", "cancelled", "failure", "neutral", "success", "skipped", "timed_out"].indexOf(conclusion) > -1) {
        const checkRuns = await octokit.request('PATCH /repos/{owner}/{repo}/check-runs/{check_run_id}', {
            owner: owner,
            repo: repo,
            check_run_id: checkRunId,
            conclusion: conclusion,
            output: {
                title: 'Integration Test Report',
                summary: 'Run a deployment and integration test in an AWS account',
                text: text,
            },
            headers: {
                'X-GitHub-Api-Version': '2022-11-28'
            }
        });
        console.debug(`octokit.request.check-runs:\n${JSON.stringify(checkRuns, null, 2)}`);
    } else {
        // const workFlows = await octokit.request('GET /repos/{owner}/{repo}/actions/workflows', {
        //   owner: owner,
        //   repo: repo,
        //   headers: {
        //     'X-GitHub-Api-Version': '2022-11-28'
        //   }
        // });
        // console.debug(`octokit.request.workflows:\n${JSON.stringify(workFlows, null, 2)}`);
        // workFlows.data.workflows.forEach(workflow => {
        //     console.trace(`"${workflow.name}" workflow id ${workflow.id}`);
        //     if (workflow.name == "integration") {
                // console.info(`"integration" workflow found id ${workflow.id}`);
                const workflowId = 'tester.yml'; // workflow.id;
                const workflowRun = await octokit.request('POST /repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches', {
                  owner: owner,
                  repo: repo,
                  workflow_id: workflowId,
                  ref: 'main', //TODO: need to update this
                  inputs: {
                    pullRequestNumber: '2', //TODO: need to update this
                    externalId: conclusion
                  },
                  headers: {
                    'X-GitHub-Api-Version': '2022-11-28'
                  }
                });
        //     }
        // });
        const checkRun = await updateGithubCheckRun(octokit, owner, repo, checkRunId, "in_progress");
        console.warn(`Illegal conclusion, "${conclusion}", for a check_run`);
    }
}
