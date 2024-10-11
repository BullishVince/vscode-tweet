import * as vscode from "vscode";
import { TwitterApi } from "twitter-api-v2";

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    "vscode-tweet.publishTweet",
    async () => {
      const tweet = await vscode.window.showInputBox({
        prompt: "Enter your tweet",
      });
      if (tweet) {
        try {
          const client = new TwitterApi({
            appKey: "YOUR_API_KEY",
            appSecret: "YOUR_API_SECRET",
            accessToken: "YOUR_ACCESS_TOKEN",
            accessSecret: "YOUR_ACCESS_SECRET",
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
