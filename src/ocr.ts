import { environment, getPreferenceValues, showHUD, updateCommandMetadata } from "@raycast/api";
import { spawn, spawnSync } from "child_process";
import fs from "fs";
import { TranslateMode } from "./providers/openai/translate";

async function fetchUnreadNotificationCount() {
  return 10;
}

function screencapture(file: string){
  const { status, stdout, stderr} = spawnSync(
    '/usr/sbin/screencapture',
    ['-i', file],
    { stdio: 'ignore' })

  return status
}

function setupEnv(python: string){

}


export default async function Command() {
  const { mode } = getPreferenceValues<{ mode: TranslateMode }>();
  const ocrPath = `${environment.assetsPath}/ocr`;
  const python = `${environment.assetsPath}/venv/bin/python`;
  const tmpFile = `${ocrPath}/${Date.now()}.png`;
  fs.mkdirSync(ocrPath, { recursive: true });
  screencapture(tmpFile)
  if(fs.existsSync(tmpFile)){
    // showHUD("Processing...")
    const { status, stdout, stderr } = spawnSync(
      python,
      [`${environment.assetsPath}/vision.py`, tmpFile, mode],
      { stdio: 'ignore' });
    if(status != 0){
      showHUD(`Failed:${stderr ? stderr.toString(): "none"}`);
    }
  }else{
    showHUD("Cancel");
  }
}
