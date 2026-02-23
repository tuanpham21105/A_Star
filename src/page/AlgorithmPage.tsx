import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Upload,
  Play,
  RotateCcw,
  Download,
  FileText,
} from "lucide-react";
import { text } from "stream/consumers";
import { Solve } from "@/logic/AStarAlgorithmLogic";

// ── Types ────────────────────────────────────────────────────────────────────

type TableRow = {
  step: number | string;
  currentState: string;
  nextState: String;
  k: string;
  h: string;
  g: string;
  f: string;
  queue: string;
};

// ── Sample data ──────────────────────────────────────────────────────────────

const SAMPLE_ROWS: TableRow[] = [
  {
    step: 1,
    currentState: "A",
    nextState: "B",
    k: "3",
    h: "7",
    g: "0",
    f: "7",
    queue: "[A]",
  }
];

const INITIAL_TEXT = 
`A
B
A-14:C-9,D-7,E-13,F-20
F-7:G-4,I-6
E-8:K-4,I-3
D-6:H-8,E-4
C-15:H-6
G-12
I-4:K-9,B-5
K-2:B-6
H-10:K-5
B-0`;

const PLACEHOLDER_TEXT = 
`// Đây là nơi đặt input
// Cấu trúc gồm

A // Trạng thái bắt đầu
B // Trạng thái kết thúc
A - 10 : C - 5, D - 6 // <Trạng thái gốc> - <Trọng số> : <Trạng thái kề 1> - <Chi phí 1>, ..., <Trạng thái kề n> - <Chi phí n>
C - 8 : B - 0
B - 0`;

// ── Component ─────────────────────────────────────────────────────────────────

export default function AlgorithmPage() {
  const [inputText, setInputText] = useState(INITIAL_TEXT);
  const [rows, setRows] = useState<TableRow[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [result, setResult] = useState('');
  const [path, setPath] = useState('');
  const [cost, setCost] = useState(0);

  // Handlers
  const handleImport = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setInputText(ev.target?.result as string);
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleSolve = () => {
    // setRows([...SAMPLE_ROWS]);

    const res = Solve(inputText);

    setResult(res)

    const { cost, path } = parseCostAndPath(res)
    setCost(cost)
    setPath(path)

    setRows([...parseResultToTableRows(res)])
  };

  const handleReset = () => {
    setInputText(INITIAL_TEXT);
    setResult('')
    setRows([]);
    setPath('')
    setCost(0)
  };

  const handleExport = () => {
    const blob = new Blob([result], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "result.txt"
    a.click()
    URL.revokeObjectURL(url)
  };

  return (
    <div
      className="flex h-screen w-full overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #0f0f13 0%, #161620 100%)",
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      }}
    >
      {/* ── Sidebar ── */}
      <aside
        className="flex flex-col gap-4 p-5 border-r"
        style={{
          width: "40%",
          minWidth: "320px",
          borderColor: "#2a2a3a",
          background: "rgba(255,255,255,0.02)",
        }}
      >
        {/* Title */}
        <div className="flex items-center gap-2 pb-2 border-b" style={{ borderColor: "#2a2a3a" }}>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight leading-none">
              Thuật toán A*
            </h1>
            <p className="text-md mt-0.5" style={{ color: "#6b6b8a" }}>
              Bộ môn Trí tuệ nhân tạo
            </p>
            <p className="text-md mt-0.5" style={{ color: "#6b6b8a" }}>
              Nhóm 5
            </p>
          </div>
        </div>

        {/* Import button */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button
            variant="outline"
            className="w-full gap-2 text-sm font-medium"
            style={{
              borderColor: "#3a3a52",
              background: "rgba(255,255,255,0.04)",
              color: "#c4c4d8",
            }}
            onClick={handleImport}
          >
            <Upload size={15} />
            Import File
          </Button>
        </div>

        {/* Editable textarea — fills remaining space */}
        <div className="flex flex-col flex-1 min-h-0 gap-1.5">
          <div className="flex items-center gap-1.5">
            <FileText size={13} style={{ color: "#6b6b8a" }} />
            <span className="text-xs font-medium" style={{ color: "#6b6b8a" }}>
              Input
            </span>
          </div>
          <Textarea
            placeholder={PLACEHOLDER_TEXT}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 resize-none text-xs leading-relaxed"
            style={{
              background: "rgba(0,0,0,0.35)",
              border: "1px solid #2a2a3a",
              color: "#a8e6cf",
              caretColor: "#7c6aff",
              outline: "none",
              boxShadow: "none",
              fontFamily: "inherit",
              minHeight: 0,
            }}
            spellCheck={false}
          />
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-2 pt-1">
          <Button
            className="w-full gap-2 font-semibold tracking-wide text-sm"
            style={{
              background: "linear-gradient(135deg, #5b4fff 0%, #8b5cf6 100%)",
              color: "#fff",
              border: "none",
              boxShadow: "0 0 20px rgba(91,79,255,0.35)",
            }}
            onClick={handleSolve}
          >
            <Play size={15} />
            Solve
          </Button>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 gap-2 text-sm"
              style={{
                borderColor: "#3a3a52",
                background: "rgba(255,255,255,0.03)",
                color: "#c4c4d8",
              }}
              onClick={handleReset}
            >
              <RotateCcw size={14} />
              Reset
            </Button>

            <Button
              variant="outline"
              className="flex-1 gap-2 text-sm"
              style={{
                borderColor: "#3a3a52",
                background: "rgba(255,255,255,0.03)",
                color: "#c4c4d8",
              }}
              onClick={handleExport}
              disabled={rows.length === 0}
            >
              <Download size={14} />
              Export
            </Button>
          </div>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex flex-col flex-1 min-w-0 p-5 gap-3">
        {/* Header bar */}
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold" style={{ color: "#8b8baa" }}>
            Các bước giải thuật
          </h2>
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{ background: "rgba(91,79,255,0.15)", color: "#9b8fff" }}
          >
            {rows.length} bước
          </span>
        </div>

        {/* Table — fills all remaining space */}
        <div
          className="flex-1 min-h-0 rounded-lg overflow-hidden border"
          style={{ borderColor: "#2a2a3a" }}
        >
          <div className="h-full w-full overflow-auto">
            <Table >
              <TableHeader>
                <TableRow
                  style={{
                    background: "rgba(91,79,255,0.1)",
                    borderBottom: "1px solid #2a2a3a",
                  }}
                >
                  {[
                    "Bước",
                    "Trạng thái hiện tại",
                    "Trạng thái kề",
                    "k(u, v)",
                    "h(v)",
                    "g(v)",
                    "f(v)",
                    "Hàng đợi",
                  ].map((header) => (
                    <TableHead
                      key={header}
                      className="whitespace-nowrap text-xs font-bold uppercase tracking-widest px-4 py-3"
                      style={{ color: "#9b8fff" }}
                    >
                      {header}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-20 text-sm"
                      style={{ color: "#4a4a6a" }}
                    >
                      Nhấn <span style={{ color: "#7c6aff" }}>Solve</span> để giải thuật
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((row, i) => (
                    <TableRow
                      key={i}
                      style={{
                        borderBottom: "1px solid #1e1e2e",
                        background:
                          i % 2 === 0
                            ? "rgba(255,255,255,0.01)"
                            : "transparent",
                        transition: "background 0.15s",
                      }}
                      className="hover:bg-white/5"
                    >
                      <TableCell
                        className="px-4 py-3 text-xs font-bold"
                        style={{ color: "#7c6aff" }}
                      >
                        {row.step}
                      </TableCell>
                      <TableCell
                        className="px-4 py-3 text-xs font-semibold"
                        style={{ color: "#fd9176" }}
                      >
                        {row.currentState}
                      </TableCell>
                      <TableCell
                        className="px-4 py-3 text-xs font-semibold"
                        style={{ color: "#5482ff" }}
                      >
                        {row.nextState}
                      </TableCell>
                      <TableCell
                        className="px-4 py-3 text-xs"
                        style={{ color: "#a8e6cf" }}
                      >
                        {row.k}
                      </TableCell>
                      <TableCell
                        className="px-4 py-3 text-xs"
                        style={{ color: "#ffd6a5" }}
                      >
                        {row.h}
                      </TableCell>
                      <TableCell
                        className="px-4 py-3 text-xs"
                        style={{ color: "#caffbf" }}
                      >
                        {row.g}
                      </TableCell>
                      <TableCell
                        className="px-4 py-3 text-xs font-bold"
                        style={{ color: "#ffadad" }}
                      >
                        {row.f}
                      </TableCell>
                      <TableCell
                        className="px-4 py-3 text-xs"
                        style={{ color: "#bdb2ff",  }}
                      >
                        {row.queue}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Result */}
        <div
          className="p-4 rounded-lg border flex gap-6 items-center"
          style={{ borderColor: "#2a2a3a", background: "rgba(255,255,255,0.02)" }}
        >
          <div className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-widest" style={{ color: "#6b6b8a" }}>Đường đi</span>
            <span className="text-sm font-bold" style={{ color: "#a8e6cf" }}>
              {path || "—"}
            </span>
          </div>

          <div className="w-px h-8 self-center" style={{ background: "#2a2a3a" }} />

          <div className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-widest" style={{ color: "#6b6b8a" }}>Chi phí</span>
            <span className="text-sm font-bold" style={{ color: "#ffadad" }}>
              {cost > 0 ? cost : "—"}
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}

function parseResultToTableRows(resultText: string): TableRow[] {
  const rows: TableRow[] = []

  const lines = resultText.split("\n")

  // skip "Steps:" line and empty lines, stop at "Result:" line
  const stepLines = lines.filter(line =>
    line.includes("|") && !line.startsWith("Result") && !line.startsWith("Cost")
  )

  stepLines.forEach(line => {
    const parts = line.split("|")
    // parts = ["0", "A", "", "", "", "", "", "", ""]

    rows.push({
      step:         parts[0].trim(),
      currentState: parts[1].trim(),
      nextState:    parts[2].trim(),
      k:            parts[3].trim(),
      h:            parts[4].trim(),
      g:            parts[5].trim(),
      f:            parts[6].trim(),
      queue:        parts[7].trim(),
    })
  })

  return rows
}

function parseCostAndPath(text: string): { cost: number, path: string } {
  const lines = text.split("\n")

  const pathLine = lines.find(line => line.startsWith("Path:"))
  const costLine = lines.find(line => line.startsWith("Cost:"))

  const path = pathLine ? pathLine.replace("Path:", "").trim() : ""
  const cost = costLine ? Number.parseInt(costLine.replace("Cost:", "").trim()) : 0

  return { cost, path: path }
}
