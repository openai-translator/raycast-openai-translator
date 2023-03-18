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

export default async function Command() {
  const { mode, language, level, customWords } = getPreferenceValues<{ mode: TranslateMode, language: string, level: string, customWords: string }>();
  const ocrPath = `${environment.assetsPath}/ocr_img`;
  const binary = `${environment.assetsPath}/ocr`;
  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
  const tmpFile = `${ocrPath}/${Date.now()}.png`;
  await fs.promises.mkdir(ocrPath, { recursive: true });
  screencapture(tmpFile);
  if (fs.existsSync(tmpFile)) {
    showHUD("Processing...");
    await delay(1);
    console.log(binary)
    console.log([tmpFile, language, `"${customWords}"`, level, mode])
    const { status, output, stdout, stderr, error } = spawnSync(binary, [tmpFile, language, `"${customWords}"`, level, mode]);
    console.log(status)
    console.log(output)
    console.log(error)
    console.log(stdout ? stdout.toString(): "none")

    if (status != 0) {
      showHUD(`Failed:${stderr ? stderr.toString() : "none"}`);
    }
  } else {
    showHUD("Cancel");
  }

}
