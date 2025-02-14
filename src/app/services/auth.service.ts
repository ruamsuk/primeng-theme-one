import { inject, Injectable } from '@angular/core';
import {
  Auth,
  authState,
  createUserWithEmailAndPassword,
  IdTokenResult,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateEmail,
  updateProfile,
  User,
  user,
  UserCredential,
} from '@angular/fire/auth';
import { GoogleAuthProvider, UserInfo } from '@firebase/auth';
import { Router } from '@angular/router';
import { concatMap, from, Observable, of } from 'rxjs';
import { doc, docData, Firestore, getDoc, setDoc } from '@angular/fire/firestore';
import { toSignal } from '@angular/core/rxjs-interop';
import { ProfileUser } from '../models/profile-user.model';
import { HttpClient } from '@angular/common/http';

interface UserProfile {
  displayName: string | null;
  email: string | null;
  role: unknown;
  createdAt?: Date; //เพิ่มฟิลด์ createdAt ลงใน interface และการระบุว่า optional
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private fireAuth: Auth = inject(Auth);
  firestore: Firestore = inject(Firestore);
  private router: Router = inject(Router);
  private http = inject(HttpClient);
  private timeout: any;

  currentUser$: Observable<User | null> = authState(this.fireAuth);
  currentUser = toSignal<User | null>(this.currentUser$);

  constructor() {
    this.startTimer();
    this.getUserState().subscribe(user => {
      if (user) {
        this.resetTimer();
      }
    });
  }

  get userProfile$(): Observable<ProfileUser | null> {
    const user = this.fireAuth.currentUser;
    const ref = doc(this.firestore, 'users', `${user?.uid}`);
    if (ref) {
      return docData(ref) as Observable<ProfileUser | null>;
    } else {
      return of(null);
    }
  }

  getUserState(): Observable<any> {
    return user(this.fireAuth);
  }

  getTranslations(): Observable<any> {
    return this.http.get<any>('/assets/i18n/th.json');
  }

  startTimer() {
    this.timeout = setTimeout(
      () => {
        this.logout().then(() => {
          console.log('logout');
          this.router.navigateByUrl('/auth/login').then();
        });
      },
      30 * 60 * 1000,
    ); // 30 นาที
  }

  resetTimer() {
    clearTimeout(this.timeout);
    this.startTimer();
  }

  forgotPassword(email: string) {
    return from(sendPasswordResetEmail(this.fireAuth, email));
  }

  login(email: string, password: string): Observable<UserCredential> {
    return from(signInWithEmailAndPassword(this.fireAuth, email, password));
  }

  updateProfile(profileData: Partial<UserInfo>): Observable<any> {
    const user = this.fireAuth.currentUser;

    return of(user).pipe(
      concatMap((user) => {
        if (!user) throw new Error('Not Authenticated');
        return updateProfile(user, profileData);
      }),
    );
  }

  async logout(): Promise<void> {
    return await signOut(this.fireAuth).then(() => {
      localStorage.removeItem('user');
    });
  }

  async googleSignIn(): Promise<void> {
    const provider = new GoogleAuthProvider();
    const {user} = await signInWithPopup(this.fireAuth, provider);
    await this.saveUserToFirestore(user, '');
    await this.saveToLocal(user);
  }

  async newUser(user: any) {
    const currentUser = this.fireAuth.currentUser;

    if (currentUser) {
      const updateProfilePromise = updateProfile(currentUser, {
        displayName: user.displayName,
        photoURL: user.photoURL,
      });

      const updateEmailPromise = user.email ? await updateEmail(currentUser, user.email) : await Promise.resolve();

      return await Promise.all([updateProfilePromise, updateEmailPromise])
        .then(() => {
          const userRole = typeof user.role === 'object' && user.role !== null
            ? (user.role as { name: string; }).name
            : user.role;

          const fakeData = {
            uid: user.uid,
            displayName: user.displayName,
            email: user.email || currentUser.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            address: user.address,
            role: userRole,
          };

          const ref = doc(this.firestore, 'users', `${user.uid}`);
          return setDoc(ref, fakeData);
        })
        .catch(error => {
          if (error instanceof Error) {
            console.error('Error updating user profile:', error.message);
          }
          throw error;
        });
    } else {
      return Promise.reject(new Error('No authenticated user found'));
    }
  }

  /** Get From Firebase Auth */
  async getRoles() {
    const idTokenResult = await this.fireAuth.currentUser?.getIdTokenResult();
    return idTokenResult?.claims['role'];
  }

  /** Get From Firestore */
  async isAuth(): Promise<boolean> {
    const user = this.fireAuth.currentUser;
    if (user) {
      const role = await this.getUserRole();
      return role === 'admin' || role === 'manager';
    } else {
      return false;
    }
  }

  // async isAdmin(): Promise<boolean> {
  //   let idTokenResult = await this.getIdTokenResult();
  //   if (idTokenResult) {
  //     return (
  //       idTokenResult.claims['role'] === 'admin' ||
  //       idTokenResult.claims['role'] === 'manager'
  //     );
  //   } else {
  //     return false;
  //   }
  // }

  getIdTokenResult(): Promise<IdTokenResult> | any {
    return this.fireAuth.currentUser?.getIdTokenResult();
  }

  /** Get From Firestore */
  async getUserRole(): Promise<string | null> {
    // const userProfile = await this.getUserProfile(uid);
    // return userProfile ? userProfile['role'] : null;
    const user = this.fireAuth.currentUser;
    if (user) {
      const idTokenResult: IdTokenResult = await user.getIdTokenResult();
      return idTokenResult.claims['role'] as string || null;
    }
    return null;
  }

  async isAdmin(): Promise<boolean> {
    const role = await this.getUserRole();
    return role === 'admin';
  }

  /** Get from firestore */
  async getUserProfile(uid: string) {
    const userDocRef = doc(this.firestore, 'users', uid);
    const userDocSnapshot = await getDoc(userDocRef);

    if (userDocSnapshot.exists()) {
      const userData = userDocSnapshot.data();
      delete userData['createdAt'];

      return userData;
    } else {
      return null;
    }
  }

  async saveUserToFirestore(user: User, displayName: string): Promise<void> {
    const userRef = doc(this.firestore, 'users', user.uid);
    const userSnapShot = await getDoc(userRef);

    if (!userSnapShot.exists()) {
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || displayName,
        role: 'user',
        createdAt: new Date(),
      };
      await setDoc(userRef, userData);
    }
  }

  async saveToLocal(user: User) {
    const userProfile = await this.getUserProfile(user.uid) as UserProfile;

    if (userProfile) {
      const userData = {
        ...userProfile,
      };
      // delete userData.createdAt;
      // localStorage.setItem('user', JSON.stringify(userData));
    }
  }

  async signupWithDisplayName(email: string, password: string, displayName: string): Promise<void> {
    const userCredential = await createUserWithEmailAndPassword(this.fireAuth, email, password);
    await updateProfile(userCredential.user, {displayName});
    await this.saveUserToFirestore(userCredential.user, displayName);
    await this.sendEmailVerification();
    await this.logout().then(() => {
      this.router.navigateByUrl('/auth/login').then();
    }, error => {
      console.error(error);
    });
  }

  async sendEmailVerification(): Promise<void | undefined> {
    if (this.fireAuth.currentUser) {
      return await sendEmailVerification(<User>this.fireAuth.currentUser);
    }
  }
}
