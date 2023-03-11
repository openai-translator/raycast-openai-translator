import { Detail, List } from "@raycast/api";
import { langMap } from "../providers/openai/lang";

export interface DetailViewProps {
  text: string,
  original: string,
  from: string,
  to: string,
  created_at?: string
}


export const DetailView = (props: DetailViewProps) => {
  const { text, original, from, to, created_at } = props;
    return <List.Item.Detail
           markdown={
             `${text}\n\n\`\`\`\n${original}\n\`\`\``
           }
           metadata= {
             <Detail.Metadata>
               <Detail.Metadata.Label title="From" text={`${langMap.get(from) || "Auto"}`} />
               <Detail.Metadata.Label title="To" text={`${langMap.get(to)}`} />
               { created_at && <Detail.Metadata.Label title="Created At" text={`${created_at}`} /> }
             </Detail.Metadata>
           }
         />;
};
