
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
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import { useAuth } from '../../context/AuthContext';
import AppButton from '../../components/AppButton';

import {
  Note,
  NoteData,
  getNotes,
  createNote,
  updateNote,
  deleteNote,
  togglePinNote,
} from '../../services/noteService';

export default function NotesScreen({ navigation }: any) {
  const { user } = useAuth();

  const [notes, setNotes] = useState<Note[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const token = user?.token;

  const loadNotes = async () => {
    try {
      const result = await getNotes(token);
      setNotes(result);
    } catch (error: any) {
      console.log(
        'Notes error:',
        error.response?.data || error.message
      );

      Alert.alert(
        'Error',
        error.response?.data?.message || 'Unable to load notes.'
      );
    }
  };

  useEffect(() => {
    const load = async () => {
      await loadNotes();
      setLoading(false);
    };

    load();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadNotes();
    setRefreshing(false);
  }, [token]);

  const resetForm = () => {
    setTitle('');
    setContent('');
    setEditingNote(null);
    setShowForm(false);
  };

  const openCreateForm = () => {
    setEditingNote(null);
    setTitle('');
    setContent('');
    setShowForm(true);
  };

  const openEditForm = (note: Note) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content);
    setShowForm(true);
  };

  const handleSaveNote = async () => {
    if (!title.trim()) {
      Alert.alert('Missing title', 'Please enter a note title.');
      return;
    }

    if (!content.trim()) {
      Alert.alert('Missing content', 'Please enter some note content.');
      return;
    }

    const noteData: NoteData = {
      title: title.trim(),
      content: content.trim(),
      isPinned: editingNote?.isPinned ?? false,
    };

    try {
      setSaving(true);

      if (editingNote) {
        await updateNote(editingNote.id, noteData, token);
      } else {
        await createNote(noteData, token);
      }

      resetForm();
      await loadNotes();

      Alert.alert(
        'Success',
        editingNote ? 'Note updated successfully.' : 'Note created successfully.'
      );
    } catch (error: any) {
      console.log(
        'Save note error:',
        error.response?.data || error.message
      );

      Alert.alert(
        'Error',
        error.response?.data?.message || 'Unable to save note.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteNote = (note: Note) => {
    Alert.alert(
      'Delete Note',
      `Are you sure you want to delete "${note.title}"?`,
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
              await deleteNote(note.id, token);
              await loadNotes();

              Alert.alert('Deleted', 'Note deleted successfully.');
            } catch (error: any) {
              console.log(
                'Delete note error:',
                error.response?.data || error.message
              );

              Alert.alert('Error', 'Unable to delete note.');
            }
          },
        },
      ]
    );
  };

  const handleTogglePin = async (note: Note) => {
    try {
      await togglePinNote(note.id, token);
      await loadNotes();
    } catch (error: any) {
      console.log(
        'Pin note error:',
        error.response?.data || error.message
      );

      Alert.alert('Error', 'Unable to update pin status.');
    }
  };

  const filteredNotes = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return notes;
    }

    return notes.filter(
      (note) =>
        note.title.toLowerCase().includes(query) ||
        note.content.toLowerCase().includes(query)
    );
  }, [notes, search]);

  const pinnedNotes = filteredNotes.filter((note) => note.isPinned);

  const otherNotes = filteredNotes.filter((note) => !note.isPinned);

  const formatDate = (date?: string) => {
    if (!date) return 'Recently created';

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return 'Recently created';
    }

    return parsedDate.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const renderNote = (note: Note) => (
    <View style={styles.noteCard} key={note.id}>
      <View style={styles.noteTopRow}>
        <View style={styles.noteTitleContainer}>
          <Text style={styles.noteTitle}>{note.title}</Text>

          <Text style={styles.noteDate}>
            {formatDate(note.updatedAt || note.createdAt)}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.pinButton}
          onPress={() => handleTogglePin(note)}
        >
          <Text style={styles.pinText}>
            {note.isPinned ? '★' : '☆'}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.noteContent} numberOfLines={5}>
        {note.content}
      </Text>

      <View style={styles.noteActions}>
        <TouchableOpacity onPress={() => openEditForm(note)}>
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => handleDeleteNote(note)}>
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />

        <Text style={styles.logo}>LifeTrack.</Text>

        <ActivityIndicator size="large" color="#FFFFFF" />

        <Text style={styles.loadingText}>Loading your notes...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
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
          <Text style={styles.headingTitle}>Your Notes.</Text>

          <Text style={styles.subtitle}>
            Your thoughts. All in one place.
          </Text>
        </View>

        {/* Summary */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{notes.length}</Text>
            <Text style={styles.summaryLabel}>Total Notes</Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>
              {notes.filter((note) => note.isPinned).length}
            </Text>
            <Text style={styles.summaryLabel}>Pinned Notes</Text>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>⌕</Text>

          <TextInput
            style={styles.searchInput}
            placeholder="Search your notes..."
            placeholderTextColor="#777777"
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
          />

          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Text style={styles.clearSearch}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Create Button */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={openCreateForm}
        >
          <Text style={styles.addButtonText}>+ Create New Note</Text>
        </TouchableOpacity>

        {/* Form */}
        {showForm && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>
              {editingNote ? 'Edit Note' : 'Create Note'}
            </Text>

            <Text style={styles.inputLabel}>TITLE</Text>

            <TextInput
              style={styles.input}
              placeholder="Enter note title"
              placeholderTextColor="#777777"
              value={title}
              onChangeText={setTitle}
              maxLength={150}
            />

            <Text style={styles.inputLabel}>CONTENT</Text>

            <TextInput
              style={[styles.input, styles.contentInput]}
              placeholder="Write your thoughts here..."
              placeholderTextColor="#777777"
              value={content}
              onChangeText={setContent}
              multiline
              textAlignVertical="top"
            />

            <AppButton
              title={editingNote ? 'Update Note' : 'Save Note'}
              onPress={handleSaveNote}
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

        {/* Pinned Notes */}
        {pinnedNotes.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Pinned Notes</Text>
              <Text style={styles.sectionCount}>
                {pinnedNotes.length}
              </Text>
            </View>

            {pinnedNotes.map(renderNote)}
          </>
        )}

        {/* Other Notes */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {pinnedNotes.length > 0 ? 'Other Notes' : 'All Notes'}
          </Text>

          <Text style={styles.sectionCount}>
            {otherNotes.length}
          </Text>
        </View>

        {otherNotes.length === 0 && pinnedNotes.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>
              {search ? 'No matching notes' : 'No notes yet'}
            </Text>

            <Text style={styles.emptyText}>
              {search
                ? 'Try searching with another keyword.'
                : 'Create your first note and keep your thoughts organized.'}
            </Text>
          </View>
        ) : (
          otherNotes.map(renderNote)
        )}

        <Text style={styles.footer}>
          YOUR LIFE. YOUR GOALS. YOUR TRACKER.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
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

  summaryRow: {
    flexDirection: 'row',
    gap: 12,
  },

  summaryCard: {
    flex: 1,
    backgroundColor: '#191919',
    borderWidth: 1,
    borderColor: '#303030',
    borderRadius: 14,
    padding: 17,
  },

  summaryNumber: {
    color: '#FFFFFF',
    fontSize: 29,
    fontWeight: '800',
  },

  summaryLabel: {
    color: '#999999',
    fontSize: 11,
    marginTop: 6,
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#191919',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 12,
    paddingHorizontal: 15,
    marginTop: 22,
  },

  searchIcon: {
    color: '#AAAAAA',
    fontSize: 25,
    marginRight: 10,
  },

  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    paddingVertical: 15,
  },

  clearSearch: {
    color: '#AAAAAA',
    fontSize: 17,
    padding: 5,
  },

  addButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 18,
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

  contentInput: {
    minHeight: 150,
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

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 30,
    marginBottom: 15,
  },

  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '800',
  },

  sectionCount: {
    color: '#888888',
    fontSize: 12,
  },

  noteCard: {
    backgroundColor: '#191919',
    borderWidth: 1,
    borderColor: '#303030',
    borderRadius: 15,
    padding: 17,
    marginBottom: 13,
  },

  noteTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  noteTitleContainer: {
    flex: 1,
    paddingRight: 10,
  },

  noteTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },

  noteDate: {
    color: '#777777',
    fontSize: 10,
    marginTop: 6,
  },

  pinButton: {
    paddingHorizontal: 7,
    paddingVertical: 3,
  },

  pinText: {
    color: '#FFFFFF',
    fontSize: 23,
  },

  noteContent: {
    color: '#AAAAAA',
    fontSize: 13,
    lineHeight: 21,
    marginTop: 15,
  },

  noteActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 22,
    borderTopWidth: 1,
    borderTopColor: '#333333',
    marginTop: 17,
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
