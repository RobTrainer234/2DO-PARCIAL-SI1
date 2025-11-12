// Declaración mínima para el paquete 'html5-qrcode' que no trae tipos oficiales
declare module 'html5-qrcode' {
  export class Html5Qrcode {
    constructor(elementId: string)
    start(cameraConfigOrId: any, config?: any, qrCodeSuccessCallback?: (decodedText: string) => void, qrCodeErrorCallback?: (errorMessage: any) => void): Promise<void>
    stop(): Promise<void>
    clear(): Promise<void>
    static getCameras?(): Promise<any[]>
  }
  export default Html5Qrcode
}
