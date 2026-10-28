import { useState, type FormEvent } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { restaurantAPI } from '../services/api';

function AdminPage() {
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);

  const { data, isPending, error } = useQuery({
    queryKey: ['restaurants'],
    queryFn: () => restaurantAPI.getRestaurants(),
  });

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    const text = (key: string) => String(values.get(key) ?? '').trim();

    const name = text('name');
    const category = text('category');
    const location = text('location');

    if (!name || !category || !location) {
      toast.error('이름, 카테고리, 위치를 입력해 주세요.');
      return;
    }

    setSaving(true);

    try {
      await restaurantAPI.createRestaurant({
        name,
        category,
        location,
        priceRange: text('priceRange'),
        rating: Number(text('rating') || 0),
        description: text('description'),
        recommendedMenu: text('recommendedMenu')
          .split(/[\n,]/)
          .map((item) => item.trim())
          .filter(Boolean),
      });

      form.reset();
      await queryClient.invalidateQueries();
      toast.success('맛집을 등록했습니다.');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : '등록에 실패했습니다.',
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
      <h2>맛집 관리</h2>
      <p>등록한 맛집은 서버 재시작 시 초기 데이터로 돌아갑니다.</p>

      <form
        onSubmit={onSubmit}
        style={{ display: 'grid', gap: 12, margin: '24px 0' }}
      >
        <label>
          맛집 이름 *
          <input name="name" required />
        </label>

        <label>
          카테고리 *
          <select name="category" required defaultValue="">
            <option value="" disabled>선택하세요</option>
            {['한식', '중식', '일식', '양식', '아시안', '분식', '카페', '기타']
              .map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
          </select>
        </label>

        <label>
          위치 *
          <input name="location" required />
        </label>

        <label>
          가격대
          <input name="priceRange" placeholder="8,000-12,000원" />
        </label>

        <label>
          평점
          <input
            name="rating"
            type="number"
            min="0"
            max="5"
            step="0.01"
            defaultValue="0"
          />
        </label>

        <label>
          추천 메뉴
          <input name="recommendedMenu" placeholder="김밥, 라면" />
        </label>

        <label>
          설명
          <textarea name="description" />
        </label>

        <button type="submit" disabled={saving}>
          {saving ? '등록 중...' : '맛집 등록'}
        </button>
      </form>

      <h3>등록된 맛집</h3>
      {isPending && <p>불러오는 중...</p>}
      {error && <p role="alert">목록 조회 실패: {error.message}</p>}

      <ul>
        {data?.data.map((restaurant) => (
          <li key={restaurant.id} style={{ marginBottom: 16 }}>
            <strong>{restaurant.name}</strong> · {restaurant.category}
            {' '}
            <button
              disabled
              title="이번 주 서버는 수정 API를 제공하지 않습니다."
            >
              수정
            </button>
            {' '}
            <button
              disabled
              title="이번 주 서버는 삭제 API를 제공하지 않습니다."
            >
              삭제
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default AdminPage;