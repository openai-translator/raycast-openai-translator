import { LocalStorage, showToast, Toast } from "@raycast/api";
import { useCallback, useEffect, useMemo, useState } from "react";
import { TranslateResult } from "../repo/translate";


export interface Record {
  id: string
  created_at: string;
  result: TranslateResult
}

export interface HistoryHook {
  data: Record[];
  isLoading: boolean;
  add: (arg: Record) => Promise<void>;
  remove: (arg: Record) => Promise<void>;
  clear: () => Promise<void>;
}

export function useHistory(): HistoryHook {
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
      setData([...data, record]);
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
