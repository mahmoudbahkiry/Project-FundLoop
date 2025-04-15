import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  FlatList,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';

interface Metrics {
  accountStatus: 'Evaluation' | 'Funded';
  accountSize: number;
  currentBalance: number;
  dailyProfit: number;
  weeklyProfit: number;
  monthlyProfit: number;
  drawdown: {
    current: number;
    max: number;
    remaining: number;
  };
  profitTarget: {
    weekly: number;
    monthly: number;
    progress: number;
  };
  tradingDays: {
    active: number;
    total: number;
  };
  complianceStatus: {
    dailyLossLimit: boolean;
    maxPositionSize: boolean;
    tradingHours: boolean;
  };
}

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

interface EducationalResource {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'article' | 'webinar';
  icon: string;
}

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  date: string;
  source: string;
}

export default function DashboardScreen() {
  const { currentTheme } = useTheme();
  const { user } = useAuth();
  console.log('Dashboard user data:', user);
  const theme = currentTheme;
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  
  // Mock data - would be replaced with real data from API
  const metrics: Metrics = {
    accountStatus: 'Evaluation',
    accountSize: 100000,
    currentBalance: 105000,
    dailyProfit: 1200,
    weeklyProfit: 3200,
    monthlyProfit: 8500,
    drawdown: {
      current: -1.2,
      max: -5,
      remaining: 3.8
    },
    profitTarget: {
      weekly: 5000,
      monthly: 15000,
      progress: 65,
    },
    tradingDays: {
      active: 4,
      total: 7
    },
    complianceStatus: {
      dailyLossLimit: true,
      maxPositionSize: true,
      tradingHours: true
    }
  };

  // Mock notifications
  const notifications: Notification[] = [
    {
      id: '1',
      title: 'Trading Target Reached',
      message: 'Congratulations! You have reached 65% of your monthly profit target.',
      time: '2 hours ago',
      read: false
    },
    {
      id: '2',
      title: 'Market Opening Soon',
      message: 'Egyptian Exchange (EGX) will open in 30 minutes.',
      time: 'Today, 9:00 AM',
      read: true
    },
    {
      id: '3',
      title: 'New Educational Content',
      message: 'Check out our new webinar on risk management strategies.',
      time: 'Yesterday',
      read: true
    }
  ];

  // Mock educational resources
  const educationalResources: EducationalResource[] = [
    {
      id: '1',
      title: 'Egyptian Market Fundamentals',
      description: 'Learn the basics of trading in the Egyptian stock market',
      type: 'video',
      icon: 'videocam'
    },
    {
      id: '2',
      title: 'Advanced Technical Analysis',
      description: 'Master chart patterns and indicators',
      type: 'article',
      icon: 'document-text'
    },
    {
      id: '3',
      title: 'Risk Management Strategies',
      description: 'Protect your capital with proper risk management',
      type: 'webinar',
      icon: 'people'
    }
  ];

  // Mock news
  const news: NewsItem[] = [
    {
      id: '1',
      title: 'EGX30 Rises 2% on Strong Banking Sector Performance',
      summary: 'The Egyptian stock market index EGX30 rose by 2% today, driven by strong performance in the banking sector.',
      date: 'Today, 4:30 PM',
      source: 'Egypt Business Today'
    },
    {
      id: '2',
      title: 'Central Bank of Egypt Maintains Interest Rates',
      summary: 'The Central Bank of Egypt has decided to maintain interest rates unchanged at its latest monetary policy meeting.',
      date: 'Yesterday',
      source: 'Cairo Financial Review'
    },
    {
      id: '3',
      title: 'New IPO Announced for Tech Company',
      summary: 'A leading Egyptian tech company has announced plans for an initial public offering on the Egyptian Exchange.',
      date: '2 days ago',
      source: 'Egypt Tech News'
    }
  ];

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity 
      style={[
        styles.notificationItem,
        !item.read && { backgroundColor: `${Colors[theme].primary}10` }
      ]}
      activeOpacity={0.7}
    >
      <View style={styles.notificationHeader}>
        <View style={styles.notificationTitleContainer}>
          {!item.read && (
            <View style={[styles.unreadDot, { backgroundColor: Colors[theme].primary }]} />
          )}
          <ThemedText style={styles.notificationTitle}>{item.title}</ThemedText>
        </View>
        <ThemedText style={styles.notificationTime}>{item.time}</ThemedText>
      </View>
      <ThemedText style={styles.notificationMessage}>{item.message}</ThemedText>
    </TouchableOpacity>
  );

  const renderEducationalResource = (item: EducationalResource) => (
    <TouchableOpacity 
      style={styles.resourceCard}
      activeOpacity={0.7}
    >
      <LinearGradient
        colors={[
          theme === 'dark' 
            ? `${Colors[theme].primary}20`
            : `${Colors[theme].primary}10`,
          'transparent'
        ]}
        style={styles.resourceGradient}
      >
        <View style={styles.resourceIconContainer}>
          <Ionicons 
            name={item.icon as any} 
            size={24} 
            color={Colors[theme].primary} 
          />
        </View>
        <View style={styles.resourceContent}>
          <ThemedText style={styles.resourceTitle}>{item.title}</ThemedText>
          <ThemedText style={styles.resourceDescription}>{item.description}</ThemedText>
        </View>
        <Ionicons 
          name="chevron-forward" 
          size={20} 
          color={Colors[theme].icon} 
        />
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderNewsItem = (item: NewsItem) => (
    <ThemedView variant="innerCard" style={styles.newsItemCard}>
      <View style={styles.newsItemHeader}>
        <ThemedText style={styles.newsTitle}>{item.title}</ThemedText>
        <View style={styles.newsSourceBadge}>
          <ThemedText style={styles.newsSourceText}>{item.source}</ThemedText>
        </View>
      </View>
      <ThemedText style={styles.newsSummary}>{item.summary}</ThemedText>
      <View style={styles.newsFooter}>
        <View style={styles.newsDateContainer}>
          <Ionicons name="time-outline" size={14} color={Colors[theme].icon} style={{marginRight: 4}} />
          <ThemedText style={styles.newsDate}>{item.date}</ThemedText>
        </View>
        <TouchableOpacity style={styles.readMoreButton}>
          <ThemedText style={styles.readMoreText}>Read More</ThemedText>
          <Ionicons name="chevron-forward" size={14} color={Colors[theme].primary} />
        </TouchableOpacity>
      </View>
    </ThemedView>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={styles.headerContainer}>
        <View>
          <ThemedText type="heading" style={styles.headerTitle}>Welcome back</ThemedText>
          <ThemedText type="subtitle" style={styles.userName}>{user?.firstName || 'Trader'}</ThemedText>
        </View>
        <TouchableOpacity 
          style={styles.notificationButton}
          onPress={() => setNotificationsVisible(true)}
        >
          {notifications.some(n => !n.read) && (
            <View style={[styles.notificationBadge, { backgroundColor: '#EF4444' }]}>
              <ThemedText style={styles.notificationBadgeText}>
                {notifications.filter(n => !n.read).length}
              </ThemedText>
            </View>
          )}
          <Ionicons 
            name="notifications" 
            size={24} 
            color={Colors[theme].primary} 
          />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Account Overview Card */}
        <ThemedView variant="elevated" style={styles.overviewCard}>
          <View style={styles.overviewHeader}>
            <View>
              <ThemedText style={styles.overviewLabel}>Account Balance</ThemedText>
              <ThemedText style={styles.balanceText}>
                ${metrics.currentBalance.toLocaleString()}
              </ThemedText>
              <ThemedText style={styles.initialBalance}>
                Initial: ${metrics.accountSize.toLocaleString()}
              </ThemedText>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: `${Colors[theme].primary}15` }]}>
              <ThemedText style={[styles.statusText, { color: Colors[theme].primary }]}>
                {metrics.accountStatus}
              </ThemedText>
            </View>
          </View>

          {/* Profit/Loss Stats */}
          <View style={styles.statsGrid}>
            <LinearGradient
              colors={[
                theme === 'dark' 
                  ? `${Colors[theme].success}20`
                  : `${Colors[theme].success}10`,
                'transparent'
              ]}
              style={styles.statCard}
            >
              <ThemedText style={styles.statLabel}>Daily P/L</ThemedText>
              <ThemedText style={[styles.statValue, { color: Colors[theme].success }]}>
                +${metrics.dailyProfit.toLocaleString()}
              </ThemedText>
            </LinearGradient>

            <LinearGradient
              colors={[
                theme === 'dark' 
                  ? `${Colors[theme].success}20`
                  : `${Colors[theme].success}10`,
                'transparent'
              ]}
              style={styles.statCard}
            >
              <ThemedText style={styles.statLabel}>Weekly P/L</ThemedText>
              <ThemedText style={[styles.statValue, { color: Colors[theme].success }]}>
                +${metrics.weeklyProfit.toLocaleString()}
              </ThemedText>
            </LinearGradient>

            <LinearGradient
              colors={[
                theme === 'dark' 
                  ? `${Colors[theme].success}20`
                  : `${Colors[theme].success}10`,
                'transparent'
              ]}
              style={styles.statCard}
            >
              <ThemedText style={styles.statLabel}>Monthly P/L</ThemedText>
              <ThemedText style={[styles.statValue, { color: Colors[theme].success }]}>
                +${metrics.monthlyProfit.toLocaleString()}
              </ThemedText>
            </LinearGradient>
          </View>

          {/* Drawdown Progress */}
          <View style={styles.drawdownSection}>
            <ThemedText style={styles.drawdownLabel}>
              Remaining Drawdown Allowance
            </ThemedText>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { 
                    width: `${(metrics.drawdown.remaining / Math.abs(metrics.drawdown.max)) * 100}%`,
                    backgroundColor: Colors[theme].primary 
                  }
                ]} 
              />
            </View>
            <ThemedText style={styles.drawdownText}>
              {metrics.drawdown.remaining}% of {Math.abs(metrics.drawdown.max)}%
            </ThemedText>
          </View>
        </ThemedView>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/trading')}
          >
            <LinearGradient
              colors={[Colors[theme].primary, Colors[theme].dark]}
              style={styles.actionGradient}
            >
              <Ionicons name="trending-up" size={24} color="#fff" />
              <ThemedText style={styles.actionText}>Start Trading</ThemedText>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/analytics')}
          >
            <LinearGradient
              colors={[Colors[theme].secondary, Colors[theme].primary]}
              style={styles.actionGradient}
            >
              <Ionicons name="stats-chart" size={24} color="#fff" />
              <ThemedText style={styles.actionText}>View Analytics</ThemedText>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Trading Rules Compliance */}
        <ThemedView variant="elevated" style={styles.complianceCard}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Trading Rules Compliance
          </ThemedText>
          <View style={styles.rulesList}>
            <View style={styles.ruleItem}>
              <View style={[
                styles.ruleIcon,
                { backgroundColor: metrics.complianceStatus.dailyLossLimit ? `${Colors[theme].success}15` : '#EF444415' }
              ]}>
                <Ionicons 
                  name={metrics.complianceStatus.dailyLossLimit ? "checkmark-circle" : "alert-circle"}
                  size={20}
                  color={metrics.complianceStatus.dailyLossLimit ? Colors[theme].success : '#EF4444'}
                />
              </View>
              <ThemedText style={styles.ruleText}>Daily Loss Limit</ThemedText>
            </View>

            <View style={styles.ruleItem}>
              <View style={[
                styles.ruleIcon,
                { backgroundColor: metrics.complianceStatus.maxPositionSize ? `${Colors[theme].success}15` : '#EF444415' }
              ]}>
                <Ionicons 
                  name={metrics.complianceStatus.maxPositionSize ? "checkmark-circle" : "alert-circle"}
                  size={20}
                  color={metrics.complianceStatus.maxPositionSize ? Colors[theme].success : '#EF4444'}
                />
              </View>
              <ThemedText style={styles.ruleText}>Position Size</ThemedText>
            </View>

            <View style={styles.ruleItem}>
              <View style={[
                styles.ruleIcon,
                { backgroundColor: metrics.complianceStatus.tradingHours ? `${Colors[theme].success}15` : '#EF444415' }
              ]}>
                <Ionicons 
                  name={metrics.complianceStatus.tradingHours ? "checkmark-circle" : "alert-circle"}
                  size={20}
                  color={metrics.complianceStatus.tradingHours ? Colors[theme].success : '#EF4444'}
                />
              </View>
              <ThemedText style={styles.ruleText}>Trading Hours</ThemedText>
            </View>
          </View>
        </ThemedView>

        {/* Educational Resources */}
        <ThemedView variant="elevated" style={styles.resourcesCard}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Educational Resources
          </ThemedText>
          {educationalResources.map(resource => (
            <React.Fragment key={resource.id}>
              {renderEducationalResource(resource)}
            </React.Fragment>
          ))}
        </ThemedView>

        {/* Market News */}
        <ThemedView variant="elevated" style={styles.newsCard}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Market Updates
          </ThemedText>
          {news.map(item => (
            <React.Fragment key={item.id}>
              {renderNewsItem(item)}
            </React.Fragment>
          ))}
        </ThemedView>
      </ScrollView>

      {/* Notifications Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={notificationsVisible}
        onRequestClose={() => setNotificationsVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <ThemedView style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText type="subtitle">Notifications</ThemedText>
              <TouchableOpacity 
                onPress={() => setNotificationsVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={Colors[theme].text} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={notifications}
              renderItem={renderNotification}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.notificationsList}
              showsVerticalScrollIndicator={false}
            />
          </ThemedView>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 10,
  },
  headerTitle: {
    color: '#2ECC71',
    fontSize: 32,
    fontWeight: '700',
  },
  userName: {
    marginTop: 4,
    opacity: 0.7,
  },
  notificationButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  notificationBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 18,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  overviewCard: {
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
  },
  overviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  overviewLabel: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 4,
  },
  balanceText: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 4,
  },
  initialBalance: {
    fontSize: 12,
    opacity: 0.7,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  statCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  drawdownSection: {
    marginTop: 8,
  },
  drawdownLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 3,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  drawdownText: {
    fontSize: 12,
    opacity: 0.7,
  },
  quickActions: {
    flexDirection: 'row',
    marginVertical: 16,
    gap: 8,
  },
  actionButton: {
    flex: 1,
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  actionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  complianceCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  rulesList: {
    gap: 12,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ruleIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ruleText: {
    fontSize: 14,
    fontWeight: '500',
  },
  resourcesCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  resourceCard: {
    marginBottom: 8,
  },
  resourceGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 12,
  },
  resourceIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resourceContent: {
    flex: 1,
  },
  resourceTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  resourceDescription: {
    fontSize: 12,
    opacity: 0.7,
  },
  newsCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  newsItemCard: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  newsItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  newsTitle: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    marginRight: 12,
  },
  newsSourceBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  newsSourceText: {
    fontSize: 12,
    opacity: 0.8,
  },
  newsSummary: {
    fontSize: 13,
    opacity: 0.7,
    lineHeight: 18,
    marginBottom: 12,
  },
  newsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  newsDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  newsDate: {
    fontSize: 12,
    opacity: 0.7,
  },
  readMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  readMoreText: {
    fontSize: 12,
    color: Colors.light.primary,
    marginRight: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  closeButton: {
    padding: 4,
  },
  notificationsList: {
    padding: 16,
  },
  notificationItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  notificationTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  notificationTime: {
    fontSize: 12,
    opacity: 0.7,
    marginLeft: 8,
  },
  notificationMessage: {
    fontSize: 12,
    opacity: 0.7,
  },
});

