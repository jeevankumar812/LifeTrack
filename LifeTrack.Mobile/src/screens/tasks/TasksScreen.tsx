
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
  Task,
  TaskData,
  getTasks,
  createTask,
  updateTask,
  completeTask,
  deleteTask,
} from '../../services/taskService';

type FilterType = 'all' | 'pending' | 'completed';

export default function TasksScreen({ navigation }: any) {
  const { user } = useAuth();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');

  const token = user?.token;

  const loadTasks = async () => {
    try {
      const result = await getTasks(
        filter === 'all' ? undefined : filter,
        token
      );

      setTasks(result);
    } catch (error: any) {
      console.log('Tasks error:', error.response?.data || error.message);

      Alert.alert(
        'Error',
        error.response?.data?.message || 'Unable to load tasks.'
      );
    }
  };

  useEffect(() => {
    const load = async () => {
      await loadTasks();
      setLoading(false);
    };

    load();
  }, [filter]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadTasks();
    setRefreshing(false);
  }, [filter, token]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDueDate('');
    setPriority('Medium');
    setEditingTask(null);
    setShowForm(false);
  };

  const openCreateForm = () => {
    setEditingTask(null);
    setTitle('');
    setDescription('');
    setDueDate('');
    setPriority('Medium');
    setShowForm(true);
  };

  const openEditForm = (task: Task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description || '');
    setDueDate(
      task.dueDate ? task.dueDate.substring(0, 10) : ''
    );
    setPriority(task.priority || 'Medium');
    setShowForm(true);
  };

  const handleSaveTask = async () => {
    if (!title.trim()) {
      Alert.alert('Missing title', 'Please enter a task title.');
      return;
    }

    if (dueDate.trim() && !/^\d{4}-\d{2}-\d{2}$/.test(dueDate.trim())) {
      Alert.alert('Invalid date', 'Use the format YYYY-MM-DD.');
      return;
    }

    const taskData: TaskData = {
      title: title.trim(),
      description: description.trim(),
      dueDate: dueDate.trim() || null,
      priority,
    };

    try {
      setSaving(true);

      if (editingTask) {
        await updateTask(
          editingTask.id,
          {
            ...taskData,
            isCompleted: editingTask.isCompleted,
          },
          token
        );

        Alert.alert('Success', 'Task updated successfully.');
      } else {
        await createTask(taskData, token);

        Alert.alert('Success', 'Task created successfully.');
      }

      resetForm();
      await loadTasks();
    } catch (error: any) {
      console.log('Save task error:', error.response?.data || error.message);

      Alert.alert(
        'Error',
        error.response?.data?.message || 'Unable to save task.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = async (task: Task) => {
    try {
      if (task.isCompleted) {
        await updateTask(
          task.id,
          {
            title: task.title,
            description: task.description || '',
            dueDate: task.dueDate || null,
            priority: task.priority,
            isCompleted: false,
          },
          token
        );
      } else {
        await completeTask(task.id, token);
      }

      await loadTasks();
    } catch (error: any) {
      console.log('Complete task error:', error.response?.data || error.message);

      Alert.alert(
        'Error',
        error.response?.data?.message || 'Unable to update task status.'
      );
    }
  };

  const handleDelete = (task: Task) => {
    Alert.alert(
      'Delete Task',
      `Are you sure you want to delete "${task.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTask(task.id, token);
              await loadTasks();
            } catch (error: any) {
              Alert.alert('Error', 'Unable to delete task.');
            }
          },
        },
      ]
    );
  };

  const getPriorityColor = (value: string) => {
    if (value === 'High') return '#FF7777';
    if (value === 'Medium') return '#E5C36A';
    return '#AAAAAA';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text style={styles.loadingText}>Loading tasks...</Text>
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

        <View style={styles.heading}>
          <Text style={styles.headingTitle}>Your Tasks.</Text>
          <Text style={styles.subtitle}>
            Plan your day. Get things done.
          </Text>
        </View>

        {/* Task Summary */}
        <View style={styles.summaryCard}>
          <View>
            <Text style={styles.summaryNumber}>{tasks.length}</Text>
            <Text style={styles.summaryLabel}>Tasks displayed</Text>
          </View>

          <TouchableOpacity
            style={styles.addButton}
            onPress={openCreateForm}
          >
            <Text style={styles.addButtonText}>+ Add Task</Text>
          </TouchableOpacity>
        </View>

        {/* Filters */}
        <View style={styles.filterRow}>
          {(['all', 'pending', 'completed'] as FilterType[]).map((item) => (
            <TouchableOpacity
              key={item}
              style={[
                styles.filterButton,
                filter === item && styles.activeFilter,
              ]}
              onPress={() => setFilter(item)}
            >
              <Text
                style={[
                  styles.filterText,
                  filter === item && styles.activeFilterText,
                ]}
              >
                {item.charAt(0).toUpperCase() + item.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Create / Edit Form */}
        {showForm && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>
              {editingTask ? 'Edit Task' : 'Create New Task'}
            </Text>

            <Text style={styles.inputLabel}>TASK TITLE</Text>
            <TextInput
              style={styles.input}
              placeholder="What do you need to do?"
              placeholderTextColor="#777777"
              value={title}
              onChangeText={setTitle}
              maxLength={150}
            />

            <Text style={styles.inputLabel}>DESCRIPTION</Text>
            <TextInput
              style={[styles.input, styles.descriptionInput]}
              placeholder="Add some details..."
              placeholderTextColor="#777777"
              value={description}
              onChangeText={setDescription}
              multiline
            />

            <Text style={styles.inputLabel}>DUE DATE (OPTIONAL)</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#777777"
              value={dueDate}
              onChangeText={setDueDate}
            />

            <Text style={styles.inputLabel}>PRIORITY</Text>

            <View style={styles.priorityRow}>
              {(['Low', 'Medium', 'High'] as const).map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.priorityButton,
                    priority === item && styles.selectedPriority,
                  ]}
                  onPress={() => setPriority(item)}
                >
                  <Text
                    style={[
                      styles.priorityText,
                      priority === item && styles.selectedPriorityText,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <AppButton
              title={editingTask ? 'Update Task' : 'Create Task'}
              onPress={handleSaveTask}
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

        {/* Task List */}
        <Text style={styles.sectionTitle}>Task List</Text>

        {tasks.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No tasks found</Text>
            <Text style={styles.emptyText}>
              Add a task and start making progress.
            </Text>
          </View>
        ) : (
          tasks.map((task) => (
            <View style={styles.taskCard} key={task.id}>
              <View style={styles.taskTopRow}>
                <TouchableOpacity
                  style={[
                    styles.checkCircle,
                    task.isCompleted && styles.checkedCircle,
                  ]}
                  onPress={() => handleComplete(task)}
                >
                  <Text style={styles.checkText}>
                    {task.isCompleted ? '✓' : ''}
                  </Text>
                </TouchableOpacity>

                <View style={styles.taskDetails}>
                  <Text
                    style={[
                      styles.taskTitle,
                      task.isCompleted && styles.completedTitle,
                    ]}
                  >
                    {task.title}
                  </Text>

                  {!!task.description && (
                    <Text style={styles.taskDescription}>
                      {task.description}
                    </Text>
                  )}

                  <View style={styles.taskMeta}>
                    <Text
                      style={[
                        styles.priorityLabel,
                        { color: getPriorityColor(task.priority) },
                      ]}
                    >
                      {task.priority} Priority
                    </Text>

                    {task.dueDate && (
                      <Text style={styles.dueDate}>
                        Due: {task.dueDate.substring(0, 10)}
                      </Text>
                    )}
                  </View>
                </View>
              </View>

              <View style={styles.taskActions}>
                <TouchableOpacity onPress={() => openEditForm(task)}>
                  <Text style={styles.editText}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => handleDelete(task)}>
                  <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
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

  loadingText: {
    color: '#999999',
    marginTop: 15,
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

  logo: {
    color: '#FFFFFF',
    fontSize: 23,
    fontWeight: '900',
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
    borderColor: '#303030',
    borderWidth: 1,
    borderRadius: 15,
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  summaryNumber: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '800',
  },

  summaryLabel: {
    color: '#999999',
    fontSize: 12,
    marginTop: 4,
  },

  addButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 30,
  },

  addButtonText: {
    color: '#000000',
    fontWeight: '700',
    fontSize: 13,
  },

  filterRow: {
    flexDirection: 'row',
    gap: 9,
    marginTop: 25,
    marginBottom: 20,
  },

  filterButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#383838',
    borderRadius: 25,
    paddingVertical: 11,
    alignItems: 'center',
  },

  activeFilter: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },

  filterText: {
    color: '#AAAAAA',
    fontSize: 12,
    fontWeight: '600',
  },

  activeFilterText: {
    color: '#000000',
  },

  formCard: {
    backgroundColor: '#191919',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#333333',
    padding: 18,
    marginBottom: 25,
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
    minHeight: 85,
    textAlignVertical: 'top',
  },

  priorityRow: {
    flexDirection: 'row',
    gap: 9,
    marginBottom: 22,
  },

  priorityButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#444444',
    alignItems: 'center',
  },

  selectedPriority: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },

  priorityText: {
    color: '#AAAAAA',
    fontWeight: '600',
    fontSize: 12,
  },

  selectedPriorityText: {
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

  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '800',
    marginBottom: 15,
    marginTop: 10,
  },

  taskCard: {
    backgroundColor: '#191919',
    borderWidth: 1,
    borderColor: '#303030',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },

  taskTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  checkCircle: {
    width: 23,
    height: 23,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#999999',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },

  checkedCircle: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },

  checkText: {
    color: '#000000',
    fontWeight: '900',
    fontSize: 14,
  },

  taskDetails: {
    flex: 1,
  },

  taskTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  completedTitle: {
    color: '#777777',
    textDecorationLine: 'line-through',
  },

  taskDescription: {
    color: '#999999',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
  },

  taskMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 10,
  },

  priorityLabel: {
    fontSize: 11,
    fontWeight: '700',
  },

  dueDate: {
    color: '#888888',
    fontSize: 11,
  },

  taskActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 22,
    borderTopWidth: 1,
    borderTopColor: '#303030',
    marginTop: 15,
    paddingTop: 12,
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
  },

  footer: {
    color: '#555555',
    fontSize: 9,
    letterSpacing: 1,
    textAlign: 'center',
    marginTop: 35,
  },
});
