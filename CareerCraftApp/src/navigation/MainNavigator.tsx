import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../utils/constants';
import HomeScreen from '../screens/main/HomeScreen';
import ResumeScreen from '../screens/main/ResumeScreen';
import CompaniesScreen from '../screens/main/CompaniesScreen';
import TemplatesScreen from '../screens/main/TemplatesScreen';
import NetworkScreen from '../screens/main/NetworkScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

const Tab = createBottomTabNavigator();

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, string> = {
    Home: '🏠', Resume: '📄', Companies: '🏢', Templates: '🎨', Network: '🔗', Profile: '👤',
  };
  return (
    <View style={[styles.iconWrap, focused && styles.iconActive]}>
      <Text style={styles.iconText}>{icons[name]}</Text>
    </View>
  );
}

export default function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#C5A880',
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
        animation: 'fade', // Hardware-accelerated native cross-fade transition
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Resume" component={ResumeScreen} />
      <Tab.Screen name="Companies" component={CompaniesScreen} />
      <Tab.Screen name="Templates" component={TemplatesScreen} />
      <Tab.Screen name="Network" component={NetworkScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#07060F',
    borderTopColor: 'rgba(197, 168, 128, 0.25)', // glowing bronze top line
    borderTopWidth: 1,
    height: 70,
    paddingBottom: 10,
    paddingTop: 6,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  iconWrap: {
    width: 32, height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconActive: {
    backgroundColor: 'rgba(197, 168, 128, 0.15)', // transparent bronze glow background
  },
  iconText: { fontSize: 18 },
});
