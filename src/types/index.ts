// 초기 맛집의 숫자 ID와 새로 생성하는 UUID를 함께 지원합니다.
export type EntityId = number | string;

export interface Restaurant {
  id: EntityId;
  name: string;
  category: string;
  location: string;
  priceRange?: string;
  rating: number;
  description?: string;
  recommendedMenu: string[];
  likes: number;
  image?: string;
}

export type CreateRestaurantInput = Omit<Restaurant, 'id' | 'likes' | 'rating' | 'recommendedMenu'> & {
  rating?: number;
  recommendedMenu?: string[];
};

export type UpdateRestaurantInput = Partial<CreateRestaurantInput>;

export type SubmissionStatus = 'pending' | 'approved' | 'rejected';

export interface CreateSubmissionInput {
  restaurantName: string;
  category: string;
  location: string;
  priceRange?: string;
  recommendedMenu?: string[];
  review?: string;
  submitterName?: string;
  submitterEmail?: string;
}

export interface Submission extends CreateSubmissionInput {
  id: EntityId;
  status: SubmissionStatus;
}

export type UpdateSubmissionInput = Partial<Omit<Submission, 'id'>>;

export interface ApiResponse<T> {
  data: T;
}

// 폼의 메뉴 입력은 문자열이고, API에 전달할 때 문자열 배열로 변환합니다.
export interface RestaurantFormValues {
  name: string;
  category: string;
  location: string;
  priceRange: string;
  rating: string | number;
  description: string;
  recommendedMenu: string;
  image: string;
}

export interface SubmissionFormValues {
  restaurantName: string;
  category: string;
  location: string;
  priceRange: string;
  recommendedMenu: string;
  review: string;
  submitterName: string;
  submitterEmail: string;
}