/* eslint-disable @typescript-eslint/no-explicit-any */
import {useState, useEffect, useRef} from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {jsPDF} from "jspdf";
import "jspdf-autotable";
import {
  Users,
  Ticket,
  DollarSign,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  Loader2,
} from "lucide-react";
import {statisticsApi} from "@/services/api/statisticsApi";
import toast from "react-hot-toast";

dayjs.extend(relativeTime);

interface DashboardStats {
  totalRevenue: number;
  activeUsers: number;
  ticketsSold: number;
  showtimes: number;
  ticketRevenue: number;
  foodRevenue: number;
  productionShare: number;
  recentTransactions: any[];
  timeRange: {
    start: string;
    end: string;
  };
}

const AdminDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [data, setData] = useState<DashboardStats | null>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);
  const [extraExpenses, setExtraExpenses] = useState<number>(0);
  const [staffSalaries, setStaffSalaries] = useState<number>(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const res = await statisticsApi.getDashboardStats();
        setData(res.data?.data || res.data);
      } catch {
        toast.error("Failed to load dashboard statistics.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading || !data) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center">
        <Loader2 className="text-primary h-12 w-12 animate-spin" />
      </div>
    );
  }

  const stats = [
    {
      label: "Total Revenue",
      value: `$${data.totalRevenue.toLocaleString()}`,
      change: "+12.5%",
      icon: DollarSign,
      trend: "up",
    },
    {
      label: "Active Users",
      value: data.activeUsers.toLocaleString(),
      change: "+5.2%",
      icon: Users,
      trend: "up",
    },
    {
      label: "Tickets Sold",
      value: data.ticketsSold.toLocaleString(),
      change: "-2.4%",
      icon: Ticket,
      trend: "down",
    },
    {
      label: "Showtimes",
      value: data.showtimes.toLocaleString(),
      change: "+8.1%",
      icon: Calendar,
      trend: "up",
    },
  ];

  const recentTransactions = data.recentTransactions.map((tx: any) => ({
    id: tx.bookingCode,
    user: tx.userId?.email || "Unknown Customer",
    movie: tx.showtimeId?.movieId?.title || "N/A",
    amount: `$${tx.totalAmount.toLocaleString()}`,
    status: tx.status === "PAID" ? "Completed" : tx.status === "HELD" ? "Pending" : "Canceled",
    date: dayjs(tx.createdAt).fromNow(),
  }));

  const totalRev = data.ticketRevenue + data.foodRevenue || 1;
  const ticketPercent = Math.round((data.ticketRevenue / totalRev) * 100);

  const realEarnings = data.totalRevenue - data.productionShare;
  const actualRevenue = realEarnings - extraExpenses - staffSalaries;

  const handleExportPDF = async () => {
    try {
      setIsExporting(true);
      toast.loading("Generating professional report...", {id: "pdf-export"});

      const doc = new jsPDF() as any;
      const today = new Date().toLocaleDateString();

      // 1. Header & Title
      doc.setFontSize(22);
      doc.setTextColor(40);
      doc.text("CINEMA MANAGEMENT REPORT", 105, 20, {align: "center"});

      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Generated on: ${today}`, 105, 28, {align: "center"});
      doc.text(
        `Reporting Period: ${new Date(data.timeRange.start).toLocaleDateString()} - ${new Date(data.timeRange.end).toLocaleDateString()}`,
        105,
        34,
        {align: "center"},
      );

      // 2. Financial Summary Table
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text("1. Financial Summary", 14, 45);

      const summaryData = [
        ["Total Revenue", `$${data.totalRevenue.toLocaleString()}`],
        ["Production Share (VPD)", `-$${data.productionShare.toLocaleString()}`],
        ["Staff Salaries", `-$${staffSalaries.toLocaleString()}`],
        ["Extra Expenses", `-$${extraExpenses.toLocaleString()}`],
        ["Actual Net Revenue", `$${actualRevenue.toLocaleString()}`],
      ];

      doc.autoTable({
        startY: 50,
        head: [["Description", "Amount"]],
        body: summaryData,
        theme: "striped",
        headStyles: {fillColor: [40, 40, 40]},
        columnStyles: {
          1: {halign: "right", fontStyle: "bold"},
        },
      });

      // 3. Revenue Breakdown Table
      const finalY = (doc as any).lastAutoTable.finalY + 15;
      doc.text("2. Revenue Breakdown", 14, finalY);

      const breakdownData = [
        ["Ticket Sales", `$${data.ticketRevenue.toLocaleString()}`, `${ticketPercent}%`],
        ["Food & Drinks", `$${data.foodRevenue.toLocaleString()}`, `${100 - ticketPercent}%`],
      ];

      doc.autoTable({
        startY: finalY + 5,
        head: [["Category", "Revenue", "Share"]],
        body: breakdownData,
        theme: "grid",
        headStyles: {fillColor: [80, 80, 80]},
        columnStyles: {
          1: {halign: "right"},
          2: {halign: "center"},
        },
      });

      // 4. Recent Transactions Table
      const transY = (doc as any).lastAutoTable.finalY + 15;
      doc.text("3. Recent Transactions", 14, transY);

      const transactionRows = recentTransactions.map((tx) => [
        tx.id,
        tx.user,
        tx.movie,
        tx.amount,
        tx.status,
        tx.date,
      ]);

      doc.autoTable({
        startY: transY + 5,
        head: [["ID", "Customer", "Movie", "Amount", "Status", "Date"]],
        body: transactionRows,
        styles: {fontSize: 8},
        headStyles: {fillColor: [100, 100, 100]},
      });

      // 5. Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(
          `Page ${i} of ${pageCount} - Confidential Cinema Report`,
          105,
          doc.internal.pageSize.height - 10,
          {align: "center"},
        );
      }

      doc.save(`Cinema_Financial_Report_${new Date().toISOString().split("T")[0]}.pdf`);
      toast.success("Professional report generated!", {id: "pdf-export"});
    } catch (err: unknown) {
      console.error("PDF Export error:", err);
      const msg = err instanceof Error ? err.message : "Unknown error";
      toast.error(`Export failed: ${msg}`, {id: "pdf-export"});
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div
      ref={dashboardRef}
      id="dashboard-root"
      className="mx-auto max-w-7xl space-y-8 p-8 text-white"
    >
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-white uppercase">
            Command Center
          </h1>
          <p className="text-muted-foreground mt-1 text-xs">
            Showcase from {new Date(data.timeRange.start).toLocaleDateString()} to{" "}
            {new Date(data.timeRange.end).toLocaleDateString()}
          </p>
        </div>
        <button
          onClick={handleExportPDF}
          disabled={isExporting}
          className="bg-primary text-primary-foreground hover:shadow-primary/20 flex items-center gap-2 rounded-xl px-6 py-3 font-bold shadow-lg transition-all disabled:scale-95 disabled:opacity-50"
        >
          {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Generate Report"}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-card border-border group relative overflow-hidden rounded-3xl border p-6"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 transition-opacity group-hover:opacity-10">
              <stat.icon className="h-16 w-16" />
            </div>
            <div className="mb-4 flex items-center gap-4">
              <div className="bg-accent/20 text-primary rounded-lg p-2">
                <stat.icon className="h-6 w-6" />
              </div>
              <span className="text-muted-foreground text-xs font-bold tracking-widest uppercase">
                {stat.label}
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-black text-white">{stat.value}</span>
              <span
                className={`flex items-center gap-1 text-xs font-bold ${stat.trend === "up" ? "text-green-500" : "text-secondary"}`}
              >
                {stat.trend === "up" ? (
                  <ArrowUpRight className="h-4 w-4" />
                ) : (
                  <ArrowDownRight className="h-4 w-4" />
                )}
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Recent Activity Table */}
        <div className="bg-card border-border overflow-hidden rounded-3xl border lg:col-span-2">
          <div className="border-border flex items-center justify-between border-b p-6">
            <h2 className="text-xl font-black tracking-tight text-white uppercase">
              Recent Transactions
            </h2>
            <button className="text-primary text-xs font-bold uppercase hover:underline">
              View All
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-accent/5 text-muted-foreground border-border border-b text-[10px] font-black tracking-widest uppercase">
                  <th className="px-6 py-4">Transaction Details</th>
                  <th className="px-6 py-4">Movie</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-border/50 divide-y">
                {recentTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-accent/5 group transition-colors">
                    <td className="px-6 py-4 text-sm">
                      <p className="mb-0.5 font-bold text-white">{tx.user}</p>
                      <p className="text-muted-foreground text-[10px] uppercase">
                        {tx.id} • {tx.date}
                      </p>
                    </td>
                    <td className="text-muted-foreground px-6 py-4 text-sm font-medium">
                      {tx.movie}
                    </td>
                    <td className="px-6 py-4 text-sm font-black text-white">{tx.amount}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block rounded px-2 py-1 text-[10px] font-black uppercase ${
                          tx.status === "Completed"
                            ? "bg-green-500/10 text-green-500"
                            : tx.status === "Pending"
                              ? "bg-amber-500/10 text-amber-500"
                              : "bg-secondary/10 text-secondary"
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-muted-foreground p-2 transition-colors hover:text-white">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Chart & Financials */}
        <div className="space-y-6">
          {/* Revenue Share Chart Card */}
          <div className="bg-card border-border rounded-3xl border p-6">
            <h2 className="mb-8 text-xl font-black tracking-tight text-white uppercase">
              Revenue Share
            </h2>
            <div className="group relative mb-8 flex aspect-square items-center justify-center">
              {/* Donut Chart Visual */}
              <div
                className="absolute inset-0 rounded-full shadow-[0_0_30px_-10px_rgba(var(--primary),0.2)] transition-all duration-1000"
                style={{
                  background: `conic-gradient(var(--primary) ${ticketPercent}%, var(--secondary) ${ticketPercent}% 100%)`,
                }}
              />
              {/* Inner "Mask" to create donut hole */}
              <div className="bg-card absolute inset-[18%] rounded-full shadow-inner transition-all duration-500 group-hover:inset-[15%]" />

              <div className="absolute flex flex-col items-center">
                <span className="text-4xl font-black text-white">{ticketPercent}%</span>
                <span className="text-muted-foreground text-[10px] font-black uppercase">
                  Ticket share
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground flex items-center gap-2">
                  <div className="bg-primary h-2 w-2 rounded-full" /> Ticket Sales
                </span>
                <span className="font-bold text-white">${data.ticketRevenue.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground flex items-center gap-2">
                  <div className="bg-secondary h-2 w-2 rounded-full" /> Food & Drinks
                </span>
                <span className="font-bold text-white">${data.foodRevenue.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="bg-card border-border rounded-3xl border p-6">
            <h2 className="mb-6 text-xl font-black tracking-tight text-white uppercase">
              Operating Expenses
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-muted-foreground mb-1 ml-1 block text-[10px] font-bold tracking-widest uppercase">
                  Extra Expenses
                </label>
                <input
                  type="number"
                  value={extraExpenses || ""}
                  onChange={(e) => setExtraExpenses(Number(e.target.value))}
                  placeholder="0"
                  className="focus:border-primary shadow-inner-glossy w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white transition-all outline-none"
                />
              </div>
              <div>
                <label className="text-muted-foreground mb-1 ml-1 block text-[10px] font-bold tracking-widest uppercase">
                  Staff Salaries
                </label>
                <input
                  type="number"
                  value={staffSalaries || ""}
                  onChange={(e) => setStaffSalaries(Number(e.target.value))}
                  placeholder="0"
                  className="focus:border-primary shadow-inner-glossy w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white transition-all outline-none"
                />
              </div>
            </div>
          </div>

          <div className="from-primary/20 to-secondary/10 border-border rounded-3xl border bg-linear-to-br p-6">
            <h2 className="mb-6 text-xl font-black tracking-tight text-white uppercase">
              Financial Summary
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs font-medium">Production Share</span>
                <span className="font-bold text-red-400">
                  -${data.productionShare.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-muted-foreground text-xs font-medium">Net Earnings</span>
                <span className="font-bold text-white">${realEarnings.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-muted-foreground text-xs font-medium">Total Expenses</span>
                <span className="font-bold text-red-400">
                  -${(extraExpenses + staffSalaries).toLocaleString()}
                </span>
              </div>
              <div className="mt-4 rounded-2xl bg-white/5 p-4 text-center">
                <p className="text-muted-foreground text-[10px] font-black tracking-widest uppercase">
                  Actual Revenue
                </p>
                <p
                  className={`text-3xl font-black ${actualRevenue >= 0 ? "text-green-500" : "text-red-500"}`}
                >
                  ${actualRevenue.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
