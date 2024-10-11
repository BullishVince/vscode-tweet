import * as vscode from "vscode";
import { TwitterApi } from "twitter-api-v2";

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    "vscode-tweet.publishTweet",
    async () => {
      // Retrieve the API keys from the settings
      const appKey = vscode.workspace
        .getConfiguration("vscodeTweetPublisher")
        .get<string>("appKey");
      const appSecret = vscode.workspace
        .getConfiguration("vscodeTweetPublisher")
        .get<string>("appSecret");
      const accessToken = vscode.workspace
        .getConfiguration("vscodeTweetPublisher")
        .get<string>("accessToken");
      const accessSecret = vscode.workspace
        .getConfiguration("vscodeTweetPublisher")
        .get<string>("accessSecret");

      // Check if all required keys are available
      if (!appKey || !appSecret || !accessToken || !accessSecret) {
        vscode.window.showErrorMessage(
          "Please configure Twitter API keys in the settings."
        );
        return;
      }

      const tweet = await vscode.window.showInputBox({
        prompt: "Enter your tweet",
      });
      if (tweet) {
        try {
          const client = new TwitterApi({
            appKey,
            appSecret,
            accessToken,
            accessSecret,
          });

          const rwClient = client.readWrite;
          await rwClient.v2.tweet(tweet);
          vscode.window.showInformationMessage(`Tweet published: ${tweet}`);
        } catch (error: any) {
          vscode.window.showErrorMessage(
            "Failed to publish tweet: " + error.message
          );
        }
      } else {
        vscode.window.showErrorMessage("Tweet cannot be empty");
      }
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
