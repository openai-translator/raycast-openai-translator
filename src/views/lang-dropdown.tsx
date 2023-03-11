import { List } from "@raycast/api";
import { supportLanguages } from "../providers/openai/lang"

type DrinkType = { id: string; name: string };

export function LangDropdown(props: { selectedStandardLang: string, onLangChange: (newStandardLang: string) => void }) {
  const { selectedStandardLang, onLangChange } = props;
  return (
    <List.Dropdown
      tooltip="Select Drink Type"
      storeValue={true}
      onChange={(newValue) => {
        onLangChange(newValue);
      }}
    >
      <List.Dropdown.Section title="Alcoholic Beverages">
        {supportLanguages.map(([standardLang, lang]) => (
          <List.Dropdown.Item key={standardLang} title={lang} value={standardLang} />
        ))}
      </List.Dropdown.Section>
    </List.Dropdown>
  );
}
