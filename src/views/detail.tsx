import { Detail, List } from "@raycast/api";
import { langMap } from "../providers/openai/lang";
import { TranslateMode } from "../providers/openai/translate";
import capitalize from "capitalize";

export interface DetailViewProps {
  text: string;
  original: string;
  from: string;
  to: string;
  mode: TranslateMode;
  created_at?: string;
  ocrImg: string | undefined;
}

export const DetailView = (props: DetailViewProps) => {
  const { text, original, from, to, mode, created_at, ocrImg } = props;
  const imgMd = ocrImg ? `![](${ocrImg})` : "";
  return (
    <List.Item.Detail
      markdown={`\n${text}\n\n\`\`\`\n${original}\n\`\`\`\n${imgMd}`}
      metadata={
        <Detail.Metadata>
          <Detail.Metadata.Label title="From" text={`${langMap.get(from) || "Auto"}`} />
          <Detail.Metadata.Label title="To" text={`${langMap.get(to)}`} />
          <Detail.Metadata.Label title="Mode" text={capitalize(mode)} />
          {created_at && <Detail.Metadata.Label title="Created At" text={`${created_at}`} />}
        </Detail.Metadata>
      }
    />
  );
};
