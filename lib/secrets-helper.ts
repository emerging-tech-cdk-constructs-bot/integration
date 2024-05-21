import * as AWS from 'aws-sdk';

const secretsManager = new AWS.SecretsManager();

export default class SecretHelper {
  private static instance: SecretHelper;
  private secret: Map<string, string>;

  /**
   * The `SecretHelper`'s constructor should be private to prevent direct construction calls with the `new` operation.
   */
  private constructor() {
    this.secret = new Map<string, string>();
  }

  /**
   * Gets the `SecretHelper` singleton instance.
   * If the instance doesn't exist, it creates a new one.
   * @returns `SecretHelper` instance
   */
  public static getInstance(): SecretHelper {
    if (!SecretHelper.instance) {
      SecretHelper.instance = new SecretHelper();
    }

    return SecretHelper.instance;
  }

  /**
   * Gets the secret from the Secrets Manager secret.
   * @param secretId Secret ID
   * @returns Secrets Manager secret value
   */
  public async getSecret(secretId: string): Promise<string> {
    if (!this.secret.has(secretId)) {
      const secretValue = await secretsManager.getSecretValue({ SecretId: secretId }).promise();
      this.secret.set(secretId, <string>secretValue.SecretString);
    } else {
      console.trace(`using prefetched values for secrets`)
    }

    return <string>this.secret.get(secretId);
  }
}
