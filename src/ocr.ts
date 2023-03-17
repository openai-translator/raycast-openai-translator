import { environment, getPreferenceValues, showHUD, updateCommandMetadata } from "@raycast/api";
import { spawn, spawnSync } from "child_process";
import fs from "fs";
import { TranslateMode } from "./providers/openai/translate";

async function fetchUnreadNotificationCount() {
  return 10;
}

function screencapture(file: string) {
  const { status, stdout, stderr } = spawnSync("/usr/sbin/screencapture", ["-i", file], { stdio: "ignore" });

  return status;
}

function setupEnv() {
  const shell = `${environment.assetsPath}/setup.sh`;
  const { status, stdout, stderr } = spawnSync(
    "/usr/bin/osascript",
    [
      "-e",
      `tell application "Terminal" to do script "/bin/sh ${shell}"`,
      "-e",
      'tell application "Terminal" to activate',
    ],
    { stdio: "ignore" }
  );
  if (status != 0) {
    showHUD(`Setup Failed!`);
  }
}

export default async function Command() {
  const { mode } = getPreferenceValues<{ mode: TranslateMode }>();
  const ocrPath = `${environment.assetsPath}/ocr`;
  const python = `${environment.assetsPath}/venv/bin/python`;
  const vision = `${environment.assetsPath}/vision.py`;
  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
  if (!fs.existsSync(python)) {
    setupEnv();
  } else {
    const tmpFile = `${ocrPath}/${Date.now()}.png`;
    await fs.promises.mkdir(ocrPath, { recursive: true });
    screencapture(tmpFile);
    if (fs.existsSync(tmpFile)) {
      showHUD("Processing...");
      await delay(1);
      const { status, stdout, stderr } = spawnSync(python, [`${environment.assetsPath}/vision.py`, tmpFile, mode], {
        stdio: "ignore",
      });
      if (status != 0) {
        showHUD(`Failed:${stderr ? stderr.toString() : "none"}`);
      }
    } else {
      showHUD("Cancel");
    }
  }
}
