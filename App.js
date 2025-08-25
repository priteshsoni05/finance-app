import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView, View, Text, FlatList, Modal, TextInput, TouchableOpacity, StyleSheet, StatusBar, Alert, Platform, KeyboardAvoidingView } from 'react-native';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { parseAmountFromText } from './src/services/parser';

const STORAGE_KEY = 'transactions.v1';

function formatINR(n) {
  if (typeof n !== 'number' || Number.isNaN(n)) return '0.00';
  return new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}

export default function App() {
  const [transactions, setTransactions] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentAmount, setCurrentAmount] = useState('');
  const [note, setNote] = useState('');
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    (async () => {
      try {
        const data = await AsyncStorage.getItem(STORAGE_KEY);
        if (data) setTransactions(JSON.parse(data));
      } catch (e) {
        console.error('Error loading transactions', e);
      }
    })();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(transactions)).catch(() => {});
  }, [transactions]);

  useEffect(() => {
    const sub = Notifications.addNotificationReceivedListener((notification) => {
      try {
        const message = notification?.request?.content?.body || '';
        const { amount } = parseAmountFromText(message);
        if (amount) {
          setCurrentAmount(String(amount));
          setModalVisible(true);
        }
      } catch (e) {
        console.warn('Parse notification failed', e);
      }
    });
    return () => sub.remove();
  }, []);

  const openAddModal = () => {
    setCurrentAmount('');
    setNote('');
    setModalVisible(true);
  };

  const saveTransaction = async () => {
    const n = Number(currentAmount);
    if (Number.isNaN(n)) {
      Alert.alert('Invalid amount', 'Please enter a valid number.');
      return;
    }
    const txn = { id: Date.now().toString(), amount: n, note: note.trim(), ts: Date.now() };
    setTransactions([txn, ...transactions]);
    setModalVisible(false);
    setCurrentAmount('');
    setNote('');
  };

  const today = new Date(); today.setHours(0,0,0,0);
  const todayNet = transactions.filter(t => t.ts >= today.getTime()).reduce((s,t) => s + (t.amount || 0), 0);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#F9F9F9' }]}>
      <StatusBar barStyle='dark-content' />
      <View style={styles.headerRow}>
        <Text style={styles.title}>FinTracker</Text>
        <TouchableOpacity onPress={openAddModal} style={styles.addBtn}>
          <Text style={{ fontWeight: '700' }}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={{ color: '#666', marginBottom: 6 }}>Today</Text>
        <Text style={{ color: todayNet >= 0 ? '#16A34A' : '#EF4444', fontSize: 28, fontWeight: '900' }}>
          ₹ {formatINR(Math.abs(todayNet))} {todayNet >= 0 ? 'net' : 'spent'}
        </Text>
      </View>

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 24 }}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View>
              <Text style={{ fontWeight: '700' }}>{item.note || '—'}</Text>
              <Text style={{ color: '#666', fontSize: 12 }}>{new Date(item.ts).toLocaleString()}</Text>
            </View>
            <Text style={{ color: item.amount >= 0 ? '#16A34A' : '#EF4444', fontWeight: '800' }}>
              {item.amount >= 0 ? '+' : '-'}₹{formatINR(Math.abs(item.amount))}
            </Text>
          </View>
        )}
        ListEmptyComponent={<Text style={{ color: '#666', textAlign: 'center', marginTop: 32 }}>No transactions yet.</Text>}
      />

      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalWrap}>
          <View style={[styles.sheet]}>
            <Text style={styles.sheetTitle}>Add Transaction</Text>
            <Text style={styles.label}>Amount</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              placeholderTextColor={'#999'}
              keyboardType="decimal-pad"
              value={currentAmount}
              onChangeText={setCurrentAmount}
            />

            <Text style={styles.label}>Note</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Zomato, Fuel, Groceries"
              placeholderTextColor={'#999'}
              value={note}
              onChangeText={setNote}
            />

            <View style={styles.sheetActions}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.btn}>
                <Text style={{ color: '#666' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={saveTransaction} style={styles.btnPrimary}>
                <Text style={{ color: '#000', fontWeight: '700' }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 8 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, marginBottom: 12 },
  title: { fontSize: 22, fontWeight: '800' },
  card: { borderWidth: 1, borderRadius: 16, padding: 16, marginBottom: 12, borderColor: '#E5E7EB' },
  row: { borderWidth: 1, borderRadius: 12, padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderColor: '#E5E7EB' },

  modalWrap: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16, borderTopWidth: 1, borderLeftWidth: 1, borderRightWidth: 1, backgroundColor: '#fff' },
  sheetTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  label: { marginBottom: 6 },

  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 10, padding: 12, marginBottom: 12, color: '#111', backgroundColor: '#fff' },

  sheetActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  btn: { paddingVertical: 12, paddingHorizontal: 18, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  btnPrimary: { paddingVertical: 12, paddingHorizontal: 18, borderRadius: 12, backgroundColor: '#16A34A' },
  addBtn: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1, borderColor: '#E5E7EB' },
});
