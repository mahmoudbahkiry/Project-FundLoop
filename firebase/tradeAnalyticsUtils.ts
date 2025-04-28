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

  // Count all selling trades for total trades metric
  const allSellingTrades = filledOrders.filter(order => order.type === "sell").length;

  // Group orders by symbol to match buy and sell pairs for P&L calculation
  const ordersBySymbol: Record<string, Order[]> = {};
  filledOrders.forEach(order => {
    if (!ordersBySymbol[order.symbol]) {
      ordersBySymbol[order.symbol] = [];
    }
    ordersBySymbol[order.symbol].push(order);
  });

  // Process each symbol to calculate P&L for matched trades (buy+sell pairs)
  const trades: {
    symbol: string;
    entryPrice: number;
    exitPrice: number;
    quantity: number;
    pnl: number;
    isProfitable: boolean;
  }[] = [];

  // Process all filled orders to calculate P&L
  Object.entries(ordersBySymbol).forEach(([symbol, symbolOrders]) => {
    // Sort orders by time for each symbol
    const sortedOrders = [...symbolOrders].sort(
      (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
    );
    
    // Track remaining shares from buy orders
    let buyOrdersStack: {
      price: number;
      quantity: number;
      time: string;
    }[] = [];
    
    // Process orders chronologically
    sortedOrders.forEach(order => {
      const price = order.executionPrice || order.price;
      
      if (order.type === "buy") {
        // Add buy order to the stack
        buyOrdersStack.push({
          price,
          quantity: order.quantity,
          time: order.time,
        });
      } else if (order.type === "sell" && buyOrdersStack.length > 0) {
        // Match sell orders against available buy orders (FIFO)
        let remainingQuantity = order.quantity;
        
        while (remainingQuantity > 0 && buyOrdersStack.length > 0) {
          const oldestBuy = buyOrdersStack[0];
          const matchedQuantity = Math.min(remainingQuantity, oldestBuy.quantity);
          
          // Calculate P&L for this matched quantity
          const pnl = (price - oldestBuy.price) * matchedQuantity;
          
          // Add this matched trade to our trades list
          trades.push({
            symbol,
            entryPrice: oldestBuy.price,
            exitPrice: price,
            quantity: matchedQuantity,
            pnl,
            isProfitable: pnl > 0,
          });
          
          // Update remaining quantities
          remainingQuantity -= matchedQuantity;
          oldestBuy.quantity -= matchedQuantity;
          
          // Remove buy order if fully utilized
          if (oldestBuy.quantity <= 0) {
            buyOrdersStack.shift();
          }
        }
      }
    });
  });
  
  // Calculate metrics based on matched trades for P&L analysis
  const winningTrades = trades.filter(trade => trade.isProfitable).length;
  const losingTrades = trades.length - winningTrades;
  
  // Calculate win rate based on matched trades
  const winRate = trades.length > 0 ? (winningTrades / trades.length) * 100 : 0;
  
  // Calculate profit amounts
  const winningTradesData = trades.filter(trade => trade.isProfitable);
  const losingTradesData = trades.filter(trade => !trade.isProfitable);
  
  const totalWinAmount = winningTradesData.reduce((sum, trade) => sum + trade.pnl, 0);
  const totalLossAmount = Math.abs(losingTradesData.reduce((sum, trade) => sum + trade.pnl, 0));
  
  const averageWin = winningTradesData.length > 0 ? totalWinAmount / winningTradesData.length : 0;
  const averageLoss = losingTradesData.length > 0 ? totalLossAmount / losingTradesData.length : 0;
  
  // Calculate profit factor
  const profitFactor = totalLossAmount > 0 ? totalWinAmount / totalLossAmount : 0;
  
  // Calculate total P&L
  const totalPnl = trades.reduce((sum, trade) => sum + trade.pnl, 0);
  
  return {
    totalTrades: allSellingTrades,  // Use the count of all selling trades
    winningTrades,
    losingTrades,
    winRate,
    averageWin,
    averageLoss,
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