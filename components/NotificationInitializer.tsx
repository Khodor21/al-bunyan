'use client'

import { useEffect, useState, useCallback } from 'react'
import { getToken } from 'firebase/messaging'
import { getFirebaseMessaging } from '../lib/firebase'

// ─── Platform Detection ────────────────────────────────────────────────────

const isIOS = (): boolean =>
  /iphone|ipad|ipod/i.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)

const isInStandaloneMode = (): boolean =>
  'standalone' in navigator && (navigator as { standalone?: boolean }).standalone === true

// ─── i18n ─────────────────────────────────────────────────────────────────

type Lang = 'ar' | 'en'

const t = (lang: Lang, key: string): string => {
  const strings: Record<string, Record<Lang, string>> = {
    installTitle:      { en: 'Add to Home Screen',                                        ar: 'أضف إلى الشاشة الرئيسية' },
    installBody:       { en: 'Install this app for the best experience: tap the Share button below, then choose "Add to Home Screen".', ar: 'ثبّت التطبيق للحصول على أفضل تجربة: اضغط على زر المشاركة أدناه ثم اختر "إضافة إلى الشاشة الرئيسية".' },
    installDismiss:    { en: 'Maybe Later',                                               ar: 'ربما لاحقاً' },
    notifyTitle:       { en: 'Stay in the Loop',                                         ar: 'ابقَ على اطلاع' },
    notifyBody:        { en: 'Enable notifications to receive important updates even when the app is closed.', ar: 'فعّل الإشعارات لتصلك التحديثات المهمة حتى عند إغلاق التطبيق.' },
    notifyEnable:      { en: 'Enable Notifications',                                     ar: 'تفعيل الإشعارات' },
    notifyDismiss:     { en: 'Dismiss',                                                   ar: 'تجاهل' },
  }
  return strings[key]?.[lang] ?? strings[key]?.en ?? key
}

// ─── Types ─────────────────────────────────────────────────────────────────

type ModalState = 'none' | 'show-install' | 'show-notify' | 'show-android-prompt'

interface AuthStatus {
  authenticated: boolean
  userId: string | null
}

// ─── Component ─────────────────────────────────────────────────────────────

export default function NotificationInitializer() {
  const [modal, setModal]         = useState<ModalState>('none')
  const [userId, setUserId]       = useState<string | null>(null)
  const [lang, setLang]           = useState<Lang>('en')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError]         = useState<string | null>(null)

  useEffect(() => {
    const docLang = document.documentElement.lang
    setLang(docLang.startsWith('ar') ? 'ar' : 'en')
  }, [])

  useEffect(() => {
    let cancelled = false

    const init = async () => {
      try {
        const res  = await fetch('/api/auth-status')
        const data: AuthStatus = await res.json()

        if (cancelled) return

        if (!data.authenticated || !data.userId) return

        setUserId(data.userId)

        // If user already registered push, skip all modals
        if (localStorage.getItem(`push_reg_${data.userId}`) === 'true') return

        const timer = setTimeout(() => {
          if (cancelled) return

          if (isIOS()) {
            setModal(isInStandaloneMode() ? 'show-notify' : 'show-install')
          } else {
            setModal('show-android-prompt')
          }
        }, 1500)

        return () => clearTimeout(timer)
      } catch (err) {
        console.error('[NotificationInitializer] Failed to fetch auth status:', err)
      }
    }

    const cleanup = init()
    return () => {
      cancelled = true
      cleanup?.then((fn) => fn?.())
    }
  }, [])

  const dismiss = useCallback(() => {
    if (userId) {
      localStorage.setItem(`push_reg_${userId}`, 'true')
    }
    setModal('none')
  }, [userId])

  // Must be called directly from a user gesture (button click)
  const registerPush = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      if (!('Notification' in window)) {
        setError('Notifications are not supported in this browser.')
        setIsLoading(false)
        return
      }

      if (!('serviceWorker' in navigator)) {
        setError('Service Workers are not supported in this browser.')
        setIsLoading(false)
        return
      }

      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        setIsLoading(false)
        dismiss()
        return
      }

      const reg = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
        scope: '/',
        updateViaCache: 'none',
      })

      await reg.update()

      const messaging = await getFirebaseMessaging()
      if (!messaging) {
        console.error('[NotificationInitializer] Firebase Messaging not available.')
        setIsLoading(false)
        dismiss()
        return
      }

      const token = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
        serviceWorkerRegistration: reg,
      })

      if (!token) {
        setError('Failed to get push token. Please try again.')
        setIsLoading(false)
        return
      }

      const saveRes = await fetch('/api/notifications/register-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, userId }),
      })

      if (!saveRes.ok) {
        throw new Error(`Server error: ${saveRes.status}`)
      }

      if (userId) {
        localStorage.setItem(`push_reg_${userId}`, 'true')
      }

      setModal('none')
    } catch (err) {
      console.error('[NotificationInitializer] Push registration failed:', err)
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [userId, dismiss])

  if (modal === 'none') return null

  const isRTL = lang === 'ar'

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="fixed inset-0 z-40" onClick={dismiss} aria-hidden="true" />

      <div className="relative z-50 w-full max-w-sm rounded-2xl shadow-xl p-6 flex flex-col gap-4"
           style={{ backgroundColor: 'var(--color-cream)', color: 'var(--color-darkest)' }}>

        {/* ── iOS Install Prompt ── */}
        {modal === 'show-install' && (
          <>
            <div className="text-4xl text-center">📲</div>
            <h2 className="text-xl text-center" style={{ fontFamily: 'var(--font-serif-bold)' }}>
              {t(lang, 'installTitle')}
            </h2>
            <p className="text-sm text-center leading-relaxed" style={{ fontFamily: 'var(--font-sans-light)' }}>
              {t(lang, 'installBody')}
            </p>
            <div className="flex justify-center">
              <span
                className="text-3xl animate-bounce"
                style={{ display: 'inline-block' }}
                aria-label="Share button arrow"
              >
                ⬆️
              </span>
            </div>
            <button
              onClick={dismiss}
              className="mt-2 w-full py-2.5 rounded-xl text-sm transition-opacity hover:opacity-70"
              style={{
                fontFamily: 'var(--font-sans-medium)',
                backgroundColor: 'var(--color-forest)',
                color: 'var(--color-cream)',
              }}
            >
              {t(lang, 'installDismiss')}
            </button>
          </>
        )}

        {/* ── iOS PWA Notify / Android Notify Prompt ── */}
        {(modal === 'show-notify' || modal === 'show-android-prompt') && (
          <>
            <div className="text-4xl text-center">🔔</div>
            <h2 className="text-xl text-center" style={{ fontFamily: 'var(--font-serif-bold)' }}>
              {t(lang, 'notifyTitle')}
            </h2>
            <p className="text-sm text-center leading-relaxed" style={{ fontFamily: 'var(--font-sans-light)' }}>
              {t(lang, 'notifyBody')}
            </p>

            {error && (
              <p className="text-xs text-center text-red-600">{error}</p>
            )}

            <div className="flex flex-col gap-2 mt-2">
              <button
                onClick={registerPush}
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl text-sm transition-opacity hover:opacity-80 disabled:opacity-50"
                style={{
                  fontFamily: 'var(--font-sans-bold)',
                  backgroundColor: 'var(--color-darkest)',
                  color: 'var(--color-cream)',
                }}
              >
                {isLoading ? '…' : t(lang, 'notifyEnable')}
              </button>
              <button
                onClick={dismiss}
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl text-sm transition-opacity hover:opacity-70 disabled:opacity-50"
                style={{
                  fontFamily: 'var(--font-sans-medium)',
                  backgroundColor: 'transparent',
                  color: 'var(--color-forest)',
                  border: '1.5px solid var(--color-forest)',
                }}
              >
                {t(lang, 'notifyDismiss')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
