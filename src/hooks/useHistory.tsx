import { getPreferenceValues, LocalStorage, showToast, Toast } from "@raycast/api";
import { useCallback, useEffect, useMemo, useState } from "react";
import { TranslateMode, TranslateResult } from "../providers/openai/translate";
import { promises as fs } from "fs"

export interface Record {
  id: string;
  created_at: string;
  mode: TranslateMode;
  result: TranslateResult;
  ocrImg: string | undefined;
}

export interface HistoryHook {
  data: Record[];
  isLoading: boolean;
  add: (arg: Record) => Promise<void>;
  remove: (arg: Record) => Promise<void>;
  clear: () => Promise<void>;
}

export function useHistory(): HistoryHook {
  const { maxHistorySize } = getPreferenceValues<{ maxHistorySize: string }>();
  const [data, setData] = useState<Record[]>([]);
  const [isLoading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    (async () => {
      const storedHistory = await LocalStorage.getItem<string>("history");

      if (storedHistory) {
        setData((previous) => [...previous, ...JSON.parse(storedHistory)]);
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    LocalStorage.setItem("history", JSON.stringify(data));
  }, [data]);

  const add = useCallback(

    async (record: Record) => {
      console.log(`add ${record.created_at}`)
      const max = parseInt(maxHistorySize) || 30;
      const slice = data.length > max ? data.slice(data.length - max, data.length) : data;
      const remove = data.slice(0, data.length - max)
      for (let r of remove) {
        if(r.ocrImg) {
          await fs.unlink(r.ocrImg)
        }
      }
      setData([...slice, record]);
    },
    [setData, data]
  );

  const remove = useCallback(
    async (record: Record) => {
      const toast = await showToast({
        title: "Removing record...",
        style: Toast.Style.Animated,
      });
      const newHistory: Record[] = data.filter((item) => item.id !== record.id);
      if(record.ocrImg) {
        await fs.unlink(record.ocrImg)
      }
      setData(newHistory);
      toast.title = "Record removed!";
      toast.style = Toast.Style.Success;
    },
    [setData, data]
  );

  const clear = useCallback(async () => {
    const toast = await showToast({
      title: "Clearing history...",
      style: Toast.Style.Animated,
    });
    setData([]);
    toast.title = "History cleared!";
    toast.style = Toast.Style.Success;
  }, [setData]);

  return useMemo(() => ({ data, isLoading, add, remove, clear }), [data, isLoading, add, remove, clear]);
}
