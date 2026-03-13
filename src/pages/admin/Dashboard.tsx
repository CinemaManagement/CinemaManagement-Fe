import { Users, Ticket, DollarSign, Calendar, ArrowUpRight, ArrowDownRight, MoreVertical } from 'lucide-react';

const AdminDashboard = () => {
  const stats = [
    { label: 'Total Revenue', value: '$45,231', change: '+12.5%', icon: DollarSign, trend: 'up' },
    { label: 'Active Users', value: '1,284', change: '+5.2%', icon: Users, trend: 'up' },
    { label: 'Tickets Sold', value: '8,432', change: '-2.4%', icon: Ticket, trend: 'down' },
    { label: 'Showtimes', value: '142', change: '+8.1%', icon: Calendar, trend: 'up' },
  ];

  const recentTransactions = [
    { id: 'TX-9921', user: 'Alex Morgan', movie: 'Star Wars', amount: '$36.00', status: 'Completed', date: '2 min ago' },
    { id: 'TX-9920', user: 'Sarah Chen', movie: 'Oppenheimer', amount: '$15.00', status: 'Pending', date: '15 min ago' },
    { id: 'TX-9919', user: 'Mike Ross', movie: 'Dune: Part Two', amount: '$45.00', status: 'Completed', date: '1 hour ago' },
    { id: 'TX-9918', user: 'Jessica P.', movie: 'Avatar', amount: '$18.00', status: 'Canceled', date: '3 hours ago' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Command Center</h1>
          <p className="text-muted-foreground mt-1">Real-time overview of your cinema operations.</p>
        </div>
        <button className="px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl shadow-lg hover:shadow-primary/20 transition-all">
          Generate Report
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-card border border-border rounded-3xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <stat.icon className="w-16 h-16" />
            </div>
            <div className="flex items-center gap-4 mb-4">
               <div className="p-2 bg-accent/20 rounded-lg text-primary">
                  <stat.icon className="w-6 h-6" />
               </div>
               <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</span>
            </div>
            <div className="flex items-baseline justify-between">
               <span className="text-3xl font-black text-white">{stat.value}</span>
               <span className={`text-xs font-bold flex items-center gap-1 ${stat.trend === 'up' ? 'text-green-500' : 'text-secondary'}`}>
                  {stat.trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  {stat.change}
               </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity Table */}
        <div className="lg:col-span-2 bg-card border border-border rounded-3xl overflow-hidden">
          <div className="p-6 border-b border-border flex justify-between items-center">
             <h2 className="text-xl font-black text-white uppercase tracking-tight">Recent Transactions</h2>
             <button className="text-xs font-bold text-primary uppercase hover:underline">View All</button>
          </div>
          <div className="overflow-x-auto">
             <table className="w-full text-left">
                <thead>
                   <tr className="bg-accent/5 text-[10px] font-black text-muted-foreground uppercase tracking-widest border-b border-border">
                      <th className="px-6 py-4">Transaction Details</th>
                      <th className="px-6 py-4">Movie</th>
                      <th className="px-6 py-4">Amount</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4"></th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                   {recentTransactions.map((tx) => (
                     <tr key={tx.id} className="hover:bg-accent/5 transition-colors group">
                        <td className="px-6 py-4 text-sm">
                           <p className="font-bold text-white mb-0.5">{tx.user}</p>
                           <p className="text-[10px] text-muted-foreground uppercase">{tx.id} • {tx.date}</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground font-medium">{tx.movie}</td>
                        <td className="px-6 py-4 text-sm font-black text-white">{tx.amount}</td>
                        <td className="px-6 py-4">
                           <span className={`px-2 py-1 text-[10px] font-black rounded uppercase ${
                             tx.status === 'Completed' ? 'bg-green-500/10 text-green-500' : 
                             tx.status === 'Pending' ? 'bg-amber-500/10 text-amber-500' : 'bg-secondary/10 text-secondary'
                           }`}>
                              {tx.status}
                           </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                           <button className="p-2 text-muted-foreground hover:text-white transition-colors">
                              <MoreVertical className="w-4 h-4" />
                           </button>
                        </td>
                     </tr>
                   ))}
                </tbody>
             </table>
          </div>
        </div>

        {/* Revenue Share Chart Card (Mock) */}
        <div className="bg-card border border-border rounded-3xl p-6">
           <h2 className="text-xl font-black text-white uppercase tracking-tight mb-8">Revenue Share</h2>
           <div className="relative aspect-square flex items-center justify-center mb-8">
              {/* Simple Mock Donut Chart using CSS */}
              <div className="w-full h-full rounded-full border-[20px] border-accent/20 border-t-primary border-r-secondary transition-all transform rotate-45" />
              <div className="absolute flex flex-col items-center">
                 <span className="text-4xl font-black text-white">74%</span>
                 <span className="text-[10px] font-black text-muted-foreground uppercase">Target Reached</span>
              </div>
           </div>
           
           <div className="space-y-4">
              <div className="flex justify-between items-center text-xs">
                 <span className="flex items-center gap-2 text-muted-foreground"><div className="w-2 h-2 bg-primary rounded-full" /> Ticket Sales</span>
                 <span className="font-bold text-white">$32,400</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                 <span className="flex items-center gap-2 text-muted-foreground"><div className="w-2 h-2 bg-secondary rounded-full" /> Food & Drinks</span>
                 <span className="font-bold text-white">$12,831</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
