import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    "vscode-tweet-publisher.publishTweet",
    async () => {
      const tweet = await vscode.window.showInputBox({
        prompt: "Enter your tweet",
      });
      if (tweet) {
        // Logic to publish tweet will go here
        vscode.window.showInformationMessage(`Tweet published: ${tweet}`);
      } else {
        vscode.window.showErrorMessage("Tweet cannot be empty");
      }
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
