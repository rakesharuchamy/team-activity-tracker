import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BarChart2, Download, FileSpreadsheet } from "lucide-react";
import { useState } from "react";
import type { WorkLogEntry } from "../backend.d";
import {
  useActivityTypes,
  useAllTeamWorkLogs,
  useEnvironments,
} from "../hooks/useQueries";

const SKELETON_KEYS = ["sk-0", "sk-1", "sk-2"];

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function monthStart() {
  const d = new Date();
  d.setDate(1);
  return d.toISOString().slice(0, 10);
}

function shortPrincipal(p: { toString(): string }) {
  const s = p.toString();
  return `${s.slice(0, 8)}...`;
}

export default function ReportsPage() {
  const [startDate, setStartDate] = useState(monthStart());
  const [endDate, setEndDate] = useState(todayStr());
  const [activityFilter, setActivityFilter] = useState<string>("all");

  const { data: activityTypes = [] } = useActivityTypes();
  const { data: environments = [] } = useEnvironments();
  const { data: logs = [], isLoading } = useAllTeamWorkLogs(
    startDate,
    endDate,
    null,
    activityFilter !== "all" ? BigInt(activityFilter) : null,
  );

  const getEnvNames = (entry: WorkLogEntry) =>
    entry.environmentIds
      .map((eid) => environments.find((e) => e.id === eid)?.name ?? String(eid))
      .join(", ");

  const getActivityName = (entry: WorkLogEntry) =>
    activityTypes.find((a) => a.id === entry.activityTypeId)?.name ?? "Unknown";

  function downloadCSV() {
    const headers = [
      "Date",
      "Member",
      "Activity Type",
      "Environments",
      "Notes",
    ];
    const rows = logs.map((entry) => [
      entry.date,
      entry.user.toString(),
      getActivityName(entry),
      `"${getEnvNames(entry)}"`,
      `"${entry.notes ?? ""}"`,
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `team-activity-${startDate}-to-${endDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const totalEntries = logs.length;
  const uniqueMembers = new Set(logs.map((l) => l.user.toString())).size;
  const byActivity: Record<string, number> = {};
  for (const l of logs) {
    const name = getActivityName(l);
    byActivity[name] = (byActivity[name] ?? 0) + 1;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Reports</h1>
        <p className="text-sm text-secondary-text mt-1">
          Generate and export activity reports for any date range
        </p>
      </div>

      <Card className="shadow-card mb-6">
        <CardContent className="pt-5">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <Label
                htmlFor="rp-start"
                className="text-xs font-semibold text-secondary-text uppercase tracking-wide"
              >
                Start Date
              </Label>
              <Input
                id="rp-start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-9"
                data-ocid="reports.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="rp-end"
                className="text-xs font-semibold text-secondary-text uppercase tracking-wide"
              >
                End Date
              </Label>
              <Input
                id="rp-end"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-9"
                data-ocid="reports.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-secondary-text uppercase tracking-wide">
                Activity Type
              </Label>
              <Select value={activityFilter} onValueChange={setActivityFilter}>
                <SelectTrigger className="h-9" data-ocid="reports.select">
                  <SelectValue placeholder="All activities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All activities</SelectItem>
                  {activityTypes.map((at) => (
                    <SelectItem key={String(at.id)} value={String(at.id)}>
                      {at.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                onClick={downloadCSV}
                disabled={logs.length === 0}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-9"
                data-ocid="reports.primary_button"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <Card className="shadow-card">
          <CardContent className="pt-5">
            <p className="text-xs text-secondary-text font-semibold uppercase tracking-wide">
              Total Entries
            </p>
            <p className="text-2xl font-bold text-foreground mt-1">
              {totalEntries}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="pt-5">
            <p className="text-xs text-secondary-text font-semibold uppercase tracking-wide">
              Team Members
            </p>
            <p className="text-2xl font-bold text-foreground mt-1">
              {uniqueMembers}
            </p>
          </CardContent>
        </Card>
        {activityTypes.slice(0, 2).map((at) => (
          <Card key={String(at.id)} className="shadow-card">
            <CardContent className="pt-5">
              <p className="text-xs text-secondary-text font-semibold uppercase tracking-wide truncate">
                {at.name}
              </p>
              <p className="text-2xl font-bold text-accent mt-1">
                {byActivity[at.name] ?? 0}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-accent" />
              Report Data
            </CardTitle>
            <Badge variant="secondary" className="text-xs">
              {logs.length} rows
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3" data-ocid="reports.loading_state">
              {SKELETON_KEYS.map((k) => (
                <Skeleton key={k} className="h-10" />
              ))}
            </div>
          ) : logs.length === 0 ? (
            <div className="py-16 text-center" data-ocid="reports.empty_state">
              <BarChart2 className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-40" />
              <p className="text-secondary-text font-medium">
                No data for selected range
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Adjust filters to see results
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto" data-ocid="reports.table">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="text-xs font-semibold uppercase text-secondary-text">
                      Date
                    </TableHead>
                    <TableHead className="text-xs font-semibold uppercase text-secondary-text">
                      Member
                    </TableHead>
                    <TableHead className="text-xs font-semibold uppercase text-secondary-text">
                      Activity
                    </TableHead>
                    <TableHead className="text-xs font-semibold uppercase text-secondary-text">
                      Environments
                    </TableHead>
                    <TableHead className="text-xs font-semibold uppercase text-secondary-text">
                      Notes
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((entry, i) => (
                    <TableRow
                      key={String(entry.id)}
                      className="border-b border-border hover:bg-muted/30"
                      data-ocid={`reports.row.${i + 1}`}
                    >
                      <TableCell className="text-xs text-secondary-text">
                        {entry.date}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs font-mono">
                          {shortPrincipal(entry.user)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-accent/10 text-accent border-0 text-xs">
                          {getActivityName(entry)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-body-text max-w-52 truncate">
                        {getEnvNames(entry)}
                      </TableCell>
                      <TableCell className="text-xs text-secondary-text">
                        {entry.notes ?? "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
