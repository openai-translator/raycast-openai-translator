import { List, Detail, ActionPanel, Action, getPreferenceValues, LaunchProps } from "@raycast/api";
import { useCallback, useEffect, useState } from "react";
import { ContentView } from "./views/content";
import { useQuery } from "./hooks/useQuery";
import { LangDropdown } from "./views/lang-dropdown"
import { useHistory } from "./hooks/useHistory";


export default function Command(props: LaunchProps) {
  const [selectedId, setSelectedId] = useState<string>('')

  const query = useQuery({ initialQuery: props.fallbackText, disableAutoLoad: false })
  const history = useHistory()

  return (
    <List
      searchText={query.text}
      isShowingDetail={history.data.length > 0 || query.querying ? true : false }
      filtering={false}
      isLoading={query.isLoading}
      selectedItemId={ selectedId }
      onSearchTextChange={query.updateText}
      searchBarAccessory={<LangDropdown selectedStandardLang={query.to} onLangChange={query.updateTo} />}
      throttle={false}
      navigationTitle={"Translate"}
      actions={
        query.text && (<ActionPanel>
                         <Action title="Translate" onAction={()=>query.updateQuerying(true)} />
                       </ActionPanel>)
      }
    >
      <ContentView
        query={query}
        history={history}
        setSelectedId={ setSelectedId }
      />
    </List>
  );
}
