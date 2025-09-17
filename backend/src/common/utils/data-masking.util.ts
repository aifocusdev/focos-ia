export class DataMaskingUtil {
  private static readonly DEFAULT_PHONE_DIGITS = 4;
  private static readonly DEFAULT_EXTERNAL_ID_DIGITS = 6;

  static maskPhoneNumber(
    phoneNumber: string,
    lastDigits = DataMaskingUtil.DEFAULT_PHONE_DIGITS,
  ): string {
    if (!phoneNumber || typeof phoneNumber !== 'string') {
      return phoneNumber;
    }

    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (cleanPhone.length <= lastDigits) {
      return phoneNumber;
    }

    return cleanPhone.slice(-lastDigits);
  }

  static maskExternalId(
    externalId: string,
    lastDigits = DataMaskingUtil.DEFAULT_EXTERNAL_ID_DIGITS,
  ): string {
    if (!externalId || typeof externalId !== 'string') {
      return externalId;
    }

    if (externalId.length <= lastDigits) {
      return externalId;
    }

    return externalId.slice(-lastDigits);
  }

  static maskContactData(data: any): any {
    if (!data || typeof data !== 'object') {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map((item) => DataMaskingUtil.maskContactData(item));
    }

    const maskedData = { ...data };

    if (
      maskedData.phone_number &&
      typeof maskedData.phone_number === 'string'
    ) {
      maskedData.phone_number = DataMaskingUtil.maskPhoneNumber(
        maskedData.phone_number,
      );
    }

    if (maskedData.external_id && typeof maskedData.external_id === 'string') {
      maskedData.external_id = DataMaskingUtil.maskExternalId(
        maskedData.external_id,
      );
    }

    for (const key in maskedData) {
      if (typeof maskedData[key] === 'object' && maskedData[key] !== null) {
        maskedData[key] = DataMaskingUtil.maskContactData(maskedData[key]);
      }
    }

    return maskedData;
  }
}
