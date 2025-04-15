import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Modal,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';

// Types
interface Stock {
  symbol: string;
  name: string;
  lastPrice: number;
  change: number;
  changePercent: number;
  volume: number;
  bid?: number;
  ask?: number;
}

interface Position {
  id: string;
  symbol: string;
  type: 'buy' | 'sell';
  entryPrice: number;
  currentPrice: number;
  quantity: number;
  openTime: string;
}

interface Order {
  id: string;
  symbol: string;
  type: 'buy' | 'sell';
  orderType: 'market' | 'limit' | 'stop';
  price: number;
  quantity: number;
  status: 'filled' | 'pending' | 'cancelled';
  time: string;
  executionPrice?: number;
}

interface Alert {
  id: string;
  type: 'drawdown' | 'position' | 'rule';
  message: string;
  severity: 'warning' | 'critical';
}

export default function TradingScreen() {
  const { currentTheme } = useTheme();
  const theme = currentTheme;
  
  // State
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('positions');
  const [alertsVisible, setAlertsVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [liveStocks, setLiveStocks] = useState<Stock[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Mock data
  const mockStocks: Stock[] = [
    { symbol: 'COMI', name: 'Commercial International Bank', lastPrice: 52.75, change: 0.75, changePercent: 1.44, volume: 1245000, bid: 52.70, ask: 52.80 },
    { symbol: 'HRHO', name: 'Hermes Holding', lastPrice: 18.30, change: -0.20, changePercent: -1.08, volume: 980000, bid: 18.25, ask: 18.35 },
    { symbol: 'TMGH', name: 'Talaat Moustafa Group', lastPrice: 9.45, change: 0.15, changePercent: 1.61, volume: 750000, bid: 9.40, ask: 9.50 },
    { symbol: 'SWDY', name: 'Elsewedy Electric', lastPrice: 12.80, change: -0.10, changePercent: -0.78, volume: 620000, bid: 12.75, ask: 12.85 },
    { symbol: 'EAST', name: 'Eastern Company', lastPrice: 15.20, change: 0.30, changePercent: 2.01, volume: 540000, bid: 15.15, ask: 15.25 },
    { symbol: 'EFIH', name: 'EFG Hermes Holding', lastPrice: 21.35, change: 0.45, changePercent: 2.15, volume: 890000, bid: 21.30, ask: 21.40 },
    { symbol: 'ETEL', name: 'Telecom Egypt', lastPrice: 17.65, change: -0.25, changePercent: -1.40, volume: 720000, bid: 17.60, ask: 17.70 },
    { symbol: 'AMOC', name: 'Alexandria Mineral Oils', lastPrice: 8.90, change: 0.20, changePercent: 2.30, volume: 680000, bid: 8.85, ask: 8.95 },
    { symbol: 'SKPC', name: 'Sidi Kerir Petrochemicals', lastPrice: 11.75, change: -0.15, changePercent: -1.26, volume: 510000, bid: 11.70, ask: 11.80 },
    { symbol: 'ESRS', name: 'Ezz Steel', lastPrice: 19.40, change: 0.35, changePercent: 1.84, volume: 630000, bid: 19.35, ask: 19.45 },
    { symbol: 'ORWE', name: 'Oriental Weavers', lastPrice: 10.25, change: 0.10, changePercent: 0.99, volume: 480000, bid: 10.20, ask: 10.30 },
    { symbol: 'MNHD', name: 'Madinet Nasr Housing', lastPrice: 7.85, change: -0.05, changePercent: -0.63, volume: 520000, bid: 7.80, ask: 7.90 },
    { symbol: 'PHDC', name: 'Palm Hills Development', lastPrice: 6.40, change: 0.15, changePercent: 2.40, volume: 950000, bid: 6.35, ask: 6.45 },
    { symbol: 'HELI', name: 'Heliopolis Housing', lastPrice: 8.15, change: -0.10, changePercent: -1.21, volume: 420000, bid: 8.10, ask: 8.20 },
    { symbol: 'JUFO', name: 'Juhayna Food Industries', lastPrice: 13.60, change: 0.25, changePercent: 1.87, volume: 380000, bid: 13.55, ask: 13.65 },
  ];
  
  // Mock positions
  const positions: Position[] = [
    { id: '1', symbol: 'COMI', type: 'buy', entryPrice: 51.20, currentPrice: 52.75, quantity: 200, openTime: '2025-03-08 10:15' },
    { id: '2', symbol: 'HRHO', type: 'sell', entryPrice: 18.50, currentPrice: 18.30, quantity: 500, openTime: '2025-03-09 09:30' },
    { id: '3', symbol: 'TMGH', type: 'buy', entryPrice: 9.30, currentPrice: 9.45, quantity: 1000, openTime: '2025-03-09 11:45' },
  ];
  
  // Mock orders
  const orders: Order[] = [
    { id: 'ORD-25308-1', symbol: 'COMI', type: 'buy', orderType: 'market', price: 51.20, quantity: 200, status: 'filled', time: '2025-03-08 10:15', executionPrice: 51.22 },
    { id: 'ORD-25309-1', symbol: 'HRHO', type: 'sell', orderType: 'limit', price: 18.50, quantity: 500, status: 'filled', time: '2025-03-09 09:30', executionPrice: 18.50 },
    { id: 'ORD-25309-2', symbol: 'TMGH', type: 'buy', orderType: 'market', price: 9.30, quantity: 1000, status: 'filled', time: '2025-03-09 11:45', executionPrice: 9.32 },
    { id: 'ORD-25310-1', symbol: 'SWDY', type: 'buy', orderType: 'limit', price: 12.75, quantity: 300, status: 'pending', time: '2025-03-10 09:15' },
    { id: 'ORD-25310-2', symbol: 'EAST', type: 'sell', orderType: 'stop', price: 15.00, quantity: 200, status: 'cancelled', time: '2025-03-10 10:30' },
  ];
  
  // Mock alerts
  const alerts: Alert[] = [
    { id: '1', type: 'drawdown', message: 'Account drawdown approaching 3% daily limit', severity: 'warning' },
    { id: '2', type: 'position', message: 'Position size for COMI exceeds 5% of account balance', severity: 'warning' },
    { id: '3', type: 'rule', message: 'Trading outside allowed market hours', severity: 'critical' },
  ];
  
  // Set mock stocks data on mount
  useEffect(() => {
    setLiveStocks(mockStocks);
  }, []);
  
  // Handle manual refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simply reset to mock data
    setLiveStocks(mockStocks);
    setRefreshing(false);
  }, []);
  
  // Filter stocks based on search query
  const filteredStocks = mockStocks.filter(stock => 
    stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || 
    stock.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Calculate profit/loss for a position
  const calculatePnL = (position: Position) => {
    const diff = position.type === 'buy' 
      ? position.currentPrice - position.entryPrice 
      : position.entryPrice - position.currentPrice;
    return diff * position.quantity;
  };
  
  // Calculate profit/loss percentage
  const calculatePnLPercent = (position: Position) => {
    const diff = position.type === 'buy' 
      ? position.currentPrice - position.entryPrice 
      : position.entryPrice - position.currentPrice;
    return (diff / position.entryPrice) * 100;
  };
  
  // Render stock item
  const renderStockItem = ({ item }: { item: Stock }) => (
    <TouchableOpacity 
      style={[
        styles.stockItem, 
        selectedStock?.symbol === item.symbol && styles.selectedStockItem
      ]} 
      onPress={() => setSelectedStock(item)}
    >
      <View style={styles.stockSymbolContainer}>
        <ThemedText type="defaultSemiBold">{item.symbol}</ThemedText>
        <ThemedText 
          type="caption" 
          numberOfLines={1} 
          ellipsizeMode="tail" 
          style={styles.stockName}
        >
          {item.name}
        </ThemedText>
      </View>
      <View style={styles.stockPriceContainer}>
        <ThemedText type="defaultSemiBold">{item.lastPrice.toFixed(2)}</ThemedText>
        <ThemedText 
          style={[
            styles.changeText, 
            { color: item.change >= 0 ? Colors[theme].success : '#EF4444' }
          ]}
        >
          {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)} ({item.changePercent.toFixed(2)}%)
        </ThemedText>
      </View>
    </TouchableOpacity>
  );
  
  // Render position item
  const renderPositionItem = ({ item }: { item: Position }) => {
    const pnl = calculatePnL(item);
    const pnlPercent = calculatePnLPercent(item);
    const isProfitable = pnl > 0;
    
    return (
      <ThemedView variant="innerCard" style={styles.positionItem}>
        <View style={styles.positionHeader}>
          <View style={styles.positionSymbolContainer}>
            <ThemedText type="defaultSemiBold">{item.symbol}</ThemedText>
            <View style={[
              styles.positionTypeBadge, 
              { backgroundColor: item.type === 'buy' ? 'rgba(0, 168, 107, 0.1)' : 'rgba(239, 68, 68, 0.1)' }
            ]}>
              <ThemedText style={{ 
                color: item.type === 'buy' ? Colors[theme].success : '#EF4444',
                fontSize: 12,
                fontWeight: '600'
              }}>
                {item.type.toUpperCase()}
              </ThemedText>
            </View>
          </View>
          <TouchableOpacity style={styles.closePositionButton}>
            <ThemedText style={styles.closeButtonText}>Close</ThemedText>
          </TouchableOpacity>
        </View>
        
        <ThemedView variant="innerCard" style={styles.positionDetails}>
          <View style={styles.positionDetail}>
            <ThemedText type="caption">Entry</ThemedText>
            <ThemedText>{item.entryPrice.toFixed(2)}</ThemedText>
          </View>
          <View style={styles.positionDetail}>
            <ThemedText type="caption">Current</ThemedText>
            <ThemedText>{item.currentPrice.toFixed(2)}</ThemedText>
          </View>
          <View style={styles.positionDetail}>
            <ThemedText type="caption">Quantity</ThemedText>
            <ThemedText>{item.quantity}</ThemedText>
          </View>
          <View style={styles.positionDetail}>
            <ThemedText type="caption">P/L</ThemedText>
            <ThemedText style={{ color: isProfitable ? Colors[theme].success : '#EF4444' }}>
              {isProfitable ? '+' : ''}{pnl.toFixed(2)} ({pnlPercent.toFixed(2)}%)
            </ThemedText>
          </View>
        </ThemedView>
      </ThemedView>
    );
  };
  
  // Group orders by date
  const groupOrdersByDate = (orders: Order[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
    
    // Sort orders by time (newest first)
    const sortedOrders = [...orders].sort((a, b) => {
      return new Date(b.time).getTime() - new Date(a.time).getTime();
    });
    
    const groups: { title: string; data: Order[] }[] = [
      { title: 'Today', data: [] },
      { title: 'Yesterday', data: [] },
      { title: 'This Week', data: [] },
      { title: 'Earlier', data: [] },
    ];
    
    sortedOrders.forEach(order => {
      const orderDate = new Date(order.time);
      
      if (orderDate >= today) {
        groups[0].data.push(order);
      } else if (orderDate >= yesterday) {
        groups[1].data.push(order);
      } else if (orderDate >= thisWeekStart) {
        groups[2].data.push(order);
      } else {
        groups[3].data.push(order);
      }
    });
    
    // Remove empty groups
    return groups.filter(group => group.data.length > 0);
  };
  
  // Format order time
  const formatOrderTime = (timeString: string) => {
    const orderDate = new Date(timeString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // For today's orders, show only time
    if (orderDate >= today) {
      return orderDate.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    }
    
    // For yesterday and older, show date and time
    return orderDate.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Render order item
  const renderOrderItem = ({ item }: { item: Order }) => {
    const formattedTime = formatOrderTime(item.time);
    
    return (
      <ThemedView variant="innerCard" style={styles.orderItem}>
        <View style={styles.orderHeader}>
          <View style={styles.orderHeaderLeft}>
            <ThemedText type="defaultSemiBold">{item.symbol}</ThemedText>
            <View style={styles.orderTypeContainer}>
              <ThemedText style={{ 
                color: item.type === 'buy' ? Colors[theme].success : '#EF4444',
                fontSize: 13,
                fontWeight: '600',
                marginRight: 6
              }}>
                {item.type.toUpperCase()}
              </ThemedText>
              <ThemedText type="caption" style={styles.orderTypeLabel}>
                {item.orderType}
              </ThemedText>
            </View>
          </View>
          
          <View style={styles.orderHeaderRight}>
            <View style={[
              styles.orderStatusBadge, 
              { 
                backgroundColor: 
                  item.status === 'filled' ? 'rgba(0, 168, 107, 0.1)' : 
                  item.status === 'pending' ? 'rgba(234, 179, 8, 0.1)' : 
                  'rgba(239, 68, 68, 0.1)' 
              }
            ]}>
              <Ionicons 
                name={
                  item.status === 'filled' ? 'checkmark-circle' : 
                  item.status === 'pending' ? 'time' : 
                  'close-circle'
                } 
                size={12} 
                color={
                  item.status === 'filled' ? Colors[theme].success : 
                  item.status === 'pending' ? '#EAB308' : 
                  '#EF4444'
                }
                style={{ marginRight: 4 }}
              />
              <ThemedText style={{ 
                color: 
                  item.status === 'filled' ? Colors[theme].success : 
                  item.status === 'pending' ? '#EAB308' : 
                  '#EF4444',
                fontSize: 12,
                fontWeight: '600'
              }}>
                {item.status.toUpperCase()}
              </ThemedText>
            </View>
            
            <ThemedText type="caption" style={styles.orderTime}>
              {formattedTime}
            </ThemedText>
          </View>
        </View>
        
        <View style={styles.orderDivider} />
        
        <ThemedView variant="innerCard" style={styles.orderDetails}>
          <View style={styles.orderDetail}>
            <ThemedText type="caption">Order ID</ThemedText>
            <ThemedText 
              style={styles.orderDetailValue} 
              numberOfLines={1} 
              ellipsizeMode="tail"
            >
              {item.id}
            </ThemedText>
          </View>
          <View style={styles.orderDetail}>
            <ThemedText type="caption">Quantity</ThemedText>
            <ThemedText 
              style={styles.orderDetailValue}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item.quantity.toLocaleString()}
            </ThemedText>
          </View>
          <View style={styles.orderDetail}>
            <ThemedText type="caption">{item.status === 'filled' ? 'Execution Price' : 'Price'}</ThemedText>
            <ThemedText 
              style={styles.orderDetailValue}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {(item.status === 'filled' && item.executionPrice 
                ? item.executionPrice 
                : item.price).toFixed(2)}
            </ThemedText>
          </View>
          <View style={styles.orderDetail}>
            <ThemedText type="caption">Value</ThemedText>
            <ThemedText 
              style={styles.orderDetailValue}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {((item.status === 'filled' && item.executionPrice 
                ? item.executionPrice 
                : item.price) * item.quantity).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </ThemedText>
          </View>
        </ThemedView>
      </ThemedView>
    );
  };
  
  // Render alert item
  const renderAlertItem = ({ item }: { item: Alert }) => (
    <ThemedView 
      variant="card" 
      style={[
        styles.alertItem, 
        { 
          borderLeftWidth: 4,
          borderLeftColor: item.severity === 'critical' ? '#EF4444' : '#EAB308' 
        }
      ]}
    >
      <View style={styles.alertIconContainer}>
        <Ionicons 
          name={item.severity === 'critical' ? 'alert-circle' : 'warning'} 
          size={24} 
          color={item.severity === 'critical' ? '#EF4444' : '#EAB308'} 
        />
      </View>
      <View style={styles.alertContent}>
        <ThemedText type="defaultSemiBold">
          {item.type === 'drawdown' ? 'Drawdown Warning' : 
           item.type === 'position' ? 'Position Size Warning' : 
           'Trading Rule Violation'}
        </ThemedText>
        <ThemedText type="caption">{item.message}</ThemedText>
      </View>
    </ThemedView>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <ThemedText type="heading" style={styles.headerTitle}>Trading</ThemedText>
        </View>
        <TouchableOpacity 
          style={styles.alertButton}
          onPress={() => setAlertsVisible(true)}
        >
          {alerts.some(alert => alert.severity === 'critical') && (
            <View style={styles.alertBadge}>
              <ThemedText style={styles.alertBadgeText}>{alerts.length}</ThemedText>
            </View>
          )}
          <Ionicons name="warning" size={24} color={
            alerts.some(alert => alert.severity === 'critical') 
              ? '#EF4444' 
              : alerts.length > 0 
                ? '#EAB308' 
                : Colors[theme].primary
          } />
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors[theme].primary]}
            tintColor={Colors[theme].primary}
          />
        }
      >
        {/* Market Overview Card */}
        <ThemedView variant="elevated" style={styles.card}>
          <View style={styles.cardTitleContainer}>
            <ThemedText type="subtitle" style={styles.cardTitle}>Market Watch</ThemedText>
          </View>
          
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={Colors[theme].icon} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: Colors[theme].text }]}
              placeholder="Search stocks..."
              placeholderTextColor={Colors[theme].icon}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          
          <View style={styles.stocksHeader}>
            <ThemedText type="caption" style={styles.stocksHeaderSymbol}>Symbol</ThemedText>
            <ThemedText type="caption" style={styles.stocksHeaderPrice}>Price</ThemedText>
          </View>
          
          <FlatList
            data={filteredStocks}
            renderItem={renderStockItem}
            keyExtractor={item => item.symbol}
            style={styles.stocksList}
            scrollEnabled={true}
            showsVerticalScrollIndicator={true}
            contentContainerStyle={styles.stocksListContent}
            removeClippedSubviews={false}
            initialNumToRender={15}
            maxToRenderPerBatch={10}
            windowSize={5}
          />
        </ThemedView>
        
        {/* Positions and Orders Card */}
        <ThemedView variant="elevated" style={styles.card}>
          <View style={styles.tabsContainer}>
            <TouchableOpacity 
              style={[
                styles.tab, 
                activeTab === 'positions' && [
                  styles.activeTab,
                  { backgroundColor: currentTheme === 'dark' ? '#333333' : '#fff' }
                ]
              ]}
              onPress={() => setActiveTab('positions')}
            >
              <ThemedText 
                style={activeTab === 'positions' ? [
                  styles.activeTabText,
                  { color: Colors[currentTheme].primary }
                ] : {}}
              >
                Positions
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.tab, 
                activeTab === 'orders' && [
                  styles.activeTab,
                  { backgroundColor: currentTheme === 'dark' ? '#333333' : '#fff' }
                ]
              ]}
              onPress={() => setActiveTab('orders')}
            >
              <ThemedText 
                style={activeTab === 'orders' ? [
                  styles.activeTabText,
                  { color: Colors[currentTheme].primary }
                ] : {}}
              >
                Order History
              </ThemedText>
            </TouchableOpacity>
          </View>
          
          {activeTab === 'positions' ? (
            <View style={styles.positionsContainer}>
              {positions.length > 0 ? (
                positions.map(position => (
                  <React.Fragment key={position.id}>
                    {renderPositionItem({ item: position })}
                  </React.Fragment>
                ))
              ) : (
                <ThemedView variant="card" style={styles.emptyState}>
                  <Ionicons name="wallet-outline" size={32} color={Colors[theme].icon} />
                  <ThemedText style={styles.emptyStateText}>No open positions</ThemedText>
                </ThemedView>
              )}
            </View>
          ) : (
            <View style={styles.ordersContainer}>
              {orders.length > 0 ? (
                groupOrdersByDate(orders).map((group, index) => (
                  <View key={index} style={styles.orderGroup}>
                    <View style={styles.orderGroupHeader}>
                      <ThemedText type="defaultSemiBold" style={styles.orderGroupTitle}>
                        {group.title}
                      </ThemedText>
                      <ThemedText type="caption" style={styles.orderGroupCount}>
                        {group.data.length} {group.data.length === 1 ? 'order' : 'orders'}
                      </ThemedText>
                    </View>
                    
                    {group.data.map(order => (
                      <React.Fragment key={order.id}>
                        {renderOrderItem({ item: order })}
                      </React.Fragment>
                    ))}
                  </View>
                ))
              ) : (
                <ThemedView variant="card" style={styles.emptyState}>
                  <Ionicons name="document-text-outline" size={32} color={Colors[theme].icon} />
                  <ThemedText style={styles.emptyStateText}>No order history</ThemedText>
                </ThemedView>
              )}
            </View>
          )}
        </ThemedView>
      </ScrollView>
      
      {/* Risk Management Alerts Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={alertsVisible}
        onRequestClose={() => setAlertsVisible(false)}
      >
        <View style={styles.modalContainer}>
          <ThemedView style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText type="subtitle">Risk Management Alerts</ThemedText>
              <TouchableOpacity onPress={() => setAlertsVisible(false)}>
                <Ionicons name="close" size={24} color={Colors[theme].text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.alertsContainer}>
              {alerts.length > 0 ? (
                alerts.map(alert => (
                  <React.Fragment key={alert.id}>
                    {renderAlertItem({ item: alert })}
                  </React.Fragment>
                ))
              ) : (
                <ThemedView variant="card" style={styles.emptyState}>
                  <Ionicons name="checkmark-circle-outline" size={32} color={Colors[theme].success} />
                  <ThemedText style={styles.emptyStateText}>No active alerts</ThemedText>
                </ThemedView>
              )}
            </ScrollView>
          </ThemedView>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  // Main container styles
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  
  // Header styles
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  header: {
    flex: 1,
  },
  headerTitle: {
    color: '#2ECC71',
    fontSize: 32,
    fontWeight: '700',
  },
  alertButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#EF4444',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  alertBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 18,
    paddingBottom: 1, // Slight adjustment to vertically center the text
  },
  
  // Card styles
  card: {
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
  },
  cardTitle: {
    marginBottom: 12,
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Market Watch styles
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 12,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 14,
  },
  stocksHeader: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    marginBottom: 4,
  },
  stocksHeaderSymbol: {
    flex: 3,
    fontWeight: '500',
  },
  stocksHeaderPrice: {
    flex: 2,
    textAlign: 'right',
    fontWeight: '500',
  },
  stocksList: {
    maxHeight: 300,
  },
  stocksListContent: {
    paddingRight: 4,
  },
  stockItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
    alignItems: 'center',
    marginBottom: 2,
  },
  selectedStockItem: {
    backgroundColor: 'rgba(0, 168, 107, 0.1)',
    borderRadius: 8,
  },
  stockSymbolContainer: {
    flex: 3,
    paddingRight: 8,
  },
  stockName: {
    fontSize: 14,
    marginTop: 2,
    opacity: 0.7,
  },
  stockPriceContainer: {
    flex: 2,
    alignItems: 'flex-end',
  },
  changeText: {
    fontSize: 12,
    marginTop: 2,
  },
  
  // Tabs styles
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    padding: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  activeTabText: {
    fontWeight: '600',
  },
  
  // Positions and orders styles
  positionsContainer: {
    gap: 12,
  },
  ordersContainer: {
    gap: 16,
  },
  orderGroup: {
    marginBottom: 16,
  },
  orderGroupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  orderGroupTitle: {
    fontSize: 14,
  },
  orderGroupCount: {
    opacity: 0.6,
  },
  positionItem: {
    padding: 12,
    borderRadius: 12,
  },
  positionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  positionSymbolContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  positionTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  closePositionButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  closeButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  positionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  positionDetail: {
    alignItems: 'center',
  },
  orderItem: {
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderHeaderLeft: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  orderHeaderRight: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  orderTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  orderTypeLabel: {
    textTransform: 'capitalize',
    opacity: 0.7,
  },
  orderStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 4,
  },
  orderTime: {
    marginTop: 2,
    opacity: 0.7,
  },
  orderDivider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    marginVertical: 12,
  },
  orderDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  orderDetail: {
    alignItems: 'flex-start',
    width: '48%',
    marginBottom: 8,
  },
  orderDetailValue: {
    marginTop: 4,
    fontWeight: '500',
    flexShrink: 1,
  },
  
  // Alert styles
  alertItem: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  alertIconContainer: {
    marginRight: 12,
    alignSelf: 'center',
  },
  alertContent: {
    flex: 1,
  },
  
  // Empty state styles
  emptyState: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  emptyStateText: {
    marginTop: 8,
    opacity: 0.7,
  },
  
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 30,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  alertsContainer: {
    paddingHorizontal: 20,
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
});
