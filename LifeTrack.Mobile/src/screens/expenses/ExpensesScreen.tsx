
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert,
  StatusBar,
} from 'react-native';

import { useAuth } from '../../context/AuthContext';
import AppButton from '../../components/AppButton';

import {
  Expense,
  ExpenseData,
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
} from '../../services/expenseService';

type FilterType = 'All' | 'Income' | 'Expense';

const categories = [
  'Food',
  'Transport',
  'Shopping',
  'Bills',
  'Health',
  'Education',
  'Salary',
  'Freelance',
  'Other',
];

export default function ExpensesScreen({ navigation }: any) {
  const { user } = useAuth();

  const [expenses, setExpenses] = useState<Expense[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [filter, setFilter] = useState<FilterType>('All');
  const [search, setSearch] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'Income' | 'Expense'>('Expense');
  const [category, setCategory] = useState('Food');
  const [transactionDate, setTransactionDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  const token = user?.token;

  const loadExpenses = async () => {
    try {
      const result = await getExpenses(token);
      setExpenses(result);
    } catch (error: any) {
      console.log(
        'Expenses error:',
        error.response?.data || error.message
      );

      Alert.alert(
        'Error',
        error.response?.data?.message || 'Unable to load transactions.'
      );
    }
  };

  useEffect(() => {
    const load = async () => {
      await loadExpenses();
      setLoading(false);
    };

    load();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadExpenses();
    setRefreshing(false);
  }, [token]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setAmount('');
    setType('Expense');
    setCategory('Food');
    setTransactionDate(new Date().toISOString().split('T')[0]);
    setEditingExpense(null);
    setShowForm(false);
  };

  const openCreateForm = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (item: Expense) => {
    setEditingExpense(item);
    setTitle(item.title);
    setDescription(item.description || '');
    setAmount(String(item.amount));
    setType(item.type);
    setCategory(item.category || 'Other');
    setTransactionDate(item.transactionDate?.slice(0, 10) || '');
    setShowForm(true);
  };

  const handleSave = async () => {
    const numericAmount = Number(amount);

    if (!title.trim()) {
      Alert.alert('Missing title', 'Enter a transaction title.');
      return;
    }

    if (!amount.trim() || !Number.isFinite(numericAmount) || numericAmount <= 0) {
      Alert.alert('Invalid amount', 'Enter an amount greater than zero.');
      return;
    }

    if (!transactionDate || !/^\d{4}-\d{2}-\d{2}$/.test(transactionDate)) {
      Alert.alert('Invalid date', 'Use the date format YYYY-MM-DD.');
      return;
    }

    const data: ExpenseData = {
      title: title.trim(),
      description: description.trim(),
      amount: numericAmount,
      type,
      category,
      transactionDate,
    };

    try {
      setSaving(true);

      if (editingExpense) {
        await updateExpense(editingExpense.id, data, token);
      } else {
        await createExpense(data, token);
      }

      resetForm();
      await loadExpenses();

      Alert.alert(
        'Success',
        editingExpense
          ? 'Transaction updated successfully.'
          : 'Transaction added successfully.'
      );
    } catch (error: any) {
      console.log(
        'Save transaction error:',
        error.response?.data || error.message
      );

      Alert.alert(
        'Error',
        error.response?.data?.message || 'Unable to save transaction.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (item: Expense) => {
    Alert.alert(
      'Delete Transaction',
      `Delete "${item.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteExpense(item.id, token);
              await loadExpenses();
              Alert.alert('Deleted', 'Transaction deleted.');
            } catch (error: any) {
              console.log('Delete error:', error.response?.data);
              Alert.alert('Error', 'Unable to delete transaction.');
            }
          },
        },
      ]
    );
  };

  const filteredExpenses = useMemo(() => {
    const query = search.trim().toLowerCase();

    return expenses.filter((item) => {
      const matchesFilter =
        filter === 'All' || item.type.toLowerCase() === filter.toLowerCase();

      const matchesSearch =
        !query ||
        item.title.toLowerCase().includes(query) ||
        (item.category || '').toLowerCase().includes(query) ||
        (item.description || '').toLowerCase().includes(query);

      return matchesFilter && matchesSearch;
    });
  }, [expenses, filter, search]);

  const totalIncome = expenses
    .filter((item) => item.type.toLowerCase() === 'income')
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const totalExpenses = expenses
    .filter((item) => item.type.toLowerCase() === 'expense')
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const balance = totalIncome - totalExpenses;

  const formatCurrency = (value: number) =>
    `₹${Number(value || 0).toLocaleString('en-IN', {
      maximumFractionDigits: 2,
    })}`;

  const formatDate = (value: string) => {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <Text style={styles.logo}>LifeTrack.</Text>
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text style={styles.loadingText}>Loading transactions...</Text>
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
          <Text style={styles.headingTitle}>Your Money.</Text>
          <Text style={styles.subtitle}>
            Track every rupee. Stay in control.
          </Text>
        </View>

        {/* Balance */}
        <View style={styles.balanceCard}>
          <Text style={styles.summaryLabel}>TOTAL BALANCE</Text>
          <Text style={styles.balanceText}>{formatCurrency(balance)}</Text>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryRow}>
            <View>
              <Text style={styles.summaryLabel}>INCOME</Text>
              <Text style={styles.incomeText}>
                {formatCurrency(totalIncome)}
              </Text>
            </View>

            <View>
              <Text style={styles.summaryLabel}>EXPENSES</Text>
              <Text style={styles.expenseText}>
                {formatCurrency(totalExpenses)}
              </Text>
            </View>
          </View>
        </View>

        {/* Add */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={openCreateForm}
        >
          <Text style={styles.addButtonText}>+ Add Transaction</Text>
        </TouchableOpacity>

        {/* Form */}
        {showForm && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>
              {editingExpense ? 'Edit Transaction' : 'New Transaction'}
            </Text>

            <Text style={styles.inputLabel}>TRANSACTION TYPE</Text>

            <View style={styles.typeRow}>
              {(['Expense', 'Income'] as const).map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.typeButton,
                    type === item && styles.selectedType,
                  ]}
                  onPress={() => {
                    setType(item);
                    setCategory(item === 'Income' ? 'Salary' : 'Food');
                  }}
                >
                  <Text
                    style={[
                      styles.typeText,
                      type === item && styles.selectedTypeText,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>TITLE</Text>
            <TextInput
              style={styles.input}
              placeholder="Example: Monthly salary"
              placeholderTextColor="#777777"
              value={title}
              onChangeText={setTitle}
              maxLength={120}
            />

            <Text style={styles.inputLabel}>AMOUNT (₹)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter amount"
              placeholderTextColor="#777777"
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
            />

            <Text style={styles.inputLabel}>CATEGORY</Text>

            <View style={styles.categoryContainer}>
              {categories
                .filter((item) =>
                  type === 'Income'
                    ? ['Salary', 'Freelance', 'Other'].includes(item)
                    : !['Salary', 'Freelance'].includes(item)
                )
                .map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={[
                      styles.categoryButton,
                      category === item && styles.selectedCategory,
                    ]}
                    onPress={() => setCategory(item)}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        category === item && styles.selectedCategoryText,
                      ]}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                ))}
            </View>

            <Text style={styles.inputLabel}>DATE (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.input}
              placeholder="2026-11-02"
              placeholderTextColor="#777777"
              value={transactionDate}
              onChangeText={setTransactionDate}
            />

            <Text style={styles.inputLabel}>DESCRIPTION</Text>
            <TextInput
              style={[styles.input, styles.descriptionInput]}
              placeholder="Add some details..."
              placeholderTextColor="#777777"
              value={description}
              onChangeText={setDescription}
              multiline
              textAlignVertical="top"
            />

            <AppButton
              title={editingExpense ? 'Update Transaction' : 'Save Transaction'}
              onPress={handleSave}
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

        {/* Search */}
        <TextInput
          style={styles.searchInput}
          placeholder="Search transactions..."
          placeholderTextColor="#777777"
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
        />

        {/* Filters */}
        <View style={styles.filterRow}>
          {(['All', 'Income', 'Expense'] as const).map((item) => (
            <TouchableOpacity
              key={item}
              style={[
                styles.filterButton,
                filter === item && styles.selectedFilter,
              ]}
              onPress={() => setFilter(item)}
            >
              <Text
                style={[
                  styles.filterText,
                  filter === item && styles.selectedFilterText,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Transaction List */}
        <View style={styles.listHeader}>
          <Text style={styles.sectionTitle}>Transactions</Text>
          <Text style={styles.countText}>
            {filteredExpenses.length} records
          </Text>
        </View>

        {filteredExpenses.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No transactions found</Text>
            <Text style={styles.emptyText}>
              Add your first transaction to start tracking your money.
            </Text>
          </View>
        ) : (
          filteredExpenses.map((item) => {
            const isIncome = item.type.toLowerCase() === 'income';

            return (
              <View style={styles.transactionCard} key={item.id}>
                <View style={styles.transactionTop}>
                  <View style={styles.transactionDetails}>
                    <Text style={styles.transactionTitle}>
                      {item.title}
                    </Text>

                    <Text style={styles.transactionCategory}>
                      {item.category || 'Other'} • {formatDate(item.transactionDate)}
                    </Text>

                    {!!item.description && (
                      <Text style={styles.transactionDescription}>
                        {item.description}
                      </Text>
                    )}
                  </View>

                  <Text
                    style={[
                      styles.transactionAmount,
                      isIncome ? styles.incomeText : styles.expenseText,
                    ]}
                  >
                    {isIncome ? '+' : '-'}{formatCurrency(item.amount)}
                  </Text>
                </View>

                <View style={styles.transactionActions}>
                  <TouchableOpacity onPress={() => openEditForm(item)}>
                    <Text style={styles.editText}>Edit</Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => handleDelete(item)}>
                    <Text style={styles.deleteText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
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

  balanceCard: {
    backgroundColor: '#191919',
    borderWidth: 1,
    borderColor: '#303030',
    borderRadius: 16,
    padding: 20,
  },

  summaryLabel: {
    color: '#999999',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },

  balanceText: {
    color: '#FFFFFF',
    fontSize: 35,
    fontWeight: '800',
    marginTop: 10,
  },

  summaryDivider: {
    height: 1,
    backgroundColor: '#333333',
    marginVertical: 20,
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  incomeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 7,
  },

  expenseText: {
    color: '#FF8585',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 7,
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

  typeRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },

  typeButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#444444',
    borderRadius: 9,
    paddingVertical: 13,
    alignItems: 'center',
  },

  selectedType: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },

  typeText: {
    color: '#AAAAAA',
    fontWeight: '700',
  },

  selectedTypeText: {
    color: '#000000',
  },

  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },

  categoryButton: {
    borderWidth: 1,
    borderColor: '#444444',
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 20,
  },

  selectedCategory: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },

  categoryText: {
    color: '#AAAAAA',
    fontSize: 11,
  },

  selectedCategoryText: {
    color: '#000000',
    fontWeight: '700',
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

  searchInput: {
    backgroundColor: '#191919',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 15,
    color: '#FFFFFF',
    fontSize: 14,
    marginTop: 25,
  },

  filterRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },

  filterButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#444444',
    borderRadius: 25,
    alignItems: 'center',
    paddingVertical: 11,
  },

  selectedFilter: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },

  filterText: {
    color: '#AAAAAA',
    fontSize: 12,
    fontWeight: '600',
  },

  selectedFilterText: {
    color: '#000000',
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
  },

  countText: {
    color: '#888888',
    fontSize: 12,
  },

  transactionCard: {
    backgroundColor: '#191919',
    borderWidth: 1,
    borderColor: '#303030',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },

  transactionTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  transactionDetails: {
    flex: 1,
    paddingRight: 10,
  },

  transactionTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  transactionCategory: {
    color: '#888888',
    fontSize: 10,
    marginTop: 6,
  },

  transactionDescription: {
    color: '#AAAAAA',
    fontSize: 11,
    marginTop: 8,
  },

  transactionAmount: {
    fontSize: 14,
    fontWeight: '800',
  },

  transactionActions: {
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

  footer: {
    color: '#555555',
    fontSize: 9,
    letterSpacing: 1,
    textAlign: 'center',
    marginTop: 35,
  },
});
