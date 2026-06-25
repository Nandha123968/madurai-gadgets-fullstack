import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { 
  initializeFirestore, 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  writeBatch,
  getDoc,
  query,
  limit,
  getDocFromServer,
  setLogLevel
} from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";
import { Product, Order } from "../types";

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Services
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, (firebaseConfig as any).firestoreDatabaseId);

setLogLevel("error");

export const auth = getAuth(app);

// Authentication Provider
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Validate Connection to Firestore (Skill Mandate)
 */
export async function testConnection() {
  try {
    // Testing connection to a temporary connection document
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firebase connection verified successfully!");
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Please check your Firebase configuration or internet connection. App is running offline.");
    } else {
      console.warn("Connection test completed with expected results.");
    }
  }
}

// Trigger connection test on startup
testConnection();

// Google Auth utilities
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Failed to sign in with Google:", error);
    throw error;
  }
}

export async function signOutUser() {
  try {
    await auth.signOut();
  } catch (error) {
    console.error("Failed to sign out:", error);
    throw error;
  }
}

/**
 * Database Synchronization & Operations
 */

// Products collection operations
const PRODUCTS_COL = "products";

export async function fetchProductsFromFirebase(): Promise<Product[]> {
  try {
    const q = collection(db, PRODUCTS_COL);
    const snap = await getDocs(q);
    const list: Product[] = [];
    snap.forEach((d) => {
      list.push(d.data() as Product);
    });
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, PRODUCTS_COL);
    return [];
  }
}

export async function saveProductToFirebase(product: Product): Promise<void> {
  const path = `${PRODUCTS_COL}/${product.id}`;
  try {
    await setDoc(doc(db, PRODUCTS_COL, product.id), product);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteProductFromFirebase(productId: string): Promise<void> {
  const path = `${PRODUCTS_COL}/${productId}`;
  try {
    await deleteDoc(doc(db, PRODUCTS_COL, productId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Seed initial products to Firestore in small chunks to prevent quota/rate limits
export async function seedProductsToFirebase(products: Product[]): Promise<void> {
  try {
    // Check if we already have seeded items
    const testQ = query(collection(db, PRODUCTS_COL), limit(1));
    const testSnap = await getDocs(testQ);
    if (!testSnap.empty) {
      console.log("Products are already seeded in Firestore.");
      return;
    }

    console.log(`Seeding ${products.length} products to Firestore...`);
    // Seed in batches of 10 to keep within bounds
    const batchSize = 10;
    for (let i = 0; i < products.length; i += batchSize) {
      const chunk = products.slice(i, i + batchSize);
      const batch = writeBatch(db);
      chunk.forEach((p) => {
        const docRef = doc(db, PRODUCTS_COL, p.id);
        batch.set(docRef, p);
      });
      await batch.commit();
    }
    console.log("Successfully seeded catalog to Firestore!");
  } catch (error) {
    console.error("Error seeding products:", error);
    // Silent fail so it doesn't break startup if rules deny initial seeding
  }
}

// Orders collection operations
const ORDERS_COL = "orders";

export async function fetchOrdersFromFirebase(): Promise<Order[]> {
  try {
    const q = collection(db, ORDERS_COL);
    const snap = await getDocs(q);
    const list: Order[] = [];
    snap.forEach((d) => {
      list.push(d.data() as Order);
    });
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, ORDERS_COL);
    return [];
  }
}

export async function saveOrderToFirebase(order: Order): Promise<void> {
  const path = `${ORDERS_COL}/${order.id}`;
  try {
    await setDoc(doc(db, ORDERS_COL, order.id), order);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function updateOrderInFirebase(orderId: string, updates: Partial<Order>): Promise<void> {
  const path = `${ORDERS_COL}/${orderId}`;
  try {
    await updateDoc(doc(db, ORDERS_COL, orderId), updates as any);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteOrderFromFirebase(orderId: string): Promise<void> {
  const path = `${ORDERS_COL}/${orderId}`;
  try {
    await deleteDoc(doc(db, ORDERS_COL, orderId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
