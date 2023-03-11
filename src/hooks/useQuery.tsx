import { getPreferenceValues, getSelectedText, showToast, Toast, Clipboard } from "@raycast/api";
import { useCallback, useEffect, useMemo, useState } from "react";

export interface QueryHook {
  text: string
  to: string
  querying: boolean
  isLoading: boolean
  updateText: (arg: string) => Promise<void>
  updateTo: (arg: string) => Promise<void>
  updateQuerying: (arg: boolean) => Promise<void>
}

export function useQuery(props: { disableAutoLoad?: boolean }): QueryHook {
  const { disableAutoLoad } = props;
  const { toLang, isAutoLoadSelected, isAutoLoadClipboard} =
    getPreferenceValues<{toLang: string, isAutoLoadSelected: boolean, isAutoLoadClipboard: boolean;}>()
  const [text, setText] = useState<string>("");
  const [to, setTo] = useState<string>(toLang)
  const [isLoading, setLoading] = useState<boolean>(false);
  const [querying, setQuerying] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      if (isAutoLoadSelected && !disableAutoLoad) {
        setLoading(true);
        try {
          const selectedText = await getSelectedText();
          if (selectedText.length > 1) {
            setText(selectedText.trim());
            await showToast({
              style: Toast.Style.Success,
              title: "Selected text loaded!",
            });
          }
        } catch (error) {
          await showToast({
            style: Toast.Style.Failure,
            title: "Selected text couldn't load",
            message: String(error),
          });
        }
        setLoading(false);
      } else if(isAutoLoadClipboard && !disableAutoLoad) {
        setLoading(true);
        try {
          const { text } = await Clipboard.read();
          if (text.length > 1) {
            setText(text.trim());
            await showToast({
              style: Toast.Style.Success,
              title: "Clipboard text loaded!",
            });
          }
        } catch (error) {
          await showToast({
            style: Toast.Style.Failure,
            title: "Clipboard text couldn't load",
            message: String(error),
          });
        }
        setLoading(false);
      }
    })();
  }, []);

  const updateText = useCallback(
    async (text: string) => {
      setText(text);
    },
    [setText, text]
  );

  const updateTo = useCallback(
    async (_to: string) => {
      setTo(_to);
    },
    [setTo, to]
  );

  const updateQuerying = useCallback(
    async (value: boolean) => {
      setQuerying(value);
    },
    [setQuerying, querying]
  );

  return useMemo(() => ({ text, to, querying, isLoading, updateText, updateTo, updateQuerying }), [text, to, querying, isLoading, updateText, updateTo, updateQuerying]);
}
