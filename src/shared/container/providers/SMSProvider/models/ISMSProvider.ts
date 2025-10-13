export interface ISMSProvider {
  sendSMS(to: string, message: string): Promise<boolean>;
}
