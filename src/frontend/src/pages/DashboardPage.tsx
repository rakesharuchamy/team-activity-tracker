import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  CalendarDays,
  FileText,
  Loader2,
  Plus,
  Server,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { ActivityType, Environment, WorkLogEntry } from "../backend.d";
import {
  useActivityTypes,
  useCreateWorkLogEntry,
  useDeleteWorkLogEntry,
  useEnvironments,
  useMyWorkLogEntries,
} from "../hooks/useQueries";

const SKELETON_KEYS = ["sk-0", "sk-1", "sk-2", "sk-3", "sk-4", "sk-5"];

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function formatTime(timestamp: bigint) {
  const ms = Number(timestamp / 1_000_000n);
  return new Date(ms).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function WorkLogCard({
  entry,
  activityTypes,
  environments,
  onDelete,
  isDeleting,
  index,
}: {
  entry: WorkLogEntry;
  activityTypes: ActivityType[];
  environments: Environment[];
  onDelete: (id: bigint) => void;
  isDeleting: boolean;
  index: number;
}) {
  const actType = activityTypes.find((a) => a.id === entry.activityTypeId);
  const envNames = entry.environmentIds.map(
    (eid) => environments.find((e) => e.id === eid)?.name ?? String(eid),
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      data-ocid={`worklog.item.${index + 1}`}
    >
      <Card className="shadow-card hover:shadow-card-hover transition-shadow">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-accent/10 text-accent border-0 text-xs font-semibold">
                  {actType?.name ?? "Unknown"}
                </Badge>
                <span className="text-xs text-secondary-text">
                  {formatTime(entry.timestamp)}
                </span>
              </div>
              <div className="flex items-start gap-1.5 mb-2">
                <Server className="w-3.5 h-3.5 text-secondary-text mt-0.5 flex-shrink-0" />
                <div className="flex flex-wrap gap-1">
                  {envNames.map((name) => (
                    <span
                      key={name}
                      className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-md font-medium"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              </div>
              {entry.notes && (
                <div className="flex items-start gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-secondary-text mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-body-text">{entry.notes}</p>
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:bg-destructive/10 flex-shrink-0"
              onClick={() => onDelete(entry.id)}
              disabled={isDeleting}
              data-ocid={`worklog.delete_button.${index + 1}`}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function DashboardPage() {
  const today = todayStr();
  const [selectedActivity, setSelectedActivity] = useState<string>("");
  const [selectedEnvIds, setSelectedEnvIds] = useState<Set<string>>(new Set());
  const [notes, setNotes] = useState("");
  const [showForm, setShowForm] = useState(false);

  const { data: activityTypes = [], isLoading: loadingTypes } =
    useActivityTypes();
  const { data: environments = [], isLoading: loadingEnvs } = useEnvironments();
  const { data: todayLogs = [], isLoading: loadingLogs } = useMyWorkLogEntries(
    today,
    today,
  );
  const createEntry = useCreateWorkLogEntry();
  const deleteEntry = useDeleteWorkLogEntry();

  const activitySummary = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const log of todayLogs) {
      const name =
        activityTypes.find((a) => a.id === log.activityTypeId)?.name ??
        "Unknown";
      counts[name] = (counts[name] ?? 0) + 1;
    }
    return counts;
  }, [todayLogs, activityTypes]);

  function toggleEnv(id: string) {
    setSelectedEnvIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleSubmit() {
    if (!selectedActivity) {
      toast.error("Please select an activity type");
      return;
    }
    if (selectedEnvIds.size === 0) {
      toast.error("Please select at least one environment");
      return;
    }
    try {
      await createEntry.mutateAsync({
        activityTypeId: BigInt(selectedActivity),
        environmentIds: Array.from(selectedEnvIds).map(BigInt),
        notes: notes.trim() || null,
        date: today,
      });
      toast.success("Activity logged successfully!");
      setSelectedActivity("");
      setSelectedEnvIds(new Set());
      setNotes("");
      setShowForm(false);
    } catch {
      toast.error("Failed to log activity. Please try again.");
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Daily Activity Dashboard
          </h1>
          <div className="flex items-center gap-1.5 mt-1">
            <CalendarDays className="w-4 h-4 text-secondary-text" />
            <p className="text-sm text-secondary-text">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
        <Button
          onClick={() => setShowForm((v) => !v)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
          data-ocid="dashboard.open_modal_button"
        >
          <Plus className="w-4 h-4 mr-2" />
          Log Activity
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="shadow-card" data-ocid="logactivity.card">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base font-semibold">
                    Log Today's Work
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-secondary-text uppercase tracking-wide">
                      Activity Type
                    </Label>
                    {loadingTypes ? (
                      <Skeleton className="h-10 w-full" />
                    ) : (
                      <Select
                        value={selectedActivity}
                        onValueChange={setSelectedActivity}
                      >
                        <SelectTrigger
                          className="h-10"
                          data-ocid="logactivity.select"
                        >
                          <SelectValue placeholder="Select activity type..." />
                        </SelectTrigger>
                        <SelectContent>
                          {activityTypes.map((at) => (
                            <SelectItem
                              key={String(at.id)}
                              value={String(at.id)}
                            >
                              {at.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  {selectedActivity && (
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-secondary-text uppercase tracking-wide">
                        Select Environments ({selectedEnvIds.size} selected)
                      </Label>
                      {loadingEnvs ? (
                        <div className="grid grid-cols-3 gap-2">
                          {SKELETON_KEYS.map((k) => (
                            <Skeleton key={k} className="h-8" />
                          ))}
                        </div>
                      ) : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                          {environments.map((env) => {
                            const checkId = `env-check-${env.id}`;
                            const isChecked = selectedEnvIds.has(
                              String(env.id),
                            );
                            return (
                              <div
                                key={String(env.id)}
                                className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                                  isChecked
                                    ? "border-accent bg-accent/5"
                                    : "border-border hover:bg-muted"
                                }`}
                                onClick={() => toggleEnv(String(env.id))}
                                onKeyDown={(e) =>
                                  (e.key === "Enter" || e.key === " ") &&
                                  toggleEnv(String(env.id))
                                }
                                data-ocid="logactivity.checkbox"
                              >
                                <Checkbox
                                  id={checkId}
                                  checked={isChecked}
                                  onCheckedChange={() =>
                                    toggleEnv(String(env.id))
                                  }
                                  className="data-[state=checked]:bg-accent data-[state=checked]:border-accent"
                                />
                                <label
                                  htmlFor={checkId}
                                  className="text-xs font-medium truncate cursor-pointer"
                                >
                                  {env.name}
                                </label>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <Label
                      htmlFor="activity-notes"
                      className="text-xs font-semibold text-secondary-text uppercase tracking-wide"
                    >
                      Notes (optional)
                    </Label>
                    <Textarea
                      id="activity-notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add any additional notes..."
                      rows={2}
                      className="resize-none"
                      data-ocid="logactivity.textarea"
                    />
                  </div>

                  <div className="flex gap-2 pt-1">
                    <Button
                      onClick={handleSubmit}
                      disabled={createEntry.isPending}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                      data-ocid="logactivity.submit_button"
                    >
                      {createEntry.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Activity"
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowForm(false)}
                      data-ocid="logactivity.cancel_button"
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <div>
            <h2 className="text-base font-semibold text-foreground mb-3">
              Today's Work Log
              {todayLogs.length > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {todayLogs.length}
                </Badge>
              )}
            </h2>
            {loadingLogs ? (
              <div className="space-y-3">
                {["log-sk-0", "log-sk-1"].map((k) => (
                  <Skeleton key={k} className="h-24" />
                ))}
              </div>
            ) : todayLogs.length === 0 ? (
              <Card className="shadow-card" data-ocid="worklog.empty_state">
                <CardContent className="py-12 text-center">
                  <Server className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-40" />
                  <p className="text-secondary-text font-medium">
                    No activities logged today
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Click "Log Activity" to get started
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {todayLogs.map((entry, i) => (
                  <WorkLogCard
                    key={String(entry.id)}
                    entry={entry}
                    activityTypes={activityTypes}
                    environments={environments}
                    onDelete={(id) =>
                      deleteEntry.mutate(id, {
                        onSuccess: () => toast.success("Entry deleted"),
                        onError: () => toast.error("Failed to delete"),
                      })
                    }
                    isDeleting={deleteEntry.isPending}
                    index={i}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <Card className="shadow-card sticky top-6" data-ocid="summary.card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">
                Activity Summary: Today
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {activityTypes.length === 0 ? (
                <p className="text-sm text-secondary-text">
                  No activity types configured.
                </p>
              ) : (
                activityTypes.map((at) => {
                  const count = activitySummary[at.name] ?? 0;
                  return (
                    <div
                      key={String(at.id)}
                      className="flex items-center justify-between py-2 border-b border-border last:border-0"
                    >
                      <span className="text-sm text-body-text font-medium">
                        {at.name}
                      </span>
                      <Badge
                        variant={count > 0 ? "default" : "secondary"}
                        className={
                          count > 0 ? "bg-accent text-white border-0" : ""
                        }
                      >
                        {count}
                      </Badge>
                    </div>
                  );
                })
              )}
              <div className="pt-2 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">
                    Total Entries
                  </span>
                  <span className="text-sm font-bold text-accent">
                    {todayLogs.length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
