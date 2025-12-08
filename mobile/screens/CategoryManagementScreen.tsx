import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
  Modal,
  ScrollView,
} from "react-native";
import {
  Surface,
  Text,
  Button,
  Card,
  IconButton,
  TextInput,
  Portal,
  Snackbar,
} from "react-native-paper";
import { useCategoryStore } from "../store/categoryStore";
import { Category } from "../services/categoryService";

const AVAILABLE_ICONS = [
  "food",
  "car",
  "home",
  "shopping-outline",
  "medical-bag",
  "airplane",
  "gamepad-variant",
  "coffee",
  "gift",
  "phone",
  "book",
  "currency-usd",
  "cart",
  "gas-station",
  "film",
  "dumbbell",
];

const AVAILABLE_COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#FFA07A",
  "#98D8C8",
  "#F7DC6F",
  "#BB8FCE",
  "#85C1E2",
  "#F8B88B",
  "#52B788",
];

interface CategoryFormData {
  name: string;
  icon: string;
  color: string;
  description: string;
}

const CategoryManagementScreen = () => {
  const {
    categories,
    isLoading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    clearError,
  } = useCategoryStore();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    icon: AVAILABLE_ICONS[0],
    color: AVAILABLE_COLORS[0],
    description: "",
  });
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (error) {
      showSnackbar(error);
      clearError();
    }
  }, [error]);

  const loadCategories = async () => {
    try {
      await fetchCategories();
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  };

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const openAddModal = () => {
    setEditingCategory(null);
    setFormData({
      name: "",
      icon: AVAILABLE_ICONS[0],
      color: AVAILABLE_COLORS[0],
      description: "",
    });
    setModalVisible(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      icon: category.icon || AVAILABLE_ICONS[0],
      color: category.color || AVAILABLE_COLORS[0],
      description: category.description || "",
    });
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingCategory(null);
    setFormData({
      name: "",
      icon: AVAILABLE_ICONS[0],
      color: AVAILABLE_COLORS[0],
      description: "",
    });
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      showSnackbar("Category name is required");
      return;
    }

    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, {
          name: formData.name.trim(),
          icon: formData.icon,
          color: formData.color,
          description: formData.description.trim() || undefined,
        });
        showSnackbar("Category updated successfully");
      } else {
        await createCategory({
          name: formData.name.trim(),
          icon: formData.icon,
          color: formData.color,
          description: formData.description.trim() || undefined,
        });
        showSnackbar("Category created successfully");
      }
      closeModal();
    } catch (err) {
      console.error("Failed to save category:", err);
    }
  };

  const handleDelete = (category: Category) => {
    Alert.alert(
      "Delete Category",
      `Are you sure you want to delete "${category.name}"? This will affect all associated budgets and transactions.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteCategory(category.id);
              showSnackbar("Category deleted successfully");
            } catch (err) {
              console.error("Failed to delete category:", err);
            }
          },
        },
      ]
    );
  };

  const renderCategoryItem = ({ item }: { item: Category }) => (
    <Card style={styles.categoryCard}>
      <Card.Content style={styles.categoryContent}>
        <View style={styles.categoryLeft}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: item.color || AVAILABLE_COLORS[0] },
            ]}
          >
            <IconButton
              icon={item.icon || "folder"}
              iconColor="white"
              size={24}
            />
          </View>
          <View style={styles.categoryInfo}>
            <Text variant="titleMedium" style={styles.categoryName}>
              {item.name}
            </Text>
            {item.description && (
              <Text variant="bodySmall" style={styles.categoryDescription}>
                {item.description}
              </Text>
            )}
          </View>
        </View>
        <View style={styles.categoryActions}>
          <IconButton
            icon="pencil"
            size={20}
            onPress={() => openEditModal(item)}
          />
          <IconButton
            icon="delete"
            size={20}
            onPress={() => handleDelete(item)}
          />
        </View>
      </Card.Content>
    </Card>
  );

  const renderIconSelector = () => (
    <View style={styles.selectorContainer}>
      <Text variant="titleSmall" style={styles.selectorTitle}>
        Select Icon
      </Text>
      <View style={styles.iconGrid}>
        {AVAILABLE_ICONS.map((icon) => (
          <IconButton
            key={icon}
            icon={icon}
            size={28}
            iconColor={formData.icon === icon ? formData.color : "#666"}
            containerColor={
              formData.icon === icon ? formData.color + "20" : "transparent"
            }
            onPress={() => setFormData({ ...formData, icon })}
          />
        ))}
      </View>
    </View>
  );

  const renderColorSelector = () => (
    <View style={styles.selectorContainer}>
      <Text variant="titleSmall" style={styles.selectorTitle}>
        Select Color
      </Text>
      <View style={styles.colorGrid}>
        {AVAILABLE_COLORS.map((color) => (
          <View
            key={color}
            style={[
              styles.colorOption,
              {
                backgroundColor: color,
                borderWidth: formData.color === color ? 3 : 0,
                borderColor: "#000",
              },
            ]}
            onTouchEnd={() => setFormData({ ...formData, color })}
          />
        ))}
      </View>
    </View>
  );

  return (
    <Surface style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Categories
        </Text>
        <Button
          mode="contained"
          icon="plus"
          onPress={openAddModal}
          style={styles.addButton}
        >
          Add Category
        </Button>
      </View>

      <FlatList
        data={categories}
        renderItem={renderCategoryItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={loadCategories} />
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <Text variant="bodyLarge" style={styles.emptyText}>
                No categories yet
              </Text>
              <Text variant="bodyMedium" style={styles.emptySubtext}>
                Create your first category to organize your budgets
              </Text>
            </View>
          ) : null
        }
      />

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={closeModal}
          animationType="slide"
          transparent={true}
        >
          <View style={styles.modalOverlay}>
            <Surface style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text variant="headlineSmall">
                  {editingCategory ? "Edit Category" : "New Category"}
                </Text>
                <IconButton icon="close" onPress={closeModal} />
              </View>

              <ScrollView style={styles.modalBody}>
                <TextInput
                  label="Category Name"
                  value={formData.name}
                  onChangeText={(text) =>
                    setFormData({ ...formData, name: text })
                  }
                  mode="outlined"
                  style={styles.input}
                  placeholder="e.g., Groceries, Transportation"
                />

                <TextInput
                  label="Description (Optional)"
                  value={formData.description}
                  onChangeText={(text) =>
                    setFormData({ ...formData, description: text })
                  }
                  mode="outlined"
                  multiline
                  numberOfLines={3}
                  style={styles.input}
                  placeholder="Brief description of this category"
                />

                {renderIconSelector()}
                {renderColorSelector()}

                <View style={styles.previewContainer}>
                  <Text variant="titleSmall" style={styles.selectorTitle}>
                    Preview
                  </Text>
                  <View style={styles.preview}>
                    <View
                      style={[
                        styles.previewIcon,
                        { backgroundColor: formData.color },
                      ]}
                    >
                      <IconButton
                        icon={formData.icon}
                        iconColor="white"
                        size={32}
                      />
                    </View>
                    <Text variant="titleLarge">{formData.name || "Category Name"}</Text>
                  </View>
                </View>
              </ScrollView>

              <View style={styles.modalFooter}>
                <Button mode="outlined" onPress={closeModal} style={styles.modalButton}>
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={handleSave}
                  style={styles.modalButton}
                  loading={isLoading}
                >
                  {editingCategory ? "Update" : "Create"}
                </Button>
              </View>
            </Surface>
          </View>
        </Modal>
      </Portal>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: "Dismiss",
          onPress: () => setSnackbarVisible(false),
        }}
      >
        {snackbarMessage}
      </Snackbar>
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "white",
    elevation: 2,
  },
  title: {
    fontWeight: "bold",
  },
  addButton: {
    borderRadius: 8,
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  categoryCard: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
  },
  categoryContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 8,
  },
  categoryLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    borderRadius: 12,
    marginRight: 12,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontWeight: "600",
  },
  categoryDescription: {
    color: "#666",
    marginTop: 4,
  },
  categoryActions: {
    flexDirection: "row",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    color: "#666",
    marginBottom: 8,
  },
  emptySubtext: {
    color: "#999",
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  modalBody: {
    padding: 16,
  },
  input: {
    marginBottom: 16,
  },
  selectorContainer: {
    marginBottom: 20,
  },
  selectorTitle: {
    fontWeight: "600",
    marginBottom: 12,
  },
  iconGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
  },
  colorOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    margin: 6,
  },
  previewContainer: {
    marginTop: 20,
  },
  preview: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
  },
  previewIcon: {
    borderRadius: 12,
    marginRight: 16,
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    gap: 12,
  },
  modalButton: {
    minWidth: 100,
  },
});

export default CategoryManagementScreen;
