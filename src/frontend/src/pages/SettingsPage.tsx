import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Activity,
  Loader2,
  Pencil,
  Plus,
  Server,
  Shield,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { ActivityType, Environment } from "../backend.d";
import {
  useActivityTypes,
  useCreateActivityType,
  useCreateEnvironment,
  useDeleteActivityType,
  useDeleteEnvironment,
  useEnvironments,
  useIsAdmin,
  useUpdateActivityType,
  useUpdateEnvironment,
} from "../hooks/useQueries";

function EditableRow({
  name,
  onSave,
  onDelete,
  isSaving,
  isDeleting,
  index,
  type,
}: {
  name: string;
  onSave: (newName: string) => void;
  onDelete: () => void;
  isSaving: boolean;
  isDeleting: boolean;
  index: number;
  type: "activity" | "environment";
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(name);

  function handleSave() {
    if (!value.trim()) return;
    onSave(value.trim());
    setEditing(false);
  }

  const scope = type === "activity" ? "activity" : "environment";

  return (
    <div
      className="flex items-center gap-2 p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors"
      data-ocid={`${scope}.item.${index + 1}`}
    >
      {editing ? (
        <>
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="h-8 flex-1"
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            autoFocus
            data-ocid={`${scope}.input`}
          />
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="h-8 bg-primary text-primary-foreground"
            data-ocid={`${scope}.save_button`}
          >
            {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : "Save"}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setValue(name);
              setEditing(false);
            }}
            className="h-8"
            data-ocid={`${scope}.cancel_button`}
          >
            Cancel
          </Button>
        </>
      ) : (
        <>
          <span className="flex-1 text-sm font-medium text-foreground">
            {name}
          </span>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 text-secondary-text hover:text-accent"
            onClick={() => setEditing(true)}
            data-ocid={`${scope}.edit_button.${index + 1}`}
          >
            <Pencil className="w-3.5 h-3.5" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 text-destructive hover:bg-destructive/10"
                data-ocid={`${scope}.delete_button.${index + 1}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent data-ocid={`${scope}.dialog`}>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete "{name}"?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. Existing log entries referencing
                  this item will still be preserved.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel data-ocid={`${scope}.cancel_button`}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={onDelete}
                  className="bg-destructive text-destructive-foreground"
                  data-ocid={`${scope}.confirm_button`}
                >
                  {isDeleting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Delete"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </div>
  );
}

function AddRow({
  placeholder,
  onAdd,
  isAdding,
  scope,
}: {
  placeholder: string;
  onAdd: (name: string) => void;
  isAdding: boolean;
  scope: string;
}) {
  const [value, setValue] = useState("");

  function handleAdd() {
    if (!value.trim()) return;
    onAdd(value.trim());
    setValue("");
  }

  return (
    <div className="flex gap-2 mt-3">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="h-9 flex-1"
        onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        data-ocid={`${scope}.input`}
      />
      <Button
        onClick={handleAdd}
        disabled={isAdding || !value.trim()}
        className="h-9 bg-primary text-primary-foreground"
        data-ocid={`${scope}.primary_button`}
      >
        {isAdding ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            <Plus className="w-4 h-4 mr-1" />
            Add
          </>
        )}
      </Button>
    </div>
  );
}

export default function SettingsPage() {
  const { data: isAdmin, isLoading: loadingAdmin } = useIsAdmin();
  const { data: activityTypes = [], isLoading: loadingTypes } =
    useActivityTypes();
  const { data: environments = [], isLoading: loadingEnvs } = useEnvironments();

  const createActivity = useCreateActivityType();
  const createEnv = useCreateEnvironment();
  const updateActivity = useUpdateActivityType();
  const updateEnv = useUpdateEnvironment();
  const deleteActivity = useDeleteActivityType();
  const deleteEnv = useDeleteEnvironment();

  if (loadingAdmin) {
    return (
      <div className="p-6">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-secondary-text mt-1">
          Manage activity types and environments
        </p>
      </div>

      {!isAdmin && (
        <Card
          className="shadow-card mb-6 border-amber-200 bg-amber-50"
          data-ocid="settings.panel"
        >
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-amber-600" />
              <div>
                <p className="text-sm font-semibold text-amber-800">
                  Read-Only Mode
                </p>
                <p className="text-xs text-amber-700 mt-0.5">
                  Only admins can create, edit, or delete activity types and
                  environments. Contact your administrator for changes.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Types */}
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Activity className="w-4 h-4 text-accent" />
              Activity Types
              <Badge variant="secondary" className="ml-auto text-xs">
                {activityTypes.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingTypes ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12" />
                ))}
              </div>
            ) : (
              <div className="space-y-2" data-ocid="activity.list">
                {activityTypes.length === 0 ? (
                  <p
                    className="text-sm text-secondary-text text-center py-4"
                    data-ocid="activity.empty_state"
                  >
                    No activity types yet
                  </p>
                ) : (
                  activityTypes.map((at: ActivityType, i) => (
                    <EditableRow
                      key={String(at.id)}
                      name={at.name}
                      onSave={(name) =>
                        updateActivity.mutate(
                          { id: at.id, name },
                          {
                            onSuccess: () =>
                              toast.success("Activity type updated"),
                            onError: () => toast.error("Failed to update"),
                          },
                        )
                      }
                      onDelete={() =>
                        deleteActivity.mutate(at.id, {
                          onSuccess: () =>
                            toast.success("Activity type deleted"),
                          onError: () => toast.error("Failed to delete"),
                        })
                      }
                      isSaving={updateActivity.isPending}
                      isDeleting={deleteActivity.isPending}
                      index={i}
                      type="activity"
                    />
                  ))
                )}
              </div>
            )}
            {isAdmin && (
              <AddRow
                placeholder="New activity type name..."
                onAdd={(name) =>
                  createActivity.mutate(name, {
                    onSuccess: () => toast.success("Activity type created"),
                    onError: () => toast.error("Failed to create"),
                  })
                }
                isAdding={createActivity.isPending}
                scope="activity"
              />
            )}
          </CardContent>
        </Card>

        {/* Environments */}
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Server className="w-4 h-4 text-accent" />
              Environments
              <Badge variant="secondary" className="ml-auto text-xs">
                {environments.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingEnvs ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12" />
                ))}
              </div>
            ) : (
              <div
                className="space-y-2 max-h-80 overflow-y-auto"
                data-ocid="environment.list"
              >
                {environments.length === 0 ? (
                  <p
                    className="text-sm text-secondary-text text-center py-4"
                    data-ocid="environment.empty_state"
                  >
                    No environments yet
                  </p>
                ) : (
                  environments.map((env: Environment, i) => (
                    <EditableRow
                      key={String(env.id)}
                      name={env.name}
                      onSave={(name) =>
                        updateEnv.mutate(
                          { id: env.id, name },
                          {
                            onSuccess: () =>
                              toast.success("Environment updated"),
                            onError: () => toast.error("Failed to update"),
                          },
                        )
                      }
                      onDelete={() =>
                        deleteEnv.mutate(env.id, {
                          onSuccess: () => toast.success("Environment deleted"),
                          onError: () => toast.error("Failed to delete"),
                        })
                      }
                      isSaving={updateEnv.isPending}
                      isDeleting={deleteEnv.isPending}
                      index={i}
                      type="environment"
                    />
                  ))
                )}
              </div>
            )}
            {isAdmin && (
              <AddRow
                placeholder="New environment name..."
                onAdd={(name) =>
                  createEnv.mutate(name, {
                    onSuccess: () => toast.success("Environment created"),
                    onError: () => toast.error("Failed to create"),
                  })
                }
                isAdding={createEnv.isPending}
                scope="environment"
              />
            )}
          </CardContent>
        </Card>
      </div>

      <footer className="mt-12 text-center text-xs text-secondary-text">
        © {new Date().getFullYear()}. Built with ❤️ using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-accent transition-colors"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
