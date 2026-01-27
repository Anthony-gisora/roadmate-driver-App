import React from "react";
import { View, Button, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

const TrackLocationButton: React.FC = () => {
    const navigation = useNavigation<any>();

    const handlePress = () => {
        // Navigate to /home and reset history
        navigation.reset({
            index: 0,
            routes: [{ name: "home" }],
        });
    };

    return (
        <View style={styles.container}>
            <Button title="Track live location" onPress={handlePress} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
});

export default TrackLocationButton;
