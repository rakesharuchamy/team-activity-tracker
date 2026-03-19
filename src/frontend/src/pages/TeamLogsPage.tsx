import { Badge } from "@/components/ui/badge";
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
import { CalendarDays, Filter, Users } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { WorkLogEntry } from "../backend.d";
import {
  useActivityTypes,
  useAllTeamWorkLogs,
  useEnvironments,
} from "../hooks/useQueries";

const SKELETON_KEYS = ["sk-0", "sk-1", "sk-2", "sk-3"];

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function sevenDaysAgo() {
  const d = new Date();
  d.setDate(d.getDate() - 6);
  return d.toISOString().slice(0, 10);
}

function shortPrincipal(p: { toString(): string }) {
  const s = p.toString();
  return `${s.slice(0, 8)}...`;
}

function formatTime(timestamp: bigint) {
  const ms = Number(timestamp / 1_000_000n);
  return new Date(ms).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TeamLogsPage() {
  const [startDate, setStartDate] = useState(sevenDaysAgo());
  const [endDate, setEndDate] = useState(todayStr());
  const [activityFilter, setActivityFilter] = useState<string>("all");

  const { data: activityTypes = [], isLoading: loadingTypes } =
    useActivityTypes();
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

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Team Logs</h1>
        <p className="text-sm text-secondary-text mt-1">
          View and filter activity logs across your entire team
        </p>
      </div>

      <Card className="shadow-card mb-6" data-ocid="teamlogs.panel">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Filter className="w-4 h-4 text-accent" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label
                htmlFor="tl-start"
                className="text-xs font-semibold text-secondary-text uppercase tracking-wide"
              >
                Start Date
              </Label>
              <Input
                id="tl-start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-9"
                data-ocid="teamlogs.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="tl-end"
                className="text-xs font-semibold text-secondary-text uppercase tracking-wide"
              >
                End Date
              </Label>
              <Input
                id="tl-end"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-9"
                data-ocid="teamlogs.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-secondary-text uppercase tracking-wide">
                Activity Type
              </Label>
              <Select value={activityFilter} onValueChange={setActivityFilter}>
                <SelectTrigger className="h-9" data-ocid="teamlogs.select">
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
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Users className="w-4 h-4 text-accent" />
              Team Activity Log
            </CardTitle>
            {!isLoading && (
              <Badge variant="secondary" className="text-xs">
                {logs.length} {logs.length === 1 ? "entry" : "entries"}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading || loadingTypes ? (
            <div className="p-6 space-y-3" data-ocid="teamlogs.loading_state">
              {SKELETON_KEYS.map((k) => (
                <Skeleton key={k} className="h-12" />
              ))}
            </div>
          ) : logs.length === 0 ? (
            <div className="py-16 text-center" data-ocid="teamlogs.empty_state">
              <CalendarDays className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-40" />
              <p className="text-secondary-text font-medium">
                No entries found
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Try adjusting the date range or filters
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto" data-ocid="teamlogs.table">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="text-xs font-semibold uppercase text-secondary-text">
                      Date/Time
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
                    <motion.tr
                      key={String(entry.id)}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      className="border-b border-border hover:bg-muted/30 transition-colors"
                      data-ocid={`teamlogs.row.${i + 1}`}
                    >
                      <TableCell className="text-xs text-secondary-text whitespace-nowrap">
                        {formatTime(entry.timestamp)}
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
                      <TableCell className="text-xs text-body-text max-w-48 truncate">
                        {getEnvNames(entry)}
                      </TableCell>
                      <TableCell className="text-xs text-secondary-text max-w-40 truncate">
                        {entry.notes ?? <span className="opacity-40">—</span>}
                      </TableCell>
                    </motion.tr>
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
