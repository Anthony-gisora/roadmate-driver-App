import { offlineDB } from "@/data/db"; // adjust your path
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function CarSelector({ onSelectCar }) {
  const [cars, setCars] = useState([]);
  const [selectedCar, setSelectedCar] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    loadCars();
  }, []);

  const loadCars = async () => {
    const allCars = await offlineDB.getCars();
    setCars(allCars);

    // Load default car
    const defaultCar = await offlineDB.getDefaultCar();
    if (defaultCar) {
      setSelectedCar(defaultCar);
      onSelectCar(defaultCar);
    }
  };

  const handleSelect = (car) => {
    setSelectedCar(car);
    setDropdownOpen(false);
    onSelectCar(car);
  };

  return (
    <View style={{ marginBottom: 15 }}>
      
      {/* Selected Car Display */}
      <TouchableOpacity
        style={styles.selected}
        onPress={() => setDropdownOpen(!dropdownOpen)}
      >
        <View style={styles.iconBox}>
          <Ionicons name="car" size={20} color="#2563eb" />
        </View>

        {selectedCar ? (
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>
              {selectedCar.year} {selectedCar.make} {selectedCar.model}
            </Text>
            <Text style={styles.subtitle}>
              {selectedCar.color} {selectedCar.plate}
            </Text>
          </View>
        ) : (
          <Text style={styles.noCarText}>
            Attach vehicle in profile → vehicle details
          </Text>
        )}

        <Ionicons
          name={dropdownOpen ? "chevron-up" : "chevron-down"}
          size={22}
          color="#555"
        />
      </TouchableOpacity>

      {/* Dropdown List */}
      {dropdownOpen && (
        <View style={styles.dropdown}>
          <FlatList
            data={cars}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => handleSelect(item)}
              >
                <Ionicons name="car" size={18} color="#2563eb" />

                <View style={{ marginLeft: 10 }}>
                  <Text style={styles.dropdownTitle}>
                    {item.year} {item.make} {item.model}
                  </Text>
                  <Text style={styles.dropdownSubtitle}>
                    {item.color} {item.plate}
                  </Text>
                </View>

                {item.isDefault ? (
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color="#16a34a"
                    style={{ marginLeft: "auto" }}
                  />
                ) : null}
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  selected: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  iconBox: {
    width: 34,
    height: 34,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#dbeafe",
    borderRadius: 8,
    marginRight: 10,
  },
  title: { fontWeight: "600", fontSize: 15, color: "#1e293b" },
  subtitle: { fontSize: 13, color: "#64748b" },
  noCarText: { flex: 1, color: "#475569", fontSize: 14 },
  dropdown: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginTop: 5,
    borderRadius: 10,
    overflow: "hidden",
    maxHeight: 200,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  dropdownTitle: { fontWeight: "600", color: "#1e293b" },
  dropdownSubtitle: { fontSize: 12, color: "#64748b" },
});
