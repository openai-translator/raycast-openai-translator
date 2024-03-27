import { getPreferenceValues, launchCommand, LaunchProps, LaunchType } from "@raycast/api";
import getBase from "./base";
import { TranslateMode } from "./providers/types";

export default async function Command(props: LaunchProps) {
  const { mode } = getPreferenceValues<{ mode: TranslateMode }>();

  await launchCommand({
    name: mode,
    type: LaunchType.UserInitiated,
    context: {
      mode,
      autoStart: true,
      loadSelected: true,
      loadClipboard: false,
    }
  });
}
