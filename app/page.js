'use client'
import React, { useState, useEffect } from 'react';
import { auth, getCurrentUserName, getCurrentUserEmailName, db } from '@/components/firebase.config';
import { ref, get } from 'firebase/database';
import SignUpProfile from '@/components/authentication/SignUpProfile';
import '@/app/styles/home/home.css';
import Assessment from '@/components/authentication/Assessment';
import Statistic from '@/components/Statistic';
import Link from 'next/link';
import Image from 'next/image';
import Login from '@/components/authentication/Login';

const Page = () => {
  const [showSignUpProfile, setShowSignUpProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLoginClick = () => {
    setShowLogin(true);
  };

  const handleLoginClose = () => {
    setShowLogin(false);
  };

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

  const handleLogout = () => {
    auth.signOut();
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <main>
      <nav className='navbar'>
        <Link href="/" className="site-name">
          Medix<span> AI</span>
        </Link>
        {isLoggedIn ? (
          <div className="web-logout" onClick={handleLogout}>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '34px', height: '34px' }}>
              <path d="M15 20H18C19.1046 20 20 19.1046 20 18M15 4H18C19.1046 4 20 4.89543 20 6V14M7 8L3 12L15 12M7 16L6 15" 
                stroke="#000000" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </div>
        ) : (
          <div className="web-login" onClick={handleLoginClick}>Login</div>
        )}
      </nav>

      {showLogin && (
        <Login
          onClose={handleLoginClose}
          currentPath="/"
          onLoginSuccess={() => {
            // Handle successful login if needed
          }}
        />
      )}

      <div className="hero-section">
        <div className="hero-section-content">
          <h1 className='hero-section-title'>Our Healthcare Solutions Meet Every Need</h1>
          <p className='hero-section-description'>Unlock your best self with AI-powered health insights! Get a detailed health report and personalized tips to boost your well-being effortlessly.</p>
          <Link href="/check" className='hero-section-button'>Check Now</Link>
        </div>

        <div className="hero-section-img">
          <div className="hero-section-image">
            <div className="line-1"></div>
            <div className="line-2"></div>
            <div className="line-3">
              <div className="line-3-1"></div>
              <div className="line-3-2"></div>
            </div>
            <div className="line-1"></div>
          </div>
        </div>
      </div>
      <Statistic />
    </main>
  );
}

export default Page;
