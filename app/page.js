'use client'
import React, { useState, useEffect } from 'react';
import { auth, getCurrentUserName, getCurrentUserEmailName, db } from '@/components/firebase.config';
import { ref, get } from 'firebase/database';
import SignUpProfile from '@/components/authentication/SignUpProfile';
import '@/app/styles/home/home.css';
import Assessment from '@/components/authentication/Assessment';
import Statistic from '@/components/Statistic';
const Page = () => {
  const [showSignUpProfile, setShowSignUpProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');

  useEffect(() => {
    const checkUsername = async () => {
      if (auth.currentUser) {
        try {
          const uid = auth.currentUser.uid;
          const usernameRef = ref(db, `usernames/${uid}/username`);
          const snapshot = await get(usernameRef);
        } catch (error) {
          console.error('Error checking username:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        checkUsername();
        const displayName = user.displayName;
        const email = user.email;
        if (displayName) {
          setUsername(displayName);
        } else if (email) {
          const emailName = getCurrentUserEmailName();
          setUsername(emailName.split('.')[0]);
        } else {
          setUsername('null');
        }
      } else {
        setUsername('null');
        setLoading(false);
        setShowSignUpProfile(false);
      }
    });

    return () => {
      unsubscribe();
      // Cleanup any remaining containers on unmount
      const container = document.getElementById('signup-profile-container');
      if (container) {
        container.remove();
      }
    };
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <main>
      <Statistic />
    </main>
  );
}

export default Page;
