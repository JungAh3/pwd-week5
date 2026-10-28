import { useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { restaurantAPI, submissionAPI } from '../services/api';
import type { EntityId, Submission } from '../types';

function SubmissionsPage() {
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);

  // 등록 성공 후 상태 저장만 실패하면 같은 화면에서 중복 등록을 막습니다.
  const createdIds = useRef(new Set<EntityId>());

  const { data, isPending, error } = useQuery({
    queryKey: ['submissions'],
    queryFn: () => submissionAPI.listSubmissions(),
    staleTime: 0,
  });

  async function approve(submission: Submission) {
    setBusy(true);

    try {
      if (!createdIds.current.has(submission.id)) {
        await restaurantAPI.createRestaurant({
          name: submission.restaurantName,
          category: submission.category,
          location: submission.location,
          priceRange: submission.priceRange,
          recommendedMenu: submission.recommendedMenu ?? [],
          description: submission.review,
          rating: 0,
        });

        createdIds.current.add(submission.id);
      }

      await submissionAPI.updateSubmission(submission.id, {
        status: 'approved',
      });

      await queryClient.invalidateQueries();
      toast.success('제보를 승인하고 맛집을 등록했습니다.');
    } catch (error) {
      if (createdIds.current.has(submission.id)) {
        toast.error(
          '맛집은 등록됐지만 승인 상태 저장에 실패했습니다. 새로고침하지 말고 승인을 다시 눌러 주세요.',
        );
      } else {
        toast.error(
          error instanceof Error ? error.message : '승인에 실패했습니다.',
        );
      }
    } finally {
      setBusy(false);
    }
  }

  async function reject(id: EntityId) {
    setBusy(true);

    try {
      await submissionAPI.updateSubmission(id, { status: 'rejected' });
      await queryClient.invalidateQueries({ queryKey: ['submissions'] });
      toast.success('제보를 반려했습니다.');
    } catch {
      toast.error('반려 상태 저장에 실패했습니다.');
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: EntityId) {
    if (!window.confirm('이 제보를 삭제하시겠습니까?')) return;
    setBusy(true);

    try {
      await submissionAPI.deleteSubmission(id);
      await queryClient.invalidateQueries({ queryKey: ['submissions'] });
      toast.success('제보를 삭제했습니다.');
    } catch {
      toast.error('제보 삭제에 실패했습니다.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
      <h2>제보 관리</h2>
      <p>이 브라우저에 저장된 제보만 표시됩니다.</p>
      <p>승인하면 Render 서버에 맛집이 등록됩니다.</p>

      {isPending && <p>불러오는 중...</p>}
      {error && <p role="alert">제보 조회 실패: {error.message}</p>}
      {data?.data.length === 0 && <p>아직 제보가 없습니다.</p>}

      {data?.data.map((submission) => (
        <article
          key={submission.id}
          style={{
            background: 'white',
            padding: 20,
            marginTop: 16,
            borderRadius: 12,
          }}
        >
          <h3>{submission.restaurantName}</h3>
          <p>{submission.category} · {submission.location}</p>
          <p>{submission.review}</p>
          <p>
            상태: {{
              pending: '대기',
              approved: '승인',
              rejected: '반려',
            }[submission.status]}
          </p>

          <div style={{ display: 'flex', gap: 12 }}>
            <button
              disabled={busy || submission.status !== 'pending'}
              onClick={() => approve(submission)}
            >
              승인 및 맛집 등록
            </button>

            <button
              disabled={
                busy ||
                submission.status !== 'pending' ||
                createdIds.current.has(submission.id)
              }
              onClick={() => reject(submission.id)}
            >
              반려
            </button>

            <button disabled={busy} onClick={() => remove(submission.id)}>
              제보 삭제
            </button>
          </div>
        </article>
      ))}
    </section>
  );
}

export default SubmissionsPage;