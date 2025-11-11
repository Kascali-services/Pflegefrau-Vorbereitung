/**
 * Contact form interface - Represents a contact message from users
 */
export interface ContactMessage {
  name: string;
  email: string;
  message: string;
  isBusiness: boolean;
  address?: Address;
}

/**
 * Address interface - Represents address information for businesses
 */
export interface Address {
  street: string;
  houseNumber: string;
  city: string;
  postalCode: string; // PLZ (Postleitzahl)
}
