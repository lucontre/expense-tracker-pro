import { useNavigation } from '@react-navigation/native';

export function useAppNavigation() {
  const navigation = useNavigation();

  const navigateToTransactions = () => {
    navigation.navigate('Transactions' as never);
  };

  const navigateToBudgets = () => {
    navigation.navigate('Budgets' as never);
  };

  const navigateToReports = () => {
    navigation.navigate('Reports' as never);
  };

  const navigateToSavingsGoals = () => {
    navigation.navigate('SavingsGoals' as never);
  };

  const navigateToNotifications = () => {
    navigation.navigate('Notifications' as never);
  };

  const navigateToAccountSharing = () => {
    navigation.navigate('AccountSharing' as never);
  };

  const navigateToContact = () => {
    navigation.navigate('Contact' as never);
  };

  const navigateToProfile = () => {
    navigation.navigate('Profile' as never);
  };

  const navigateToDashboard = () => {
    navigation.navigate('Dashboard' as never);
  };

  return {
    navigateToTransactions,
    navigateToBudgets,
    navigateToReports,
    navigateToSavingsGoals,
    navigateToNotifications,
    navigateToAccountSharing,
    navigateToContact,
    navigateToProfile,
    navigateToDashboard,
  };
}
