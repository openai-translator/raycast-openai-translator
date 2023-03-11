import { Action, ActionPanel, clearSearchBar, getPreferenceValues, Icon, List, showToast, Toast } from "@raycast/api";
import { DetailView } from "./detail"
import { EmptyView } from "./empty";
import { translate, TranslateQuery } from "../providers/openai/translate"
import { QueryHook } from "../hooks/useQuery"
import { useHistory, Record, HistoryHook } from "../hooks/useHistory";
import { useEffect, useRef, useState } from "react";
import { detectLang } from "../providers/openai/lang";
import { v4 as uuidv4 } from "uuid";

export interface ContentViewProps {
  query: QueryHook,
  history: HistoryHook,
  setSelectedId: (value: string) => void
}

export interface Querying {
  hook: QueryHook
  query: TranslateQuery
  id: string
}

type ViewItem = Querying | Record

export const ContentView = (props: ContentViewProps) => {
  const { query, history, setSelectedId } = props

  const [data, setData] = useState<ViewItem[]>([])
  const [querying, setQuerying] = useState<Querying | null>()
  const [translatedText, setTranslatedText] = useState("")
  const { entrypoint, apikey } = getPreferenceValues<{ entrypoint: string, apikey: string }>()

  const ref = useRef<string>()
  function updateData() {
    const sortedResults = history.data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    if (querying == null) {
      setData(sortedResults)
      if(sortedResults.length > 0){
        setSelectedId(sortedResults[0].id)
      }
    } else {
      setData([querying, ...sortedResults])
      setSelectedId("querying")
    }
  }

  async function doQuery() {
    const controller = new AbortController()
    const { signal } = controller
    const detectFrom: string = (await detectLang(query.text)) ?? 'en'
    const toast = await showToast({
      title: "Getting your translation...",
      style: Toast.Style.Animated,
    });
    const text = query.text
    const detectTo = query.to
    const _querying: Querying = {
      hook: query,
      query: {
        mode: "translate",
        signal,
        text,
        detectFrom,
        detectTo,
        onMessage: (message) => {
          if (message.role) {
            return
          }
          setTranslatedText((translatedText) => {
            return translatedText + message.content
          })
        },
        onFinish: (reason) => {
          toast.title = "Got your translation!";
          toast.style = Toast.Style.Success;
          const record: Record = {
            id: uuidv4(),
            created_at: new Date().toISOString(),
            result: {
              from: detectFrom,
              to: detectTo,
              original: text,
              text: ref.current,
            }
          }
          history.add(record)
          query.updateQuerying(false)
        },
        onError: (error) => {
          console.log(error)
          toast.title = "Error";
          toast.message = error;
          toast.style = Toast.Style.Failure;
          const record: Record = {
            id: uuidv4(),
            created_at: new Date().toISOString(),
            result: {
              from: detectFrom,
              to: query.to,
              original: query.text,
              text: ref.current,
              error: error
            }
          }
          history.add(record)
          query.updateQuerying(false)
        },
      },
      id: "querying"
    }
    setTranslatedText("")
    setQuerying(_querying)
    translate(_querying.query, entrypoint, apikey)
  }

  useEffect(() => {
    if (query.querying && !querying) {
      doQuery()
    } else if (!query.querying) {
      if (querying) {
        setQuerying(null)
      }
    }
  }, [query.querying])

  useEffect(() => {
    updateData()
  }, [history.data, querying])

  useEffect(()=>{
    ref.current = translatedText
  }, [translatedText])

  const getQueryingActionPanel = () => (
    <ActionPanel>
    </ActionPanel>
  );

  const getRecordActionPanel = (record: Record) => (
    <ActionPanel>
      {
        query.text && (<Action title="Translate Item" onAction={() => query.updateQuerying(true)} />)
      }
      <ActionPanel.Section title="Copy">
        <Action.CopyToClipboard title="Copy Original" content={record.result.original} />
        <Action.CopyToClipboard title="Copy Translation" content={record.result.text} />
      </ActionPanel.Section>
      <Action title="Delete Translation" icon={Icon.Trash} shortcut= {{ modifiers: ["cmd"], key: "delete" }} onAction={()=>history.remove(record)} />
    </ActionPanel>
  )

  return data.length === 0 ? (
    <EmptyView />
  ) : (
    <List.Section title="Results" subtitle={data.length.toLocaleString()}>
      {data.map((item, i) => {
        return "query" in item
          ? (<List.Item
               id={item.id}
               key={item.id}
               title={item.query.text}
               accessories={[{ text: `#${i}` }]}
               actions={getQueryingActionPanel()}
               detail={
                 <DetailView
                   text={translatedText}
                   original={query.text}
                   from={querying? querying.query.detectFrom : "auto"}
                   to={query.to}
                 />
               }
             />)
          : (<List.Item
               id={item.id}
               key={item.id}
               title={item.result.original}
               accessories={[{ text: `#${i}` }]}
               actions={getRecordActionPanel(item)}
               detail={
                 <DetailView
                   text={item.result.text}
                   original={item.result.original}
                   from={item.result.from}
                   to={item.result.to}
                   created_at={item.created_at}
                 />}
             />)
      })}
    </List.Section>
  );
};
