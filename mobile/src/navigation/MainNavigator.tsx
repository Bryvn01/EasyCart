/**
 * Main Navigator
 *
 * Bottom tab navigator for authenticated users with nested stacks:
 * - Home (Products, Search, Featured)
 * - Categories (Browse by category)
 * - Cart (Cart, Checkout, Payment)
 * - Profile (Orders, Wishlist, Settings)
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type {
  MainTabParamList,
  HomeStackParamList,
  CategoriesStackParamList,
  CartStackParamList,
  ProfileStackParamList,
} from './types';
import { theme } from '@/theme';

// Stack navigators for each tab
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const CategoriesStack = createNativeStackNavigator<CategoriesStackParamList>();
const CartStack = createNativeStackNavigator<CartStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();

const Tab = createBottomTabNavigator<MainTabParamList>();

// Placeholder components (replace with actual screens)
import { View, Text, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';

const PlaceholderScreen = ({ title }: { title: string }) => (
  <View style={styles.placeholder}>
    <Text style={styles.placeholderText}>{title}</Text>
  </View>
);

// Home Stack Screens
const HomeScreen = () => <PlaceholderScreen title="Home Screen" />;
const ProductDetailScreen = () => <PlaceholderScreen title="Product Detail" />;
const SearchScreen = () => <PlaceholderScreen title="Search" />;
const ProductListScreen = () => <PlaceholderScreen title="Product List" />;

// Categories Stack Screens
const CategoriesScreen = () => <PlaceholderScreen title="Categories" />;
const CategoryDetailScreen = () => <PlaceholderScreen title="Category Detail" />;
const SubCategoryScreen = () => <PlaceholderScreen title="Sub Category" />;

// Cart Stack Screens
const CartScreen = () => <PlaceholderScreen title="Cart" />;
const CheckoutScreen = () => <PlaceholderScreen title="Checkout" />;
const PaymentMethodScreen = () => <PlaceholderScreen title="Payment Method" />;
const PaymentStatusScreen = () => <PlaceholderScreen title="Payment Status" />;
const OrderConfirmationScreen = () => <PlaceholderScreen title="Order Confirmation" />;

// Profile Stack Screens
const ProfileScreen = () => <PlaceholderScreen title="Profile" />;
const EditProfileScreen = () => <PlaceholderScreen title="Edit Profile" />;
const OrdersScreen = () => <PlaceholderScreen title="Orders" />;
const OrderDetailScreen = () => <PlaceholderScreen title="Order Detail" />;
const WishlistScreen = () => <PlaceholderScreen title="Wishlist" />;
const AddressesScreen = () => <PlaceholderScreen title="Addresses" />;
const AddAddressScreen = () => <PlaceholderScreen title="Add Address" />;
const EditAddressScreen = () => <PlaceholderScreen title="Edit Address" />;
const SettingsScreen = () => <PlaceholderScreen title="Settings" />;
const NotificationsScreen = () => <PlaceholderScreen title="Notifications" />;
const SecurityScreen = () => <PlaceholderScreen title="Security" />;
const TwoFactorSettingsScreen = () => <PlaceholderScreen title="2FA Settings" />;
const ChangePasswordScreen = () => <PlaceholderScreen title="Change Password" />;
const HelpScreen = () => <PlaceholderScreen title="Help" />;
const AboutScreen = () => <PlaceholderScreen title="About" />;

/**
 * Default screen options for stacks
 */
const stackScreenOptions = {
  headerStyle: {
    backgroundColor: theme.colors.background,
  },
  headerTintColor: theme.colors.onBackground,
  headerTitleStyle: {
    fontFamily: theme.typography.titleLarge.fontFamily,
    fontSize: theme.typography.titleLarge.fontSize,
    fontWeight: theme.typography.titleLarge.fontWeight,
  },
  headerShadowVisible: false,
  animation: 'slide_from_right' as const,
};

/**
 * Home Tab Stack
 */
function HomeTabNavigator() {
  return (
    <HomeStack.Navigator screenOptions={stackScreenOptions}>
      <HomeStack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerTitle: 'EasyCart' }}
      />
      <HomeStack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{ headerTitle: 'Product Details' }}
      />
      <HomeStack.Screen
        name="Search"
        component={SearchScreen}
        options={{ headerTitle: 'Search Products' }}
      />
      <HomeStack.Screen
        name="ProductList"
        component={ProductListScreen}
        options={{ headerTitle: 'Products' }}
      />
    </HomeStack.Navigator>
  );
}

/**
 * Categories Tab Stack
 */
function CategoriesTabNavigator() {
  return (
    <CategoriesStack.Navigator screenOptions={stackScreenOptions}>
      <CategoriesStack.Screen
        name="Categories"
        component={CategoriesScreen}
        options={{ headerTitle: 'Categories' }}
      />
      <CategoriesStack.Screen
        name="CategoryDetail"
        component={CategoryDetailScreen}
        options={{ headerTitle: 'Category' }}
      />
      <CategoriesStack.Screen
        name="SubCategory"
        component={SubCategoryScreen}
        options={({ route }) => ({
          headerTitle: route.params?.categoryName || 'Sub Category',
        })}
      />
    </CategoriesStack.Navigator>
  );
}

/**
 * Cart Tab Stack
 */
function CartTabNavigator() {
  return (
    <CartStack.Navigator screenOptions={stackScreenOptions}>
      <CartStack.Screen
        name="Cart"
        component={CartScreen}
        options={{ headerTitle: 'Shopping Cart' }}
      />
      <CartStack.Screen
        name="Checkout"
        component={CheckoutScreen}
        options={{ headerTitle: 'Checkout' }}
      />
      <CartStack.Screen
        name="PaymentMethod"
        component={PaymentMethodScreen}
        options={{ headerTitle: 'Payment Method' }}
      />
      <CartStack.Screen
        name="PaymentStatus"
        component={PaymentStatusScreen}
        options={{ headerTitle: 'Payment Status', headerBackVisible: false }}
      />
      <CartStack.Screen
        name="OrderConfirmation"
        component={OrderConfirmationScreen}
        options={{ headerTitle: 'Order Confirmed', headerBackVisible: false }}
      />
    </CartStack.Navigator>
  );
}

/**
 * Profile Tab Stack
 */
function ProfileTabNavigator() {
  return (
    <ProfileStack.Navigator screenOptions={stackScreenOptions}>
      <ProfileStack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ headerTitle: 'My Profile' }}
      />
      <ProfileStack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ headerTitle: 'Edit Profile' }}
      />
      <ProfileStack.Screen
        name="Orders"
        component={OrdersScreen}
        options={{ headerTitle: 'My Orders' }}
      />
      <ProfileStack.Screen
        name="OrderDetail"
        component={OrderDetailScreen}
        options={{ headerTitle: 'Order Details' }}
      />
      <ProfileStack.Screen
        name="Wishlist"
        component={WishlistScreen}
        options={{ headerTitle: 'My Wishlist' }}
      />
      <ProfileStack.Screen
        name="Addresses"
        component={AddressesScreen}
        options={{ headerTitle: 'Saved Addresses' }}
      />
      <ProfileStack.Screen
        name="AddAddress"
        component={AddAddressScreen}
        options={{ headerTitle: 'Add Address' }}
      />
      <ProfileStack.Screen
        name="EditAddress"
        component={EditAddressScreen}
        options={{ headerTitle: 'Edit Address' }}
      />
      <ProfileStack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ headerTitle: 'Settings' }}
      />
      <ProfileStack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ headerTitle: 'Notifications' }}
      />
      <ProfileStack.Screen
        name="Security"
        component={SecurityScreen}
        options={{ headerTitle: 'Security' }}
      />
      <ProfileStack.Screen
        name="TwoFactorSettings"
        component={TwoFactorSettingsScreen}
        options={{ headerTitle: 'Two-Factor Authentication' }}
      />
      <ProfileStack.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
        options={{ headerTitle: 'Change Password' }}
      />
      <ProfileStack.Screen
        name="Help"
        component={HelpScreen}
        options={{ headerTitle: 'Help & Support' }}
      />
      <ProfileStack.Screen
        name="About"
        component={AboutScreen}
        options={{ headerTitle: 'About EasyCart' }}
      />
    </ProfileStack.Navigator>
  );
}

/**
 * Main Bottom Tab Navigator
 */
export default function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'HomeTab':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'CategoriesTab':
              iconName = focused ? 'view-grid' : 'view-grid-outline';
              break;
            case 'CartTab':
              iconName = focused ? 'cart' : 'cart-outline';
              break;
            case 'ProfileTab':
              iconName = focused ? 'account' : 'account-outline';
              break;
            default:
              iconName = 'help-circle-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopWidth: 1,
          borderTopColor: theme.colors.surfaceVariant,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontFamily: theme.typography.labelMedium.fontFamily,
          fontSize: theme.typography.labelMedium.fontSize,
          fontWeight: theme.typography.labelMedium.fontWeight,
        },
        headerShown: false, // Headers are handled by nested stacks
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeTabNavigator}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name="CategoriesTab"
        component={CategoriesTabNavigator}
        options={{ tabBarLabel: 'Categories' }}
      />
      <Tab.Screen
        name="CartTab"
        component={CartTabNavigator}
        options={{
          tabBarLabel: 'Cart',
          // TODO: Add badge for cart item count
          // tabBarBadge: cartItemCount > 0 ? cartItemCount : undefined,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileTabNavigator}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.background,
  },
  placeholderText: {
    ...theme.typography.headlineMedium,
    color: theme.colors.onBackground,
    textAlign: 'center',
  },
});
