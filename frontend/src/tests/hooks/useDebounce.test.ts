import {
  describe,
  expect,
  it,
  vi,
  beforeEach,
  afterEach,
} from 'vitest';

import {
  renderHook,
  act,
} from '@testing-library/react';

import { useDebounce } from '../../hooks/useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('should return the initial value immediately', () => {
    const { result } = renderHook(() =>
      useDebounce('GTA'),
    );

    expect(result.current).toBe('GTA');
  });

  it('should not update before the delay', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 400),
      {
        initialProps: {
          value: 'GTA',
        },
      },
    );

    rerender({
      value: 'Cyberpunk',
    });

    act(() => {
      vi.advanceTimersByTime(399);
    });

    expect(result.current).toBe('GTA');
  });

  it('should update after the delay', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 400),
      {
        initialProps: {
          value: 'GTA',
        },
      },
    );

    rerender({
      value: 'Cyberpunk',
    });

    act(() => {
      vi.advanceTimersByTime(400);
    });

    expect(result.current).toBe('Cyberpunk');
  });

  it('should restart the timer when the value changes', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 400),
      {
        initialProps: {
          value: '',
        },
      },
    );

    rerender({ value: 'C' });

    act(() => {
      vi.advanceTimersByTime(200);
    });

    rerender({ value: 'Cyberpunk' });

    act(() => {
      vi.advanceTimersByTime(399);
    });

    expect(result.current).toBe('');

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(result.current).toBe('Cyberpunk');
  });

  it('should support custom delays', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 1000),
      {
        initialProps: {
          value: 'GTA',
        },
      },
    );

    rerender({
      value: 'Battlefield',
    });

    act(() => {
      vi.advanceTimersByTime(999);
    });

    expect(result.current).toBe('GTA');

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(result.current).toBe('Battlefield');
  });

  it('should clear the timer when unmounted', () => {
    const { rerender, unmount } = renderHook(
      ({ value }) => useDebounce(value, 400),
      {
        initialProps: {
          value: '',
        },
      },
    );

    rerender({
      value: 'Cyberpunk',
    });

    expect(vi.getTimerCount()).toBe(1);

    unmount();

    expect(vi.getTimerCount()).toBe(0);
  });
});