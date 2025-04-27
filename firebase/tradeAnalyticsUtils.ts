import { Order } from "@/contexts/TradingContext";

export interface TradeMetrics {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  averageWin: number;
  averageLoss: number;
  profitFactor: number;
  totalPnl: number;
  sharpeRatio?: number;
  maxDrawdown?: number;
}

/**
 * Calculate trading metrics from order data
 * @param orders List of user orders
 * @returns Calculated trade metrics
 */
export const calculateTradeMetrics = (orders: Order[]): TradeMetrics => {
  // Filter to only include filled orders
  const filledOrders = orders.filter(order => order.status === "filled");
  
  if (filledOrders.length === 0) {
    return {
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      winRate: 0,
      averageWin: 0,
      averageLoss: 0,
      profitFactor: 0,
      totalPnl: 0,
    };
  }

  // Calculate P&L for each order
  const tradesWithPnl = filledOrders.map(order => {
    const entryPrice = order.price;
    const exitPrice = order.executionPrice || order.price;
    const quantity = order.quantity;
    
    // Calculate P&L based on order type (buy or sell)
    let pnl = 0;
    if (order.type === "buy") {
      // For buys: (exitPrice - entryPrice) * quantity
      pnl = (exitPrice - entryPrice) * quantity;
    } else {
      // For sells: (entryPrice - exitPrice) * quantity
      pnl = (entryPrice - exitPrice) * quantity;
    }
    
    return {
      ...order,
      pnl,
      isProfitable: pnl > 0
    };
  });

  // Calculate total P&L
  const totalPnl = tradesWithPnl.reduce((sum, trade) => sum + trade.pnl, 0);
  
  // Count winning and losing trades
  const winningTrades = tradesWithPnl.filter(trade => trade.isProfitable).length;
  const losingTrades = tradesWithPnl.length - winningTrades;
  
  // Calculate win rate
  const winRate = (winningTrades / tradesWithPnl.length) * 100;
  
  // Calculate average win and loss
  const winningTradesData = tradesWithPnl.filter(trade => trade.isProfitable);
  const losingTradesData = tradesWithPnl.filter(trade => !trade.isProfitable);
  
  const totalWinAmount = winningTradesData.reduce((sum, trade) => sum + trade.pnl, 0);
  const totalLossAmount = losingTradesData.reduce((sum, trade) => sum + trade.pnl, 0);
  
  const averageWin = winningTradesData.length > 0 ? totalWinAmount / winningTradesData.length : 0;
  const averageLoss = losingTradesData.length > 0 ? totalLossAmount / losingTradesData.length : 0;
  
  // Calculate profit factor
  const profitFactor = totalLossAmount !== 0 ? Math.abs(totalWinAmount / totalLossAmount) : 0;
  
  return {
    totalTrades: tradesWithPnl.length,
    winningTrades,
    losingTrades,
    winRate,
    averageWin,
    averageLoss: Math.abs(averageLoss), // Return as positive number
    profitFactor,
    totalPnl,
  };
};

/**
 * Filter orders by date range
 * @param orders List of user orders
 * @param timeframe Timeframe to filter by (daily, weekly, monthly)
 * @returns Filtered orders
 */
export const filterOrdersByTimeframe = (
  orders: Order[], 
  timeframe: "daily" | "weekly" | "monthly"
): Order[] => {
  const now = new Date();
  let cutoffDate = new Date();
  
  if (timeframe === "daily") {
    // Set to beginning of current day
    cutoffDate.setHours(0, 0, 0, 0);
  } else if (timeframe === "weekly") {
    // Set to 7 days ago
    cutoffDate.setDate(now.getDate() - 7);
  } else if (timeframe === "monthly") {
    // Set to 30 days ago
    cutoffDate.setDate(now.getDate() - 30);
  }
  
  return orders.filter(order => {
    const orderDate = new Date(order.time);
    return orderDate >= cutoffDate;
  });
};

/**
 * Calculate profit/loss data for charts
 * @param orders List of user orders
 * @param timeframe Timeframe to group by (daily, weekly, monthly)
 * @returns Data formatted for charts
 */
export const calculateProfitLossChartData = (
  orders: Order[],
  timeframe: "daily" | "weekly" | "monthly"
) => {
  // Implementation will depend on charting library used
  // For now, returning placeholder structure
  return {
    labels: [],
    datasets: [{
      data: []
    }]
  };
}; 