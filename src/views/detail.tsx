import { List } from "@raycast/api";


export const DetailView = (props: { result: string }) => {
    const { result } = props;
  return <List.Item.Detail markdown={result} />;
};
