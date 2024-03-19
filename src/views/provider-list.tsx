import { Action, ActionPanel, confirmAlert, getPreferenceValues, Icon, List, showToast, Toast } from "@raycast/api";
import capitalize from "capitalize";
import { useEffect, useState } from "react";
import { ProvidersHook, Record } from "../hooks/useProvider";
import { ProviderForm } from "./provider-form";


export interface ProviderListProps {
  hook: ProvidersHook;
}

export function ProviderList(props: ProviderListProps) {
  const { hook } = props
  const isSelecting = (record: Record) => {
    return hook.selected?.id == record.id
  }
  const [mode, setMode] = useState<string>("list")
  const [target, setTarget] = useState<Record | undefined>(undefined)
  console.log(hook.data)
  console.log(mode)
  return hook.isLoading || (hook.data.length !=0 && mode == "list")?
    (
      <List isLoading={hook.isLoading}>
        {hook.data.map((item, i) => (
          <List.Item
            id={item.id}
            key={item.id}
            icon={isSelecting(item) ? Icon.Checkmark : Icon.Circle}
            title={item.props.name}
            accessories={[{ text: `#${i}` }]}
            actions={
              <ActionPanel>
                {item.id != hook.selected?.id &&
                  <Action
                    title="Select"
                    icon={{ source: Icon.Play, tintColor: "green" }}
                    onAction={async () => {
                      hook.setSelected(item)
                    }}
                  />
                }
                <Action
                  title="Edit..."
                  icon={{ source: Icon.Pencil, tintColor: "blue" }}
                  onAction={
                    () => {
                      setTarget(item)
                      setMode("edit")
                    }
                  }
                />
                <Action
                  title="Create New..."
                  icon={{ source: Icon.Plus, tintColor: "green" }}
                  onAction={() => {
                    setMode("create")
                  }
                  }
                />
                <Action
                  title="Delete"
                  icon={{ source: Icon.Trash, tintColor: "red" }}
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
            }/>
        ))}
      </List>
    ):
    (
      <ProviderForm
        record={mode == "edit" ? target: undefined}
        hook={hook}
        onDone={() => {
          setMode("list")
        }}
        onCancel={() => {
          setMode("list")
        }}
      />
    );
}
