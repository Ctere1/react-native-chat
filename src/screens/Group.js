import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useMemo, useState, useEffect } from 'react';
import { query, orderBy, collection, onSnapshot } from 'firebase/firestore';
import {
  Text,
  View,
  Alert,
  Modal,
  FlatList,
  Pressable,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

import ContactRow from '../components/ContactRow';
import { auth, database } from '../config/firebase';
import { createGroupChat } from '../services/chatService';
import { colors, layout, spacing } from '../config/constants';
import { getDisplayName, getUserStatusText } from '../utils/chat';

const Group = () => {
  const navigation = useNavigation();
  const [selectedItems, setSelectedItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);

  useEffect(() => {
    const collectionUserRef = collection(database, 'users');
    const q = query(collectionUserRef, orderBy('name', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setUsers(snapshot.docs);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        selectedItems.length > 0 && <Text style={styles.itemCount}>{selectedItems.length}</Text>,
    });
  }, [navigation, selectedItems]);

  const handleName = (user) => getDisplayName(user.data(), auth?.currentUser?.email);

  const handleSubtitle = (user) => getUserStatusText(user.data().email, auth?.currentUser?.email);

  const handleOnPress = (user) => {
    selectItems(user);
  };

  const selectItems = (user) => {
    setSelectedItems((prevItems) => {
      if (prevItems.includes(user.id)) {
        return prevItems.filter((item) => item !== user.id);
      }
      return [...prevItems, user.id];
    });
  };

  const getSelected = (user) => selectedItems.includes(user.id);

  const deSelectItems = () => {
    setSelectedItems([]);
  };

  const handleFabPress = () => {
    setModalVisible(true);
  };

  const selectableUsers = useMemo(
    () => users.filter((user) => user.data().email !== auth?.currentUser?.email),
    [users]
  );

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert('Missing group name', 'Group name cannot be empty.');
      return;
    }

    const usersToAdd = users
      .filter((user) => selectedItems.includes(user.id))
      .map((user) => user.data());

    try {
      setIsCreatingGroup(true);
      const chatId = await createGroupChat({
        currentUser: auth?.currentUser,
        groupName,
        selectedUsers: usersToAdd,
      });

      navigation.navigate('Chat', { id: chatId, chatName: groupName.trim() });
      deSelectItems();
      setModalVisible(false);
      setGroupName('');
    } catch (error) {
      Alert.alert('Unable to create group', error.message);
    } finally {
      setIsCreatingGroup(false);
    }
  };

  const renderUser = ({ item }) => (
    <ContactRow
      style={getSelected(item) ? styles.selectedContactRow : undefined}
      name={handleName(item)}
      subtitle={handleSubtitle(item)}
      onPress={() => handleOnPress(item)}
      selected={getSelected(item)}
      showForwardIcon={false}
    />
  );

  return (
    <Pressable style={styles.container} onPress={deSelectItems}>
      {selectableUsers.length === 0 ? (
        <View style={styles.pageContent}>
          <View style={styles.listCard}>
            <View style={styles.blankContainer}>
              <Text style={styles.textContainer}>No registered users yet</Text>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.pageContent}>
          <View style={styles.listCard}>
            <FlatList
              data={selectableUsers}
              renderItem={renderUser}
              keyExtractor={(item) => item.id}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.listContent}
            />
          </View>
        </View>
      )}
      {selectedItems.length > 0 && (
        <TouchableOpacity style={styles.fab} onPress={handleFabPress} disabled={isCreatingGroup}>
          <View style={styles.fabContainer}>
            <Ionicons name="arrow-forward-outline" size={24} color="white" />
          </View>
        </TouchableOpacity>
      )}
      <Modal
        animationType="slide"
        transparent
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Enter Group Name</Text>
            <TextInput
              style={styles.input}
              onChangeText={setGroupName}
              value={groupName}
              placeholder="Group Name"
              editable={!isCreatingGroup}
              onSubmitEditing={handleCreateGroup} // Create group on submit
            />
            <TouchableOpacity
              style={[styles.createButton, isCreatingGroup ? styles.createButtonDisabled : undefined]}
              onPress={handleCreateGroup}
              disabled={isCreatingGroup}
            >
              {isCreatingGroup ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.createButtonLabel}>Create group</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  blankContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  container: {
    backgroundColor: '#F8FAFC',
    flex: 1,
  },
  createButton: {
    alignItems: 'center',
    backgroundColor: colors.teal,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    width: '100%',
  },
  createButtonDisabled: {
    opacity: 0.7,
  },
  createButtonLabel: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  fab: {
    bottom: layout.fabOffset,
    position: 'absolute',
    right: layout.fabOffset,
  },
  fabContainer: {
    alignItems: 'center',
    backgroundColor: colors.teal,
    borderRadius: 28,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  input: {
    borderColor: '#cfcfcf',
    borderRadius: 12,
    borderWidth: 1,
    height: 48,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.sm,
    width: '100%',
  },
  itemCount: {
    color: colors.teal,
    fontSize: 18,
    fontWeight: '400',
    marginRight: spacing.sm,
  },
  listCard: {
    backgroundColor: 'white',
    borderRadius: layout.cardRadius,
    flex: 1,
    overflow: 'hidden',
  },
  listContent: {
    paddingBottom: 88,
    paddingTop: spacing.xs,
  },
  modalBackdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  modalView: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: layout.cardRadius + spacing.xxs,
    elevation: 5,
    padding: spacing.xl,
  },
  pageContent: {
    flex: 1,
    paddingHorizontal: layout.pageInset,
    paddingTop: layout.pageTopInset,
  },
  selectedContactRow: {
    backgroundColor: '#E0E0E0',
  },
  textContainer: {
    fontSize: 16,
  },
});

export default Group;
