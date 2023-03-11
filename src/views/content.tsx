import { ActionPanel, clearSearchBar, getPreferenceValues, Icon, List, showToast, Toast } from "@raycast/api";
import { DetailView } from "./detail"
import { EmptyView } from "./empty";
import { translate, TranslateQuery } from "../providers/openai/translate"
import { QueryHook } from "../hooks/useQuery"
import { useHistory, Record, HistoryHook } from "../hooks/useHistory";
import { useEffect, useState } from "react";
import { detectLang } from "../providers/openai/lang";
import { v4 as uuidv4 } from "uuid";

export interface ContentViewProps {
  query: QueryHook,
  history: HistoryHook
}

export interface Querying {
  hook: QueryHook
  query: TranslateQuery
  id: string
}

type ViewItem = Querying | Record

export const ContentView = (props: ContentViewProps) => {
  const { query, history } = props

  const [data, setData] = useState<ViewItem[]>([])
  const [querying, setQuerying] = useState<Querying | null>(null)
  const [translatedText, setTranslatedText] = useState('')
  const {entrypoint, apikey} = getPreferenceValues<{entrypoint:string, apikey:string}>()

  function updateData(){
    const sortedResults = history.data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    if(querying == null){
      setData(sortedResults)
    }else{
      setData([querying, ...sortedResults])
    }
  }

  async function doQuery(){
    const controller = new AbortController()
    const { signal } = controller
    const detectFrom: string = (await detectLang(query.text)) ?? 'en'
    const toast = await showToast({
      title: "Getting your translation...",
      style: Toast.Style.Animated,
    });
    const _querying:Querying = {
      hook: query,
      query: {
        mode: "translate",
        signal,
        text: query.text,
        detectFrom,
        detectTo: query.to,
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
          query.updateQuerying(false)
          const record: Record = {
            id: uuidv4(),
            created_at: new Date().toISOString(),
            result: {
              from: _querying.query.detectFrom,
              to: _querying.query.detectTo,
              original: _querying.query.text,
              text: translatedText,
              error: null
            }
          }
          history.add(record)
        },
        onError: (error) => {
          toast.title = "Error";
          toast.message = error;
          toast.style = Toast.Style.Failure;
          query.updateQuerying(false)
          const record: Record = {
            id: uuidv4(),
            created_at: new Date().toISOString(),
            result: {
              from: _querying.query.detectFrom,
              to: _querying.query.detectTo,
              original: _querying.query.text,
              text: translatedText,
              error: error
            }
          }
          history.add(record)
        },
      },
      id: "querying"
    }
    setQuerying(_querying)
    translate(_querying.query, entrypoint, apikey)
  }

  useEffect(()=>{
    if(query.querying && !querying){
      doQuery()
    }else if(!query.querying){
      if(querying){
        setQuerying(null)
      }
    }
  }, [query.querying])

  useEffect(()=>{
    updateData()
  },[history.data, querying])

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
               accessories={[{ text: "#TODO" }]}
               detail={ <DetailView result={translatedText} />}
             />)
          : (<List.Item
               id={item.id}
               key={item.id}
               title={item.result.text}
               accessories={[{ text: "#TODO" }]}
               detail={item.result.text && <DetailView result={item.result.text}  />}
             />)
      })}
    </List.Section>
  );
};
