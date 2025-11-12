import { useEffect, useRef } from 'react'
import API from '../services/api'

// Note: requires 'html5-qrcode' npm package in frontend
export default function QRScan() {
  const divRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    let Html5Qrcode: any
    let scanner: any
    async function start() {
      const mod = await import('html5-qrcode')
      Html5Qrcode = mod.Html5Qrcode
      if (!divRef.current) return
      scanner = new Html5Qrcode(divRef.current.id)
      const config = { fps: 10, qrbox: 250 }
      scanner.start({ facingMode: 'environment' }, config, async (decodedText: string) => {
        try {
          // send decodedText as token to API
          const res = await API.post('/asistencias/scan', { token: decodedText })
          alert('Asistencia registrada: ' + JSON.stringify(res.data))
        } catch (e: any) {
          alert('Error al registrar: ' + (e?.response?.data?.message || e.message))
        }
      }, (err: any) => {
        console.debug('scan error', err)
      })
    }
    start()

    return () => {
      try { scanner && scanner.stop(); } catch (e) { }
    }
  }, [])

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold mb-4">Escáner QR - Registrar Asistencia</h2>
      <div id="qr-reader" ref={divRef} style={{ width: '100%' }} />
      <p className="text-sm text-gray-600 mt-2">Apunta la cámara al código QR provisto por el docente.</p>
    </div>
  )
}
