import { List, Detail, ActionPanel, Action, getPreferenceValues } from "@raycast/api";
import { useCallback, useEffect, useState } from "react";
import { ContentView } from "./views/content";
import { useQuery } from "./hooks/useQuery";
import { LangDropdown } from "./views/lang-dropdown"
import { useHistory } from "./hooks/useHistory";


export default function Command() {
  const [isLoading, setLoading] = useState<boolean>(false)
  const query = useQuery({ disableAutoLoad: false })
  const history = useHistory()
  return (
    <List
      searchText={query.text}
      isShowingDetail={history.data.length > 0 || query.querying ? true : false }
      filtering={false}
      isLoading={isLoading ? isLoading : query.isLoading}
      onSearchTextChange={query.updateText}
      searchBarAccessory={<LangDropdown selectedStandardLang={query.to} onLangChange={query.updateTo} />}
      throttle={false}
      navigationTitle={"Translate"}
      actions={
        <ActionPanel>
          <Action title="Translate" onAction={()=>query.updateQuerying(true)} />
        </ActionPanel>
      }
    >
      <ContentView
        query={query}
        history={history}
      />
    </List>
  );
}
