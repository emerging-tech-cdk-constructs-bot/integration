//import { App } from 'octokit';
// import SecretHelper from './secrets-helper';

export const GITHUB_APP_SECRETS_MANAGER_PREFIX = 'GitHubApp/';

// export class AApp extends App {
//     private privateKey: string;
//     private webhookSecret: string;
//     constructor(options: any) {
//         super(options);
//         this.webhookSecret = options.webhookSecret;
//         this.privateKey = options.privateKey;
//     }
//     public getPrivateKey(): string {
//         return this.privateKey;
//     }
//     public getWebhookSecret(): string {
//         return this.webhookSecret;
//     }
// }

export default class GitHubAppHelper {
  private static instance: GitHubAppHelper;
  private apps: Map<number, string>;
  
  /**
   * The `GitHubAppHelper`'s constructor should be private to prevent direct construction calls with the `new` operation.
   */
  private constructor() {
    this.apps = new Map<number, string>();
  }

  /**
   * Gets the `GitHubAppHelper` singleton instance.
   * If the instance doesn't exist, it creates a new one.
   * @returns `GitHubAppHelper` instance
   */
  public static getInstance(): GitHubAppHelper {
    if (!GitHubAppHelper.instance) {
        GitHubAppHelper.instance = new GitHubAppHelper();
    }

    return GitHubAppHelper.instance;
  }

  /**
   * Gets the Octokit App .
   * @param addId AppId
   * @returns GitHub App value
   */
  public async getApp(appId: number): Promise<string> {
    if (!this.apps.has(appId)) {
      // Get GitHub app webhook secret from AWS Secrets Manager
      // const secretHelper = SecretHelper.getInstance();
      // const githubAppSecrets = await secretHelper.getSecret(<string>GITHUB_APP_SECRETS_MANAGER_PREFIX.concat(String(appId)));
      const githubAppSecrets = "";
      console.log(githubAppSecrets);
      console.log(String(JSON.parse(githubAppSecrets).privateKey));
      this.apps.set(appId, String(JSON.parse(githubAppSecrets).privateKey));
      // const app = new App({
      //     appId: appId,
      //     privateKey: String(JSON.parse(githubAppSecrets).privateKey),
      //     // webhookSecret: String(JSON.parse(githubAppSecrets).webhookSecret),
      // });
      // this.apps.set(appId, app);
    }

    return <string>this.apps.get(appId);
  }
}
