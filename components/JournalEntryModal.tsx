import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Platform,
  KeyboardAvoidingView,
  Alert,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { 
  addJournalEntry, 
  updateJournalEntry, 
  deleteJournalEntry, 
  JournalEntry,
  calculateProfitLoss
} from '@/firebase/journalService';

interface JournalEntryModalProps {
  visible: boolean;
  onClose: () => void;
  onEntryAdded: () => void;
  onEntryUpdated: () => void;
  onEntryDeleted: () => void;
  editEntry?: JournalEntry | null; // Pass entry to edit, null for new entry
}

export function JournalEntryModal({ 
  visible, 
  onClose, 
  onEntryAdded, 
  onEntryUpdated,
  onEntryDeleted,
  editEntry 
}: JournalEntryModalProps) {
  const { currentTheme } = useTheme();
  const { user } = useAuth();
  const theme = currentTheme;
  
  const isEditMode = !!editEntry;
  
  // Form state
  const [symbol, setSymbol] = useState('');
  const [type, setType] = useState<'buy' | 'sell'>('buy');
  const [entryPrice, setEntryPrice] = useState('');
  const [exitPrice, setExitPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');
  const [calculatedPnl, setCalculatedPnl] = useState<{ pnl: number; pnlPercent: number } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Initialize form with entry data when editing
  useEffect(() => {
    if (editEntry && visible) {
      setSymbol(editEntry.symbol);
      setType(editEntry.type);
      setEntryPrice(editEntry.entryPrice.toString());
      setExitPrice(editEntry.exitPrice.toString());
      setQuantity(editEntry.quantity.toString());
      setNotes(typeof editEntry.notes === 'string' ? editEntry.notes : '');
      
      // Set initial calculated P/L
      setCalculatedPnl({
        pnl: editEntry.pnl,
        pnlPercent: editEntry.pnlPercent
      });
    } else if (!editEntry && visible) {
      // Reset form for new entry
      resetForm();
    }
  }, [editEntry, visible]);
  
  // Calculate P/L whenever relevant inputs change
  useEffect(() => {
    if (
      entryPrice && 
      !isNaN(Number(entryPrice)) && 
      exitPrice && 
      !isNaN(Number(exitPrice)) && 
      quantity && 
      !isNaN(Number(quantity)) && 
      Number(quantity) > 0
    ) {
      const result = calculateProfitLoss(
        type,
        Number(entryPrice),
        Number(exitPrice),
        Number(quantity)
      );
      
      setCalculatedPnl(result);
    } else {
      setCalculatedPnl(null);
    }
  }, [type, entryPrice, exitPrice, quantity]);
  
  const resetForm = () => {
    setSymbol('');
    setType('buy');
    setEntryPrice('');
    setExitPrice('');
    setQuantity('');
    setNotes('');
    setCalculatedPnl(null);
    setError('');
  };
  
  const handleClose = () => {
    resetForm();
    onClose();
  };
  
  const handleDelete = () => {
    if (!editEntry || !editEntry.documentId) return;
    
    Alert.alert(
      "Delete Journal Entry",
      "Are you sure you want to delete this journal entry? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setIsSubmitting(true);
              await deleteJournalEntry(editEntry?.documentId || '');
              onEntryDeleted();
              onClose();
            } catch (err) {
              console.error('Error deleting journal entry:', err);
              setError('Failed to delete journal entry. Please try again.');
              setIsSubmitting(false);
            }
          }
        }
      ]
    );
  };
  
  const handleSubmit = async () => {
    try {
      setError('');
      setIsSubmitting(true);
      
      // Validate inputs
      if (!symbol) {
        setError('Symbol is required');
        setIsSubmitting(false);
        return;
      }
      
      if (!entryPrice || isNaN(Number(entryPrice))) {
        setError('Valid entry price is required');
        setIsSubmitting(false);
        return;
      }
      
      if (!exitPrice || isNaN(Number(exitPrice))) {
        setError('Valid exit price is required');
        setIsSubmitting(false);
        return;
      }
      
      if (!quantity || isNaN(Number(quantity)) || Number(quantity) <= 0) {
        setError('Valid quantity is required');
        setIsSubmitting(false);
        return;
      }
      
      if (!user) {
        setError('You must be logged in to add journal entries');
        setIsSubmitting(false);
        return;
      }
      
      // Calculate P/L
      const entryPriceNum = Number(entryPrice);
      const exitPriceNum = Number(exitPrice);
      const quantityNum = Number(quantity);
      
      const { pnl, pnlPercent } = calculateProfitLoss(
        type,
        entryPriceNum,
        exitPriceNum,
        quantityNum
      );
      
      if (isEditMode && editEntry?.documentId) {
        // Update existing entry
        const updates: Partial<JournalEntry> = {
          symbol: symbol.toUpperCase(),
          type,
          entryPrice: entryPriceNum,
          exitPrice: exitPriceNum,
          quantity: quantityNum,
          pnl,
          pnlPercent,
          notes,
          hasScreenshot: false
        };
        
        await updateJournalEntry(user.uid, editEntry.documentId, updates);
        onEntryUpdated();
      } else {
        // Create new entry
        const entry: Omit<JournalEntry, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'documentId'> = {
          date: new Date().toISOString(),
          symbol: symbol.toUpperCase(),
          type,
          entryPrice: entryPriceNum,
          exitPrice: exitPriceNum,
          quantity: quantityNum,
          pnl,
          pnlPercent,
          notes,
          hasScreenshot: false
        };
        
        await addJournalEntry(user.uid, entry);
        onEntryAdded();
      }
      
      // Reset form and close modal
      resetForm();
      onClose();
    } catch (err) {
      console.error('Error saving journal entry:', err);
      setError('Failed to save journal entry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingContainer}
        >
          <ThemedView variant="elevated" style={styles.modalCard}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <ThemedText type="subtitle">{isEditMode ? 'Edit Journal Entry' : 'Add Journal Entry'}</ThemedText>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={Colors[theme].icon} />
              </TouchableOpacity>
            </View>
            
            {/* Error Message */}
            {error ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={18} color="#EF4444" style={{marginRight: 8}} />
                <ThemedText style={styles.errorText}>{error}</ThemedText>
              </View>
            ) : null}
            
            {/* Form Content */}
            <ScrollView 
              style={styles.formContainer} 
              contentContainerStyle={styles.formContentContainer}
              showsVerticalScrollIndicator={false}
            >
              {/* Symbol */}
              <View style={styles.formGroup}>
                <ThemedText type="defaultSemiBold" style={styles.label}>Symbol</ThemedText>
                <ThemedView variant="innerCard" style={styles.input}>
                  <TextInput
                    style={[styles.textInput, { color: Colors[theme].text }]}
                    onChangeText={setSymbol}
                    value={symbol}
                    placeholder="e.g. COMI"
                    placeholderTextColor={'#A0A0A0'}
                    autoCapitalize="characters"
                  />
                </ThemedView>
              </View>
              
              {/* Trade Type */}
              <View style={styles.formGroup}>
                <ThemedText type="defaultSemiBold" style={styles.label}>Trade Type</ThemedText>
                <View style={styles.tradeTypeContainer}>
                  <TouchableOpacity
                    style={[
                      styles.tradeTypeButton,
                      type === 'buy' && styles.activeTradeType,
                      type === 'buy' && { backgroundColor: 'rgba(0, 168, 107, 0.1)' }
                    ]}
                    onPress={() => setType('buy')}
                  >
                    <ThemedText
                      style={[
                        type === 'buy' && { color: Colors[theme].success, fontWeight: '600' }
                      ]}
                    >
                      BUY
                    </ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.tradeTypeButton,
                      type === 'sell' && styles.activeTradeType,
                      type === 'sell' && { backgroundColor: 'rgba(239, 68, 68, 0.1)' }
                    ]}
                    onPress={() => setType('sell')}
                  >
                    <ThemedText
                      style={[
                        type === 'sell' && { color: '#EF4444', fontWeight: '600' }
                      ]}
                    >
                      SELL
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
              
              {/* Price Inputs Row */}
              <View style={styles.rowContainer}>
                {/* Entry Price */}
                <View style={[styles.formGroup, styles.halfWidth]}>
                  <ThemedText type="defaultSemiBold" style={styles.label}>Entry Price</ThemedText>
                  <ThemedView variant="innerCard" style={styles.input}>
                    <TextInput
                      style={[styles.textInput, { color: Colors[theme].text }]}
                      onChangeText={setEntryPrice}
                      value={entryPrice}
                      placeholder="0.00"
                      placeholderTextColor={'#A0A0A0'}
                      keyboardType="numeric"
                    />
                  </ThemedView>
                </View>
                
                {/* Exit Price */}
                <View style={[styles.formGroup, styles.halfWidth]}>
                  <ThemedText type="defaultSemiBold" style={styles.label}>Exit Price</ThemedText>
                  <ThemedView variant="innerCard" style={styles.input}>
                    <TextInput
                      style={[styles.textInput, { color: Colors[theme].text }]}
                      onChangeText={setExitPrice}
                      value={exitPrice}
                      placeholder="0.00"
                      placeholderTextColor={'#A0A0A0'}
                      keyboardType="numeric"
                    />
                  </ThemedView>
                </View>
              </View>
              
              {/* Quantity */}
              <View style={styles.formGroup}>
                <ThemedText type="defaultSemiBold" style={styles.label}>Quantity</ThemedText>
                <ThemedView variant="innerCard" style={styles.input}>
                  <TextInput
                    style={[styles.textInput, { color: Colors[theme].text }]}
                    onChangeText={setQuantity}
                    value={quantity}
                    placeholder="0"
                    placeholderTextColor={'#A0A0A0'}
                    keyboardType="numeric"
                  />
                </ThemedView>
              </View>
              
              {/* Calculated P/L */}
              {calculatedPnl && (
                <View style={styles.formGroup}>
                  <ThemedText type="defaultSemiBold" style={styles.label}>Calculated P/L</ThemedText>
                  <ThemedView variant="innerCard" style={[styles.calculatedPnl, calculatedPnl.pnl >= 0 ? styles.profitPnl : styles.lossPnl]}>
                    <ThemedText style={[styles.pnlText, calculatedPnl.pnl >= 0 ? styles.profitText : styles.lossText]}>
                      {calculatedPnl.pnl >= 0 ? '+' : ''}{calculatedPnl.pnl.toFixed(2)} ({calculatedPnl.pnlPercent.toFixed(2)}%)
                    </ThemedText>
                  </ThemedView>
                </View>
              )}
              
              {/* Notes */}
              <View style={styles.formGroup}>
                <ThemedText type="defaultSemiBold" style={styles.label}>Notes</ThemedText>
                <ThemedView variant="innerCard" style={[styles.input, styles.textAreaContainer]}>
                  <TextInput
                    style={[styles.textInput, styles.textArea, { color: Colors[theme].text }]}
                    onChangeText={setNotes}
                    value={notes}
                    placeholder="Add your trade notes here..."
                    placeholderTextColor={'#A0A0A0'}
                    multiline
                    numberOfLines={4}
                  />
                </ThemedView>
              </View>
            </ScrollView>
            
            {/* Button Container */}
            <View style={styles.buttonGroup}>
              {isEditMode ? (
                <>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={handleDelete}
                    disabled={isSubmitting}
                  >
                    <Ionicons name="trash-outline" size={18} color="#EF4444" style={{marginRight: 6}} />
                    <ThemedText style={styles.deleteButtonText}>Delete</ThemedText>
                  </TouchableOpacity>
                  
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={handleClose}
                      disabled={isSubmitting}
                    >
                      <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={styles.submitButton}
                      onPress={handleSubmit}
                      disabled={isSubmitting}
                    >
                      <ThemedText style={styles.submitButtonText}>
                        {isSubmitting ? 'Update' : 'Update'}
                      </ThemedText>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={handleClose}
                    disabled={isSubmitting}
                  >
                    <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleSubmit}
                    disabled={isSubmitting}
                  >
                    <ThemedText style={styles.submitButtonText}>
                      {isSubmitting ? 'Add' : 'Add Entry'}
                    </ThemedText>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </ThemedView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  keyboardAvoidingContainer: {
    width: '100%',
    maxWidth: 500,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCard: {
    width: '100%',
    maxHeight: '90%',
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  closeButton: {
    padding: 6,
    borderRadius: 16,
  },
  formContainer: {
    maxHeight: 500,
    paddingHorizontal: 24,
  },
  formContentContainer: {
    paddingVertical: 20,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
  },
  input: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  textInput: {
    fontSize: 16,
    minHeight: 40,
  },
  textAreaContainer: {
    minHeight: 100,
  },
  textArea: {
    textAlignVertical: 'top',
  },
  tradeTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tradeTypeButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  activeTradeType: {
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchHelp: {
    marginTop: 4,
    opacity: 0.7,
  },
  calculatedPnl: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  profitPnl: {
    backgroundColor: 'rgba(0, 168, 107, 0.1)',
  },
  lossPnl: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  pnlText: {
    fontSize: 18,
    fontWeight: '600',
  },
  profitText: {
    color: Colors.light.success,
  },
  lossText: {
    color: '#EF4444',
  },
  buttonGroup: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cancelButton: {
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    marginRight: 12,
    marginLeft: 12,
    alignItems: 'center',
    minWidth: 80,
    justifyContent: 'center',
  },
  submitButton: {
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    minWidth: 100,
    justifyContent: 'center',
  },
  deleteButton: {
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 100,
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontWeight: '600',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  deleteButtonText: {
    color: '#EF4444',
    fontWeight: '600',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 24,
    marginVertical: 12,
  },
  errorText: {
    color: '#EF4444',
    flex: 1,
  },
});
