import { getPreferenceValues, launchCommand, LaunchProps } from "@raycast/api";
import getBase from "./base";
import { TranslateMode } from "./providers/types";

export default function Command(props: LaunchProps) {
  const { mode } = getPreferenceValues<{ mode: TranslateMode }>();

  await launchCommand({
    name: mode,
    type: LaunchType.UserInitiated,
    context: {
      mode,
      autoStart: true,
      loadSelected: false,
      loadClipboard: true,
    }
  });
}
