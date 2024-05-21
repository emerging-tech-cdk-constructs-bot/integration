import { Octokit } from 'octokit';

export const updateGithubCheckRun = async (octokit: Octokit, owner: string, repo: string, checkRunId: Number, checkRunStatus: string) => {
    // skip "completed", because that is in the other function...and "waiting", "requested", "pending" are GitHub actions only
    if (["queued", "in_progress"].indexOf(checkRunStatus) > -1) {

        const checkRun = await octokit.request('GET /repos/{owner}/{repo}/check-runs/{check_run_id}', {
            owner: owner,
            repo: repo,
            check_run_id: checkRunId,
            headers: {
                'X-GitHub-Api-Version': '2022-11-28'
            }
        });

        console.warn(`CHECKRUN:\n${JSON.stringify(checkRun)}`);

        const checkRuns = await octokit.request('POST /repos/{owner}/{repo}/check-runs/{check_run_id}', {
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

export const concludeGithubCheckRun = async (octokit: Octokit, owner: string, repo: string, checkRunId: Number, conclusion: string) => {
    // skip stale, because only GitHub can ...
    if (["action_required", "cancelled", "failure", "neutral", "success", "skipped", "time_out"].indexOf(conclusion) > -1) {
        const checkRuns = await octokit.request('POST /repos/{owner}/{repo}/check-runs/{check_run_id}', {
            owner: owner,
            repo: repo,
            check_run_id: checkRunId,
            conclusion: conclusion,
            headers: {
                'X-GitHub-Api-Version': '2022-11-28'
            }
        });
        console.debug(`octokit.request.check-runs:\n${JSON.stringify(checkRuns, null, 2)}`);
    } else {
        console.warn(`Illegal conclusion, "${conclusion}", for a check_run`);
    }
}
