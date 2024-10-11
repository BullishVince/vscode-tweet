import * as vscode from "vscode";
import { TwitterApi } from "twitter-api-v2";

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    "vscode-tweeter.publishTweet",
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

  // Create a new view for the sidebar
  const viewProvider = new TwitterPublisherViewProvider(context);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      "twitterPublisherConfig",
      viewProvider
    )
  );
}

class TwitterPublisherViewProvider implements vscode.WebviewViewProvider {
  constructor(private context: vscode.ExtensionContext) {}

  resolveWebviewView(webviewView: vscode.WebviewView) {
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.context.extensionUri],
    };

    // Set HTML content for the webview
    webviewView.webview.html = this.getWebviewContent();

    webviewView.webview.onDidReceiveMessage((message) => {
      switch (message.command) {
        case "saveSettings":
          // Update the settings with the new values
          vscode.workspace
            .getConfiguration("vscodeTweetPublisher")
            .update("appKey", message.appKey, true);
          vscode.workspace
            .getConfiguration("vscodeTweetPublisher")
            .update("appSecret", message.appSecret, true);
          vscode.workspace
            .getConfiguration("vscodeTweetPublisher")
            .update("accessToken", message.accessToken, true);
          vscode.workspace
            .getConfiguration("vscodeTweetPublisher")
            .update("accessSecret", message.accessSecret, true);
          vscode.window.showInformationMessage("Settings saved successfully!");
          return;
      }
    });
  }

  private getWebviewContent(): string {
    return `<!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Twitter Publisher Settings</title>
          <style>
              body { font-family: Arial, sans-serif; padding: 10px; }
              h1 { font-size: 20px; }
              label { display: block; margin-bottom: 5px; }
              input { margin-bottom: 10px; width: 100%; }
          </style>
      </head>
      <body>
          <h1>Twitter Publisher Settings</h1>
          <label for="appKey">App Key:</label>
          <input type="text" id="appKey" placeholder="Enter your app key">
          <label for="appSecret">App Secret:</label>
          <input type="text" id="appSecret" placeholder="Enter your app secret">
          <label for="accessToken">Access Token:</label>
          <input type="text" id="accessToken" placeholder="Enter your access token">
          <label for="accessSecret">Access Secret:</label>
          <input type="text" id="accessSecret" placeholder="Enter your access secret">
          <button id="saveBtn">Save Settings</button>
          <script>
              const vscode = acquireVsCodeApi();

              document.getElementById('saveBtn').onclick = () => {
                  const appKey = document.getElementById('appKey').value;
                  const appSecret = document.getElementById('appSecret').value;
                  const accessToken = document.getElementById('accessToken').value;
                  const accessSecret = document.getElementById('accessSecret').value;

                  vscode.setState({
                      appKey,
                      appSecret,
                      accessToken,
                      accessSecret
                  });

                  vscode.postMessage({
                      command: 'saveSettings',
                      appKey,
                      appSecret,
                      accessToken,
                      accessSecret
                  });
              };
          </script>
      </body>
      </html>`;
  }
}

export function deactivate() {}
