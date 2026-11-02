
import React, { useCallback, useEffect, useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  StatusBar,
} from 'react-native';

import api from '../../config/api';
import { useAuth } from '../../context/AuthContext';

interface DashboardData {
  generatedAt: string;

  tasks: {
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    tasksDueToday: number;
  };

  habits: {
    totalHabits: number;
    activeHabits: number;
    completedToday: number;
    remainingToday: number;
  };

  notes: {
    totalNotes: number;
    pinnedNotes: number;
  };

  expenses: {
    totalIncome: number;
    totalExpenses: number;
    balance: number;
    totalTransactions: number;
  };

  reminders: {
    totalReminders: number;
    upcomingReminders: number;
    overdueReminders: number;
    completedReminders: number;
  };
}

export default function DashboardScreen({ navigation }: any) {
  const { user, logout } = useAuth();

  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = async () => {
    try {
      const response = await api.get('/dashboard', {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });

      setDashboard(response.data.data ?? response.data);
    } catch (error: any) {
      console.log(
        'Dashboard error:',
        error.response?.data || error.message
      );

      Alert.alert(
        'Dashboard Error',
        error.response?.data?.message ||
          'Unable to load dashboard. Please try again.'
      );
    }
  };

  useEffect(() => {
    const loadDashboard = async () => {
      await fetchDashboard();
      setLoading(false);
    };

    loadDashboard();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchDashboard();
    setRefreshing(false);
  }, [user?.token]);

  const formatCurrency = (amount: number) => {
    return `₹${Number(amount || 0).toLocaleString('en-IN', {
      maximumFractionDigits: 2,
    })}`;
  };

  const showComingSoon = (feature: string) => {
    Alert.alert(
      feature,
      `${feature} feature will be available soon.`
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />

        <Text style={styles.logo}>LifeTrack.</Text>

        <ActivityIndicator size="large" color="#FFFFFF" />

        <Text style={styles.loadingText}>
          Loading your dashboard...
        </Text>
      </View>
    );
  }

  if (!dashboard) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />

        <Text style={styles.logo}>LifeTrack.</Text>

        <Text style={styles.errorText}>
          Unable to load dashboard.
        </Text>

        <TouchableOpacity
          style={styles.retryButton}
          onPress={fetchDashboard}
        >
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const taskProgress =
    dashboard.tasks.totalTasks > 0
      ? Math.round(
          (dashboard.tasks.completedTasks /
            dashboard.tasks.totalTasks) *
            100
        )
      : 0;

  const habitProgress =
    dashboard.habits.totalHabits > 0
      ? Math.round(
          (dashboard.habits.completedToday /
            dashboard.habits.totalHabits) *
            100
        )
      : 0;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FFFFFF"
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>LifeTrack.</Text>
            <Text style={styles.date}>{today}</Text>
          </View>

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Welcome */}
        <View style={styles.welcomeSection}>
          <Text style={styles.greeting}>Good day,</Text>

          <Text style={styles.userName}>
            {user?.fullName || 'User'}.
          </Text>

          <Text style={styles.welcomeSubtitle}>
            Here's your life at a glance.
          </Text>
        </View>

        {/* Today's Tasks */}
        <Text style={styles.sectionTitle}>
          Today's Overview
        </Text>

        <View style={styles.mainCard}>
          <View style={styles.cardTopRow}>
            <Text style={styles.cardLabel}>
              TASKS COMPLETED
            </Text>

            <Text style={styles.percentage}>
              {taskProgress}%
            </Text>
          </View>

          <Text style={styles.bigNumber}>
            {dashboard.tasks.completedTasks}

            <Text style={styles.totalNumber}>
              {' / '}{dashboard.tasks.totalTasks}
            </Text>
          </Text>

          <View style={styles.progressBackground}>
            <View
              style={[
                styles.progressFill,
                { width: `${taskProgress}%` },
              ]}
            />
          </View>

          <View style={styles.taskBottomRow}>
            <Text style={styles.cardDescription}>
              {dashboard.tasks.pendingTasks} pending
            </Text>

            <Text style={styles.cardDescription}>
              {dashboard.tasks.tasksDueToday} due today
            </Text>
          </View>

          <TouchableOpacity
            style={styles.viewTasksButton}
            onPress={() => navigation.navigate('Tasks')}
          >
            <Text style={styles.viewTasksText}>
              View all tasks →
            </Text>
          </TouchableOpacity>
        </View>

        {/* Habits */}
        <Text style={styles.sectionTitle}>
          Daily Habits
        </Text>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {dashboard.habits.completedToday}
            </Text>

            <Text style={styles.statLabel}>
              Completed
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {dashboard.habits.remainingToday}
            </Text>

            <Text style={styles.statLabel}>
              Remaining
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {dashboard.habits.activeHabits}
            </Text>

            <Text style={styles.statLabel}>
              Active habits
            </Text>
          </View>
        </View>

        <View style={styles.habitCard}>
          <View style={styles.cardTopRow}>
            <Text style={styles.cardLabel}>
              TODAY'S HABIT PROGRESS
            </Text>

            <Text style={styles.percentage}>
              {habitProgress}%
            </Text>
          </View>

          <View style={styles.progressBackground}>
            <View
              style={[
                styles.progressFill,
                { width: `${habitProgress}%` },
              ]}
            />
          </View>

          <TouchableOpacity
            style={styles.viewTasksButton}
            onPress={() => navigation.navigate('Habits')}
          >
            <Text style={styles.viewTasksText}>
              View all habits →
            </Text>
          </TouchableOpacity>
        </View>

        {/* Expenses */}
        <Text style={styles.sectionTitle}>
          Your Money
        </Text>

        <View style={styles.expenseCard}>
          <Text style={styles.cardLabel}>
            TOTAL BALANCE
          </Text>

          <Text style={styles.balance}>
            {formatCurrency(dashboard.expenses.balance)}
          </Text>

          <View style={styles.expenseDivider} />

          <View style={styles.expenseRow}>
            <View>
              <Text style={styles.expenseLabel}>
                Income
              </Text>

              <Text style={styles.incomeAmount}>
                {formatCurrency(dashboard.expenses.totalIncome)}
              </Text>
            </View>

            <View>
              <Text style={styles.expenseLabel}>
                Expenses
              </Text>

              <Text style={styles.expenseAmount}>
                {formatCurrency(dashboard.expenses.totalExpenses)}
              </Text>
            </View>
          </View>

          <Text style={styles.transactionText}>
            {dashboard.expenses.totalTransactions} transactions
          </Text>
        </View>

        {/* Notes and Reminders */}
        <Text style={styles.sectionTitle}>
          More Overview
        </Text>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {dashboard.notes.totalNotes}
            </Text>

            <Text style={styles.statLabel}>
              Notes
            </Text>

            <Text style={styles.smallText}>
              {dashboard.notes.pinnedNotes} pinned
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {dashboard.reminders.upcomingReminders}
            </Text>

            <Text style={styles.statLabel}>
              Upcoming
            </Text>

            <Text style={styles.smallText}>
              {dashboard.reminders.overdueReminders} overdue
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>
          Quick Actions
        </Text>

        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Tasks')}
          >
            <Text style={styles.actionSymbol}>+</Text>
            <Text style={styles.actionTitle}>Add Task</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Habits')}
          >
            <Text style={styles.actionSymbol}>✓</Text>
            <Text style={styles.actionTitle}>Habits</Text>
          </TouchableOpacity>

                    <TouchableOpacity
                style={styles.actionCard}
                onPress={() => navigation.navigate('Notes')}
                >
                <Text style={styles.actionSymbol}>≡</Text>
                <Text style={styles.actionTitle}>New Note</Text>
                </TouchableOpacity>


<TouchableOpacity
  style={styles.actionCard}
  onPress={() => navigation.navigate('Expenses')}
>
  <Text style={styles.actionSymbol}>₹</Text>
  <Text style={styles.actionTitle}>Add Expense</Text>
</TouchableOpacity>
        </View>

        <Text style={styles.footer}>
          YOUR LIFE. YOUR GOALS. YOUR TRACKER.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },

  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 25,
    paddingBottom: 40,
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },

  logo: {
    color: '#FFFFFF',
    fontSize: 27,
    fontWeight: '900',
    letterSpacing: -1,
  },

  loadingText: {
    color: '#888888',
    marginTop: 18,
    fontSize: 14,
  },

  errorText: {
    color: '#AAAAAA',
    marginTop: 25,
    fontSize: 15,
  },

  retryButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 30,
    paddingVertical: 13,
    borderRadius: 30,
    marginTop: 20,
  },

  retryText: {
    color: '#000000',
    fontWeight: '700',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  date: {
    color: '#888888',
    fontSize: 12,
    marginTop: 5,
  },

  logoutButton: {
    borderWidth: 1,
    borderColor: '#444444',
    paddingHorizontal: 17,
    paddingVertical: 9,
    borderRadius: 25,
  },

  logoutText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },

  welcomeSection: {
    marginTop: 42,
    marginBottom: 35,
  },

  greeting: {
    color: '#999999',
    fontSize: 19,
  },

  userName: {
    color: '#FFFFFF',
    fontSize: 39,
    fontWeight: '900',
    letterSpacing: -1.5,
    marginTop: 3,
  },

  welcomeSubtitle: {
    color: '#888888',
    fontSize: 14,
    marginTop: 8,
  },

  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '800',
    marginBottom: 16,
    marginTop: 15,
  },

  mainCard: {
    backgroundColor: '#191919',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#303030',
  },

  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  cardLabel: {
    color: '#999999',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },

  percentage: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  bigNumber: {
    color: '#FFFFFF',
    fontSize: 42,
    fontWeight: '800',
    marginTop: 15,
  },

  totalNumber: {
    color: '#777777',
    fontSize: 22,
    fontWeight: '500',
  },

  progressBackground: {
    height: 7,
    backgroundColor: '#383838',
    borderRadius: 10,
    marginTop: 17,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
  },

  taskBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },

  cardDescription: {
    color: '#999999',
    fontSize: 12,
  },

  viewTasksButton: {
    borderTopWidth: 1,
    borderTopColor: '#333333',
    marginTop: 18,
    paddingTop: 14,
  },

  viewTasksText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },

  statCard: {
    flex: 1,
    backgroundColor: '#191919',
    borderRadius: 14,
    padding: 15,
    borderWidth: 1,
    borderColor: '#303030',
  },

  statNumber: {
    color: '#FFFFFF',
    fontSize: 27,
    fontWeight: '800',
  },

  statLabel: {
    color: '#999999',
    fontSize: 11,
    marginTop: 6,
  },

  smallText: {
    color: '#777777',
    fontSize: 10,
    marginTop: 5,
  },

  habitCard: {
    backgroundColor: '#191919',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: '#303030',
    marginTop: 12,
  },

  expenseCard: {
    backgroundColor: '#191919',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#303030',
  },

  balance: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '800',
    marginTop: 10,
  },

  expenseDivider: {
    height: 1,
    backgroundColor: '#333333',
    marginVertical: 20,
  },

  expenseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  expenseLabel: {
    color: '#999999',
    fontSize: 12,
    marginBottom: 7,
  },

  incomeAmount: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },

  expenseAmount: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },

  transactionText: {
    color: '#777777',
    fontSize: 11,
    marginTop: 20,
  },

  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },

  actionCard: {
    width: '48%',
    flexGrow: 1,
    backgroundColor: '#191919',
    borderWidth: 1,
    borderColor: '#303030',
    borderRadius: 14,
    padding: 18,
    minHeight: 105,
    justifyContent: 'center',
  },

  actionSymbol: {
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: '700',
  },

  actionTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 10,
  },

  footer: {
    color: '#555555',
    fontSize: 9,
    letterSpacing: 1,
    textAlign: 'center',
    marginTop: 40,
  },
});
