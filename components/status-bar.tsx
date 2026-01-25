import { StatusBar, Platform } from "react-native";

const CustomStatusBar = ({ backgroundColor, barStyle = "dark-content" }) => {
    return (
        <StatusBar
            barStyle={barStyle}
            backgroundColor={Platform.OS === "android" ? backgroundColor : undefined}
            translucent={false}
        />
    );
};

export default CustomStatusBar;
