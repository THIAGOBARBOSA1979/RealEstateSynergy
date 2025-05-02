import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  Legend
} from "recharts";

// Temporary mock data
const incomeData = [
  { name: 'Jan', rent: 200000, sale: 300000 },
  { name: 'Feb', rent: 280000, sale: 250000 },
  { name: 'Mar', rent: 320000, sale: 220000 },
  { name: 'Apr', rent: 350000, sale: 280000 },
  { name: 'May', rent: 500000, sale: 320000 },
  { name: 'Jun', rent: 450000, sale: 350000 },
  { name: 'Jul', rent: 400000, sale: 390000 },
  { name: 'Aug', rent: 450000, sale: 400000 },
  { name: 'Sep', rent: 500000, sale: 450000 },
  { name: 'Oct', rent: 480000, sale: 420000 },
  { name: 'Nov', rent: 460000, sale: 430000 },
  { name: 'Dec', rent: 500000, sale: 450000 },
];

const unitData = [
  { 
    id: 1, 
    name: 'Meadow View', 
    type: 'Rent', 
    location: 'Yogyakarta', 
    price: '$80,000', 
    status: 'Sold',
    img: '/m1.png'
  },
  { 
    id: 2, 
    name: 'Corner Unit', 
    type: 'Sell', 
    location: 'Jakarta', 
    price: '$180,000', 
    status: 'Available',
    img: '/m2.png'
  },
  { 
    id: 3, 
    name: 'Balcony Unit', 
    type: 'Rent', 
    location: 'Bandung', 
    price: '$95,000', 
    status: 'Sold',
    img: '/m3.png'
  },
  { 
    id: 4, 
    name: 'The Old Rectory', 
    type: 'Sell', 
    location: 'Sleman', 
    price: '$190,000', 
    status: 'Available',
    img: '/m4.png'
  },
  { 
    id: 5, 
    name: 'White Cottage', 
    type: 'Rent', 
    location: 'Bali', 
    price: '$125,000', 
    status: 'Sold',
    img: '/m5.png'
  },
];

const agentData = [
  { name: 'Karen Hope', location: 'Jakarta', units: 15, total: '$150K', profit: true },
  { name: 'Brandon', location: 'Bali', units: 10, total: '$100K', profit: false },
  { name: 'Marcus', location: 'Yogyakarta', units: 9, total: '$90K', profit: true },
  { name: 'Alfonso', location: 'Bandung', units: 8, total: '$80K', profit: false },
  { name: 'Cristofer', location: 'Yogyakarta', units: 7, total: '$70K', profit: true },
];

const Dashboard = () => {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/dashboard/stats'],
  });

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['/api/users/me'],
  });

  return (
    <div className="max-w-7xl mx-auto">
      {/* Sales Analytics Section */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Sales Analytics</h2>
        <div className="flex items-center">
          <span>Today</span>
          <Button variant="ghost" size="icon" className="ml-2">
            <span className="material-icons">expand_more</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Customer Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <span className="material-icons text-[20px]">people</span>
              </div>
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-600">7% vs. previous month</span>
            </div>
            <h3 className="text-2xl font-bold mt-2">350</h3>
            <p className="text-sm text-gray-500">Customers</p>
            <div className="mt-2">
              <svg className="w-full h-12 text-blue-400" viewBox="0 0 100 30" preserveAspectRatio="none">
                <path
                  d="M0,15 Q20,5 40,15 T80,15 T100,15"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            </div>
          </CardContent>
        </Card>

        {/* Total Income Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-green-100 text-green-600">
                <span className="material-icons text-[20px]">monetization_on</span>
              </div>
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-600">11% vs. previous month</span>
            </div>
            <h3 className="text-2xl font-bold mt-2">$500,000</h3>
            <p className="text-sm text-gray-500">Total Income</p>
            <div className="mt-2">
              <svg className="w-full h-12 text-green-400" viewBox="0 0 100 30" preserveAspectRatio="none">
                <path
                  d="M0,20 Q30,5 50,15 T100,10"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            </div>
          </CardContent>
        </Card>

        {/* Total Property Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-red-100 text-red-600">
                <span className="material-icons text-[20px]">home</span>
              </div>
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-red-100 text-red-600">-3.4% vs. previous month</span>
            </div>
            <h3 className="text-2xl font-bold mt-2">500</h3>
            <p className="text-sm text-gray-500">Total Property</p>
            <div className="mt-2">
              <svg className="w-full h-12 text-red-400" viewBox="0 0 100 30" preserveAspectRatio="none">
                <path
                  d="M0,10 Q30,20 50,10 T100,20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Income Statistics and Circular Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader className="pb-0">
              <CardTitle className="text-lg font-semibold">Income Statistics</CardTitle>
              <div className="flex items-center space-x-2 text-xs">
                <Button size="sm" variant="outline" className="h-7 px-3 rounded-md">1D</Button>
                <Button size="sm" variant="outline" className="h-7 px-3 rounded-md">1M</Button>
                <Button size="sm" variant="outline" className="h-7 px-3 rounded-md bg-accent/10 text-accent border-accent">3M</Button>
                <Button size="sm" variant="outline" className="h-7 px-3 rounded-md">1Y</Button>
                <Button size="sm" variant="outline" className="h-7 px-3 rounded-md">ALL</Button>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={incomeData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorRent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorSale" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <CartesianGrid strokeDasharray="3 3" />
                    <Tooltip />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="rent" 
                      stroke="hsl(var(--accent))" 
                      fillOpacity={1} 
                      fill="url(#colorRent)" 
                      name="Rent"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="sale" 
                      stroke="hsl(var(--primary))" 
                      fillOpacity={1} 
                      fill="url(#colorSale)" 
                      name="Sale"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="h-full">
            <CardHeader className="pb-0">
              <CardTitle className="text-lg font-semibold">Sales Analytics</CardTitle>
            </CardHeader>
            <CardContent className="p-6 flex flex-col items-center">
              <div className="relative h-48 w-48 flex items-center justify-center">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="45" 
                    fill="transparent" 
                    stroke="hsl(var(--muted))" 
                    strokeWidth="10" 
                  />
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="45" 
                    fill="transparent" 
                    stroke="hsl(var(--accent))" 
                    strokeWidth="10" 
                    strokeDasharray="283"
                    strokeDashoffset="141.5" 
                    transform="rotate(-90 50 50)" 
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-4xl font-bold">50%</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 w-full mt-4">
                <div className="flex flex-col items-center">
                  <h4 className="text-sm text-gray-500">Agent Sales</h4>
                  <p className="font-semibold">$40,000</p>
                </div>
                <div className="flex flex-col items-center">
                  <h4 className="text-sm text-gray-500">Office Sales</h4>
                  <p className="font-semibold">$10,000</p>
                </div>
                <div className="flex flex-col items-center">
                  <h4 className="text-sm text-gray-500">Marketing Sales</h4>
                  <p className="font-semibold">$20,000</p>
                </div>
                <div className="flex flex-col items-center">
                  <h4 className="text-sm text-gray-500">Online Sales</h4>
                  <p className="font-semibold">$30,000</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* My Property Unit */}
      <div className="mb-8">
        <Card>
          <CardHeader className="pb-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">My Property Unit</CardTitle>
              <Button variant="outline" size="sm" className="text-accent border-accent hover:text-white hover:bg-accent">
                See All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left font-medium px-4 py-3">Unit Name</th>
                    <th className="text-left font-medium px-4 py-3">Type</th>
                    <th className="text-left font-medium px-4 py-3">Location</th>
                    <th className="text-right font-medium px-4 py-3">Price</th>
                    <th className="text-center font-medium px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {unitData.map((unit) => (
                    <tr key={unit.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <div className="w-8 h-8 mr-3 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="material-icons text-gray-500 text-sm">home</span>
                          </div>
                          <span>{unit.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">{unit.type}</td>
                      <td className="px-4 py-3">{unit.location}</td>
                      <td className="px-4 py-3 text-right">{unit.price}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center">
                          <Badge className={`${unit.status === 'Sold' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                            {unit.status}
                          </Badge>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Agents */}
      <div className="mb-8">
        <Card>
          <CardHeader className="pb-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">Top Agents</CardTitle>
              <Button variant="ghost" size="icon">
                <span className="material-icons">more_vert</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left font-medium px-4 py-3">Agent Name</th>
                  <th className="text-center font-medium px-4 py-3">Total Sold</th>
                  <th className="text-right font-medium px-4 py-3">Profit</th>
                </tr>
              </thead>
              <tbody>
                {agentData.map((agent, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <div className="w-8 h-8 mr-3 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                          {index === 0 ? (
                            <span className="material-icons text-accent text-sm">face</span>
                          ) : (
                            <span className="material-icons text-gray-500 text-sm">person</span>
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{agent.name}</div>
                          <div className="text-xs text-gray-500">{agent.location}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">{agent.units} Units</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end">
                        <span className="font-medium">{agent.total}</span>
                        <span className={`material-icons text-sm ml-1 ${agent.profit ? 'text-green-500' : 'text-red-500'}`}>
                          {agent.profit ? 'arrow_upward' : 'arrow_downward'}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
