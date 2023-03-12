import { Icon, List } from "@raycast/api";

export const EmptyView = () => (
  <List.EmptyView
    title="Type anything!"
    description={"Type your text and check dst language from the search bar and hit the enter key"}
    icon={Icon.QuestionMark}
  />
);
