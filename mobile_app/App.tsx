import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "./app/(tabs)/index";
import StatsScreen from "./app/(tabs)/stats";

const Tab = createBottomTabNavigator();

export default function App(){

    return (
        <NavigationContainer>
            <Tab.Navigator
                screenOptions={{
                    headerShown:true,
                    tabBarActiveTintColor: "#FFD700", 
                    tabBarStyle: {backgroundColor: "#111"},
                }}
                >
                    <Tab.Screen name="Home" component={HomeScreen} />
                    <Tab.Screen name="Stats" component={StatsScreen} />
                </Tab.Navigator>
        </NavigationContainer>
    );
}
