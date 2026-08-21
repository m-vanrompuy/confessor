// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import { useApiRequest } from './useApiRequest'

describe('useApiRequest', () => {
  it('start met lege state', () => {
    const request = vi.fn().mockResolvedValue('resultaat')
    const { result } = renderHook(() => useApiRequest(request))

    expect(result.current.data).toBeNull()
    expect(result.current.error).toBeNull()
    expect(result.current.loading).toBe(false)
  })

  it('zet loading tijdens de call en data erna', async () => {
    const request = vi.fn().mockResolvedValue('resultaat')
    const { result } = renderHook(() => useApiRequest(request))

    act(() => {
      void result.current.run('arg')
    })

    expect(result.current.loading).toBe(true)

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.data).toBe('resultaat')
    expect(result.current.error).toBeNull()
    expect(request).toHaveBeenCalledWith('arg')
  })

  it('zet error i.p.v. data als de call mislukt', async () => {
    const request = vi.fn().mockRejectedValue(new Error('kapot'))
    const { result } = renderHook(() => useApiRequest(request))

    await act(async () => {
      await result.current.run()
    })

    expect(result.current.data).toBeNull()
    expect(result.current.error?.message).toBe('kapot')
    expect(result.current.loading).toBe(false)
  })

  it('reset de vorige fout bij een nieuwe, succesvolle run', async () => {
    const request = vi
      .fn()
      .mockRejectedValueOnce(new Error('eerste fout'))
      .mockResolvedValueOnce('oke')
    const { result } = renderHook(() => useApiRequest(request))

    await act(async () => {
      await result.current.run()
    })
    expect(result.current.error?.message).toBe('eerste fout')

    await act(async () => {
      await result.current.run()
    })
    expect(result.current.error).toBeNull()
    expect(result.current.data).toBe('oke')
  })
})
