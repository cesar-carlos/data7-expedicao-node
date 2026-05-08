import { getFirestore } from 'firebase-admin/firestore';

export default abstract class FirebaseBaseRepository {
  protected readonly db = getFirestore();
}
