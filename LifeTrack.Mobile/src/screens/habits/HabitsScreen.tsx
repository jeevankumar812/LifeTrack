
import React, { useCallback, useEffect, useState } from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
} from 'react-native';

import { useAuth } from '../../context/AuthContext';
import AppButton from '../../components/AppButton';

import {
  Habit,
  HabitData,
  HabitProgress,
  getHabits,
  createHabit,
  updateHabit,
  deleteHabit,
  completeHabit,
  undoHabitCompletion,
  getHabitProgress,
} from '../../services/habitService';

export default function HabitsScreen({ navigation }: any) {
  const { user } = useAuth();

  const [habits, setHabits] = useState<Habit[]>([]);
  const [progress, setProgress] = useState<Record<string, HabitProgress>>({});

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState('Daily');

  const token = user?.token;

  const loadHabits = async () => {
    try {
      const result = await getHabits(token);

      setHabits(result);

      // Load progress for each habit independently.
      const progressResults = await Promise.all(
        result.map(async (habit) => {
          try {
            const habitProgress = await getHabitProgress(
              habit.id,
              token,
              30
            );

            return [habit.id, habitProgress] as const;
          } catch (error) {
            console.log(`Progress error for ${habit.name}:`, error);
            return null;
          }
        })
      );

      const progressMap: Record<string, HabitProgress> = {};

      progressResults.forEach((item) => {
        if (item) {
          progressMap[item[0]] = item[1];
        }
      });

      setProgress(progressMap);
    } catch (error: any) {
      console.log('Habits error:', error.response?.data || error.message);

      Alert.alert(
        'Error',
        error.response?.data?.message || 'Unable to load habits.'
      );
    }
  };

  useEffect(() => {
    const load = async () => {
      await loadHabits();
      setLoading(false);
    };

    load();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadHabits();
    setRefreshing(false);
  }, [token]);

  const resetForm = () => {
    setName('');
    setDescription('');
    setFrequency('Daily');
    setEditingHabit(null);
    setShowForm(false);
  };

  const openCreateForm = () => {
    setEditingHabit(null);
    setName('');
    setDescription('');
    setFrequency('Daily');
    setShowForm(true);
  };

  const openEditForm = (habit: Habit) => {
    setEditingHabit(habit);
    setName(habit.name);
    setDescription(habit.description || '');
    setFrequency(habit.frequency || 'Daily');
    setShowForm(true);
  };

  const handleSaveHabit = async () => {
    if (!name.trim()) {
      Alert.alert('Missing name', 'Please enter a habit name.');
      return;
    }

    const habitData: HabitData = {
      name: name.trim(),
      description: description.trim(),
      frequency: frequency.trim() || 'Daily',
      isActive: editingHabit?.isActive ?? true,
    };

    try {
      setSaving(true);

      if (editingHabit) {
        await updateHabit(
          editingHabit.id,
          habitData,
          token
        );

        Alert.alert('Success', 'Habit updated successfully.');
      } else {
        await createHabit(habitData, token);

        Alert.alert('Success', 'Habit created successfully.');
      }

      resetForm();
      await loadHabits();
    } catch (error: any) {
      console.log('Save habit error:', error.response?.data || error.message);

      Alert.alert(
        'Error',
        error.response?.data?.message || 'Unable to save habit.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleToggleCompletion = async (habit: Habit) => {
    try {
      if (habit.completedToday) {
        await undoHabitCompletion(habit.id, token);
      } else {
        await completeHabit(habit.id, token);
      }

      await loadHabits();
    } catch (error: any) {
      console.log('Habit completion error:', error.response?.data || error.message);

      Alert.alert(
        'Error',
        error.response?.data?.message ||
          'Unable to update habit completion.'
      );
    }
  };

  const handleDeleteHabit = (habit: Habit) => {
    Alert.alert(
      'Delete Habit',
      `Are you sure you want to delete "${habit.name}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteHabit(habit.id, token);
              await loadHabits();

              Alert.alert('Deleted', 'Habit deleted successfully.');
            } catch (error: any) {
              console.log('Delete habit error:', error.response?.data);

              Alert.alert('Error', 'Unable to delete habit.');
            }
          },
        },
      ]
    );
  };

  const activeHabits = habits.filter((habit) => habit.isActive);

  const completedCount = activeHabits.filter(
    (habit) => habit.completedToday
  ).length;

  const progressPercentage =
    activeHabits.length > 0
      ? Math.round((completedCount / activeHabits.length) * 100)
      : 0;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <Text style={styles.logo}>LifeTrack.</Text>
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text style={styles.loadingText}>Loading your habits...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
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
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>‹ Back</Text>
          </TouchableOpacity>

          <Text style={styles.logo}>LifeTrack.</Text>
        </View>

        {/* Heading */}
        <View style={styles.heading}>
          <Text style={styles.headingTitle}>Your Habits.</Text>
          <Text style={styles.subtitle}>
            Small steps. Consistent progress.
          </Text>
        </View>

        {/* Daily Progress */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryTop}>
            <View>
              <Text style={styles.summaryLabel}>TODAY'S PROGRESS</Text>
              <Text style={styles.summaryNumber}>
                {completedCount}
                <Text style={styles.summaryTotal}>
                  {' / '}{activeHabits.length}
                </Text>
              </Text>
              <Text style={styles.summaryDescription}>
                Habits completed today
              </Text>
            </View>

            <Text style={styles.progressPercentage}>
              {progressPercentage}%
            </Text>
          </View>

          <View style={styles.progressBackground}>
            <View
              style={[
                styles.progressFill,
                { width: `${progressPercentage}%` },
              ]}
            />
          </View>
        </View>

        {/* Add Habit */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={openCreateForm}
        >
          <Text style={styles.addButtonText}>+ Create New Habit</Text>
        </TouchableOpacity>

        {/* Create / Edit Form */}
        {showForm && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>
              {editingHabit ? 'Edit Habit' : 'Create Habit'}
            </Text>

            <Text style={styles.inputLabel}>HABIT NAME</Text>
            <TextInput
              style={styles.input}
              placeholder="Example: Morning workout"
              placeholderTextColor="#777777"
              value={name}
              onChangeText={setName}
              maxLength={100}
            />

            <Text style={styles.inputLabel}>DESCRIPTION</Text>
            <TextInput
              style={[styles.input, styles.descriptionInput]}
              placeholder="Why is this habit important?"
              placeholderTextColor="#777777"
              value={description}
              onChangeText={setDescription}
              multiline
            />

            <Text style={styles.inputLabel}>FREQUENCY</Text>
            <View style={styles.frequencyRow}>
              {['Daily', 'Weekly'].map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.frequencyButton,
                    frequency === item && styles.selectedFrequency,
                  ]}
                  onPress={() => setFrequency(item)}
                >
                  <Text
                    style={[
                      styles.frequencyText,
                      frequency === item && styles.selectedFrequencyText,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <AppButton
              title={editingHabit ? 'Update Habit' : 'Create Habit'}
              onPress={handleSaveHabit}
              loading={saving}
              disabled={saving}
            />

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={resetForm}
              disabled={saving}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Habit List */}
        <View style={styles.listHeader}>
          <Text style={styles.sectionTitle}>Active Habits</Text>
          <Text style={styles.countText}>{activeHabits.length} habits</Text>
        </View>

        {activeHabits.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No habits yet</Text>
            <Text style={styles.emptyText}>
              Create your first habit and start building consistency.
            </Text>
          </View>
        ) : (
          activeHabits.map((habit) => {
            const habitProgress = progress[habit.id];

            return (
              <View style={styles.habitCard} key={habit.id}>
                <View style={styles.habitTopRow}>
                  <View style={styles.habitDetails}>
                    <Text style={styles.habitName}>{habit.name}</Text>

                    {!!habit.description && (
                      <Text style={styles.habitDescription}>
                        {habit.description}
                      </Text>
                    )}

                    <Text style={styles.frequencyLabel}>
                      {habit.frequency}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.checkButton,
                      habit.completedToday && styles.checkedButton,
                    ]}
                    onPress={() => handleToggleCompletion(habit)}
                  >
                    <Text
                      style={[
                        styles.checkText,
                        habit.completedToday && styles.checkedText,
                      ]}
                    >
                      {habit.completedToday ? '✓' : 'Done'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.streakRow}>
                  <View style={styles.streakItem}>
                    <Text style={styles.streakNumber}>
                      {habitProgress?.currentStreak ?? 0}
                    </Text>
                    <Text style={styles.streakLabel}>Current streak</Text>
                  </View>

                  <View style={styles.streakItem}>
                    <Text style={styles.streakNumber}>
                      {habitProgress?.longestStreak ?? 0}
                    </Text>
                    <Text style={styles.streakLabel}>Best streak</Text>
                  </View>

                  <View style={styles.streakItem}>
                    <Text style={styles.streakNumber}>
                      {habitProgress?.completionPercentage ?? 0}%
                    </Text>
                    <Text style={styles.streakLabel}>30-day progress</Text>
                  </View>
                </View>

                <View style={styles.habitActions}>
                  <TouchableOpacity onPress={() => openEditForm(habit)}>
                    <Text style={styles.editText}>Edit</Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => handleDeleteHabit(habit)}>
                    <Text style={styles.deleteText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}

        {/* Inactive Habits */}
        {habits.some((habit) => !habit.isActive) && (
          <>
            <Text style={styles.sectionTitle}>Inactive Habits</Text>

            {habits
              .filter((habit) => !habit.isActive)
              .map((habit) => (
                <View style={styles.inactiveCard} key={habit.id}>
                  <View style={styles.inactiveDetails}>
                    <Text style={styles.inactiveName}>{habit.name}</Text>
                    <Text style={styles.inactiveLabel}>Inactive</Text>
                  </View>

                  <TouchableOpacity onPress={() => openEditForm(habit)}>
                    <Text style={styles.editText}>Edit</Text>
                  </TouchableOpacity>
                </View>
              ))}
          </>
        )}

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
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -1,
  },

  loadingText: {
    color: '#888888',
    marginTop: 18,
    fontSize: 14,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  backText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },

  heading: {
    marginTop: 35,
    marginBottom: 25,
  },

  headingTitle: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: -1,
  },

  subtitle: {
    color: '#888888',
    fontSize: 14,
    marginTop: 7,
  },

  summaryCard: {
    backgroundColor: '#191919',
    borderWidth: 1,
    borderColor: '#303030',
    borderRadius: 16,
    padding: 20,
  },

  summaryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  summaryLabel: {
    color: '#999999',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },

  summaryNumber: {
    color: '#FFFFFF',
    fontSize: 40,
    fontWeight: '800',
    marginTop: 10,
  },

  summaryTotal: {
    color: '#777777',
    fontSize: 23,
  },

  summaryDescription: {
    color: '#888888',
    fontSize: 12,
    marginTop: 4,
  },

  progressPercentage: {
    color: '#FFFFFF',
    fontSize: 23,
    fontWeight: '800',
  },

  progressBackground: {
    height: 7,
    backgroundColor: '#383838',
    borderRadius: 10,
    marginTop: 20,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
  },

  addButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 20,
  },

  addButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '800',
  },

  formCard: {
    backgroundColor: '#191919',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#333333',
    padding: 18,
    marginTop: 20,
  },

  formTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 22,
  },

  inputLabel: {
    color: '#BBBBBB',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 9,
  },

  input: {
    backgroundColor: '#101010',
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#353535',
    borderRadius: 9,
    paddingHorizontal: 13,
    paddingVertical: 14,
    fontSize: 14,
    marginBottom: 18,
  },

  descriptionInput: {
    minHeight: 75,
    textAlignVertical: 'top',
  },

  frequencyRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 22,
  },

  frequencyButton: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#444444',
    alignItems: 'center',
  },

  selectedFrequency: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },

  frequencyText: {
    color: '#AAAAAA',
    fontSize: 13,
    fontWeight: '600',
  },

  selectedFrequencyText: {
    color: '#000000',
  },

  cancelButton: {
    alignItems: 'center',
    paddingVertical: 14,
  },

  cancelText: {
    color: '#AAAAAA',
    fontSize: 13,
    fontWeight: '600',
  },

  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 15,
  },

  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '800',
    marginTop: 25,
    marginBottom: 15,
  },

  countText: {
    color: '#888888',
    fontSize: 12,
  },

  habitCard: {
    backgroundColor: '#191919',
    borderWidth: 1,
    borderColor: '#303030',
    borderRadius: 15,
    padding: 17,
    marginBottom: 13,
  },

  habitTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  habitDetails: {
    flex: 1,
    paddingRight: 10,
  },

  habitName: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },

  habitDescription: {
    color: '#999999',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
  },

  frequencyLabel: {
    color: '#777777',
    fontSize: 11,
    marginTop: 9,
  },

  checkButton: {
    minWidth: 65,
    height: 38,
    borderWidth: 1,
    borderColor: '#777777',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },

  checkedButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },

  checkText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  checkedText: {
    color: '#000000',
    fontSize: 17,
  },

  streakRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#333333',
    marginTop: 18,
    paddingTop: 15,
  },

  streakItem: {
    flex: 1,
  },

  streakNumber: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },

  streakLabel: {
    color: '#888888',
    fontSize: 10,
    marginTop: 5,
  },

  habitActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 22,
    borderTopWidth: 1,
    borderTopColor: '#333333',
    marginTop: 15,
    paddingTop: 13,
  },

  editText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },

  deleteText: {
    color: '#FF7777',
    fontSize: 12,
    fontWeight: '600',
  },

  emptyCard: {
    backgroundColor: '#191919',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#303030',
    padding: 30,
    alignItems: 'center',
  },

  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },

  emptyText: {
    color: '#888888',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 19,
  },

  inactiveCard: {
    backgroundColor: '#191919',
    borderWidth: 1,
    borderColor: '#303030',
    borderRadius: 13,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  inactiveDetails: {
    flex: 1,
  },

  inactiveName: {
    color: '#999999',
    fontSize: 14,
    fontWeight: '700',
  },

  inactiveLabel: {
    color: '#666666',
    fontSize: 11,
    marginTop: 5,
  },

  footer: {
    color: '#555555',
    fontSize: 9,
    letterSpacing: 1,
    textAlign: 'center',
    marginTop: 35,
  },
});
