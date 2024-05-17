import { APIGatewayEvent } from 'aws-lambda';
import * as crypto from 'crypto';
import {
    X_GITHUB_INSTALLATION_TARGET_ID,
    X_HUB_SIGNATURE_256,
 } from './processGithubWebhook';
import SecretHelper from './secrets-helper';

export const GITHUB_APP_SECRETS_MANAGER_PREFIX = 'GitHubApp/';

export const verifySignature = async (event: APIGatewayEvent) => {
    const gitHubSignature256Header = event.headers[X_HUB_SIGNATURE_256];
    if ((gitHubSignature256Header === undefined) || (gitHubSignature256Header === null)) {
        console.warn(`Missing "${X_HUB_SIGNATURE_256}" in headers`);
        return false;
    }
    if (!(X_GITHUB_INSTALLATION_TARGET_ID in event.headers) || Number.isInteger(event.headers[X_GITHUB_INSTALLATION_TARGET_ID])) {
        console.warn(`Missing "${X_GITHUB_INSTALLATION_TARGET_ID}" in headers`);
        return false;
    }

    const appId = Number(event.headers[X_GITHUB_INSTALLATION_TARGET_ID]);
    console.trace(`appId: ${Number(appId)}`);

    // The GitHub app webhook secret from AWS Secrets Manager
    // GitHub App should always sign
    console.debug(`Getting Secrets Helper`);
    const secretHelper = SecretHelper.getInstance();
    console.debug(`Getting secrets`);
    const githubAppSecretsString = await secretHelper.getSecret(GITHUB_APP_SECRETS_MANAGER_PREFIX.concat(String(appId)));
    console.trace(`githubAppSecretsString:\n${githubAppSecretsString}`);
    const githubAppSecrets = JSON.parse(githubAppSecretsString);
    console.trace(`githubAppSecrets:\n${JSON.stringify(githubAppSecrets)}`);
    const webHookSecret = String(githubAppSecrets.webhookSecret);
    console.trace(`webHookSecret: ${webHookSecret}`);
    
    const signature = crypto
        .createHmac("sha256", webHookSecret)
        .update(String(event.body), 'ascii')
        .digest("hex");
    let trusted = Buffer.from(`sha256=${signature}`, 'ascii');
    let untrusted = Buffer.from(gitHubSignature256Header, 'ascii');
    return crypto.timingSafeEqual(trusted, untrusted);
};
