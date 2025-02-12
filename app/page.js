'use client'
import React, { useState, useEffect } from 'react';
import { auth, getCurrentUserName, getCurrentUserEmailName, db } from '@/components/firebase.config';
import { ref, get } from 'firebase/database';
import SignUpProfile from '@/components/authentication/SignUpProfile';
import '@/app/styles/home/home.css';
import Assessment from '@/components/authentication/Assessment';
import Link from 'next/link';
import Image from 'next/image';
import Login from '@/components/authentication/Login';
import Services from '@/components/Services';
import Footer from '@/components/Footer';
import ModernFAQ from '@/components/ModernFAQ';

const Page = () => {
  const [showSignUpProfile, setShowSignUpProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasSavedReports, setHasSavedReports] = useState(false);

  useEffect(() => {
    const checkUsername = async () => {
      if (auth.currentUser) {
        try {
          const uid = auth.currentUser.uid;
          const usernameRef = ref(db, `usernames/${uid}/username`);
          const snapshot = await get(usernameRef);
          setLoading(false); // Set loading to false after username check
        } catch (error) {
          console.error('Error checking username:', error);
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    // Separate effect for checking reports
    const checkReports = async () => {
      if (auth.currentUser) {
        try {
          const uid = auth.currentUser.uid;
          const reportsRef = ref(db, `users/${uid}/reports`);
          const reportsSnapshot = await get(reportsRef);
          setHasSavedReports(reportsSnapshot.exists() && Object.keys(reportsSnapshot.val()).length > 0);
        } catch (error) {
          console.error('Error checking reports:', error);
        }
      }
    };

    // Add timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      setLoading(false);
    }, 3000); // 3 seconds maximum loading time

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        checkUsername();
        checkReports(); // Check reports after auth
        setIsLoggedIn(true);
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
        setIsLoggedIn(false);
        setHasSavedReports(false);
      }
    });

    return () => {
      unsubscribe();
      clearTimeout(loadingTimeout); // Clear timeout on cleanup
      const container = document.getElementById('signup-profile-container');
      if (container) {
        container.remove();
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="report-loading">
        <div className="report-loading-spinner"></div>
        <p>Medix AI</p>
      </div>
    );
  }

  return (
    <main>
      

      <div className="hero-section">
        <div className="hero-section-content">
          <h1 className='hero-section-title'>Our Healthcare Solutions Meet Every Need</h1>
          <p className='hero-section-description'>Unlock your best self with AI-powered health insights! Get a detailed health report and personalized tips to boost your well-being effortlessly.</p>
          <div className="link-btns flex gap-4">
          <Link href="/check" className='hero-section-button'>Check Now</Link>
          {hasSavedReports && (
            <Link href="/report" className='hero-section-button sr-btn'>Saved Reports</Link>
          )}
          </div>
        </div>

        <div className="hero-section-img">
          <Image src="/hero.png" alt="hero-section-img" width={800} height={800} />
        </div>
      </div>

      <Services />
      <ModernFAQ />
      <Footer />
    </main>
  );
}

export default Page;
