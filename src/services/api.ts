import axios from 'axios';
import type {
  ApiResponse,
  CreateRestaurantInput,
  EntityId,
  Restaurant,
} from '../types';
import { restaurantAPI as localRestaurantAPI } from './api.local';

export { submissionAPI } from './api.local';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.trim();
const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
});

function requireApiUrl(): void {
  if (!API_BASE_URL) {
    throw new Error(
      'VITE_API_BASE_URL을 설정한 뒤 개발 서버 재시작 또는 재배포가 필요합니다.',
    );
  }
}

async function getData<T>(url: string): Promise<ApiResponse<T>> {
  requireApiUrl();
  const response = await http.get<ApiResponse<T>>(url);
  return response.data;
}

const updateRestaurant: typeof localRestaurantAPI.updateRestaurant =
  async () => {
    throw new Error('이번 주 서버는 맛집 수정 API를 제공하지 않습니다.');
  };

const deleteRestaurant: typeof localRestaurantAPI.deleteRestaurant =
  async () => {
    throw new Error('이번 주 서버는 맛집 삭제 API를 제공하지 않습니다.');
  };

export const restaurantAPI = {
  ...localRestaurantAPI,

  getRestaurants: (): Promise<ApiResponse<Restaurant[]>> =>
    getData('/api/restaurants'),

  getRestaurantById: (id: EntityId): Promise<ApiResponse<Restaurant>> =>
    getData(`/api/restaurants/${encodeURIComponent(String(id))}`),

  getPopularRestaurants: (): Promise<ApiResponse<Restaurant[]>> =>
    getData('/api/restaurants/popular'),

  createRestaurant: async (
    payload: CreateRestaurantInput,
  ): Promise<ApiResponse<Restaurant>> => {
    requireApiUrl();
    const response = await http.post<ApiResponse<Restaurant>>(
      '/api/restaurants',
      payload,
    );
    return response.data;
  },

  updateRestaurant,
  deleteRestaurant,
};

export default restaurantAPI;