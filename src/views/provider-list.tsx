import { Action, ActionPanel, confirmAlert, Icon, List,  showToast, Toast, useNavigation } from "@raycast/api";
import { ProvidersHook, Record } from "../hooks/useProvider";
import { ProviderForm } from "./provider-form";


export interface ProviderListProps {
  hook: ProvidersHook;
}

export function ProviderList(props: ProviderListProps) {
  const { push, pop } = useNavigation()
  const { hook } = props
  const isSelecting = (record: Record) => {
    return hook.selected?.id == record.id
  }
  console.log(hook.data)


  const createForm = (target) => (
    <ProviderForm
        record={target}
        hook={hook}
        onDone={pop}
        onCancel={pop}
      />
  )



  const providerActionPanel = (item) => (
    <ActionPanel>
      {item.id != hook.selected?.id &&
        <Action
          title="Select"
          icon={{ source: Icon.Check }}
          onAction={async () => {
            hook.setSelected(item)
          }}
        />
      }
      <Action
        title="Edit..."
        icon={{ source: Icon.Pencil}}
        onAction={() => push(createForm(item))}
      />
      <Action
        title="Create New..."
        icon={{ source: Icon.Plus }}
        shortcut={{ modifiers: ["cmd"], key: "n" }}
        onAction={() => push(createForm(undefined))}
      />
      <Action
        title="Delete"
        icon={{ source: Icon.Trash, tintColor: "red" }}
        shortcut={{ modifiers: ["ctrl"], key: "x" }}
        style={ Action.Style.Destructive }
        onAction={async () => {
          await confirmAlert({
            title: "Delete Provider",
            message: `Are you sure you want to delete ${item.props.name}?`,
            primaryAction: {
              title: "Delete",
              onAction: async () => {
                hook.remove(item)
              },
            },
          });
        }}
      />
    </ActionPanel>
  )

  return hook.isLoading || hook.data.length !=0 ?
    (
      <List isLoading={hook.isLoading}>
        {hook.data.map((item, i) => (
          <List.Item
            id={item.id}
            key={item.id}
            icon={isSelecting(item) ? Icon.CheckCircle : Icon.Circle}
            title={item.props.name}
            accessories={[{ text: `#${i}` }]}
            actions={ providerActionPanel(item) }/>
        ))}
      </List>
    ):
    (
      showToast({
        title: "Custom providers is empty",
        message: "at least 1 provider is required.",
        style: Toast.Style.Failure
      }) &&
      <ProviderForm
        record={undefined}
        hook={hook}
      />
    );
}
