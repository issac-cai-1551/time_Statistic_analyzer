import apiClient from './client';

export interface Category {
  id: number;
  key: string;
  name: string;
  color?: string;
  is_active: boolean;
}

export interface CategoryCreate {
  key: string;
  name: string;
  color?: string;
  is_active?: boolean;
}

export interface CategoryUpdate {
  name?: string;
  color?: string;
  is_active?: boolean;
}

export const getCategories = async (activeOnly: boolean = true): Promise<Category[]> => {
  const response = await apiClient.get<Category[]>('/categories/', {
    params: { active_only: activeOnly },
  });
  return response.data;
};

export const createCategory = async (data: CategoryCreate): Promise<Category> => {
  const response = await apiClient.post<Category>('/categories/', data);
  return response.data;
};

export const updateCategory = async (id: number, data: CategoryUpdate): Promise<Category> => {
  const response = await apiClient.put<Category>(`/categories/${id}`, data);
  return response.data;
};

export const deleteCategory = async (id: number): Promise<void> => {
  await apiClient.delete(`/categories/${id}`);
};
