// VehicleDialog.tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

interface VehicleDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onSubmit: (vehicle: {
    make: string;
    model: string;
    plate: string;
    year: number;
    color: string;
    isDefault: boolean;
  }) => Promise<void>;
  defaultIsDefault?: boolean;
}

const VehicleDialog: React.FC<VehicleDialogProps> = ({
  open,
  setOpen,
  onSubmit,
  defaultIsDefault = false,
}) => {
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [plate, setPlate] = useState('');
  const [year, setYear] = useState('');
  const [color, setColor] = useState('');
  const [isDefault, setIsDefault] = useState(defaultIsDefault);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) {
      // Reset fields when modal closes
      setMake('');
      setModel('');
      setPlate('');
      setYear('');
      setColor('');
      setIsDefault(defaultIsDefault);
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!make.trim() || !model.trim() || !plate.trim() || !year.trim()) {
      Alert.alert('Missing Fields', 'Please fill in all required fields.');
      return;
    }

    const numericYear = parseInt(year);
    if (isNaN(numericYear) || numericYear < 1900 || numericYear > new Date().getFullYear() + 1) {
      Alert.alert('Invalid Year', 'Please enter a valid year.');
      return;
    }

    setSaving(true);
    try {
      await onSubmit({
        make: make.trim(),
        model: model.trim(),
        plate: plate.trim().toUpperCase(),
        year: numericYear,
        color: color.trim(),
        isDefault,
      });
      //setOpen(false);
    } catch (err) {
      console.error('Failed to add vehicle:', err);
      Alert.alert('Error', 'Failed to add vehicle, please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Add Vehicle</Text>
          <ScrollView 
            style={styles.scrollContainer} 
            showsVerticalScrollIndicator={false} 
            contentContainerStyle={{ paddingBottom: 16 }}>
            {/* Make */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Make *</Text>
              <TextInput
                style={styles.input}
                value={make}
                onChangeText={setMake}
                placeholder="e.g., Toyota"
                placeholderTextColor="#94a3b8"
              />
            </View>

            {/* Model */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Model *</Text>
              <TextInput
                style={styles.input}
                value={model}
                onChangeText={setModel}
                placeholder="e.g., Camry"
                placeholderTextColor="#94a3b8"
              />
            </View>

            {/* Year */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Year *</Text>
              <TextInput
                style={styles.input}
                value={year}
                onChangeText={setYear}
                placeholder="e.g., 2020"
                placeholderTextColor="#94a3b8"
                keyboardType="number-pad"
                maxLength={4}
              />
            </View>

            {/* Color */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Color</Text>
              <TextInput
                style={styles.input}
                value={color}
                onChangeText={setColor}
                placeholder="e.g., Silver"
                placeholderTextColor="#94a3b8"
              />
            </View>

            {/* Plate */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>License Plate *</Text>
              <TextInput
                style={styles.input}
                value={plate}
                onChangeText={(text) => setPlate(text.toUpperCase())}
                placeholder="e.g., ABC-123"
                placeholderTextColor="#94a3b8"
                autoCapitalize="characters"
              />
            </View>

            {/* Default Vehicle */}
            <TouchableOpacity
              style={[styles.defaultContainer, isDefault && styles.defaultContainerActive]}
              onPress={() => setIsDefault(!isDefault)}
            >
              <View style={[styles.checkbox, isDefault && styles.checkboxActive]}>
                {isDefault && <Ionicons name="checkmark" size={16} color="#fff" />}
              </View>
              <Text style={styles.defaultText}>Set as Default Vehicle</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setOpen(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.saveButton} onPress={handleSubmit} disabled={saving}>
              <Text style={styles.saveText}>{saving ? 'Saving...' : 'Add Vehicle'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default VehicleDialog;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    maxHeight: '80%',
  },
  scrollContainer: {
    maxHeight: '65%',
    marginBottom: 16,
    },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#1e293b',
    backgroundColor: '#f8fafc',
  },
  defaultContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    marginBottom: 16,
  },
  defaultContainerActive: {
    backgroundColor: '#07553810',
    borderColor: '#07553830',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: '#075538',
    borderColor: '#075538',
  },
  defaultText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  saveButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#075538',
    borderRadius: 12,
  },
  saveText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});
