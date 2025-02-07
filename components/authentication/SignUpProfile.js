import React, { useState, useRef, useEffect } from "react";
import "@/app/styles/authentication/signUpProfile.css";
import { ref, get, set, update } from "firebase/database";
import { db, auth } from "@/components/firebase.config";

const SignUpProfile = ({ onClose }) => {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [nameError, setNameError] = useState(false);
  const [usernameError, setUsernameError] = useState(false);
  const [validUsername, setValidUsername] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [showUsernameStatus, setShowUsernameStatus] = useState(false);
  const usernameTimeoutRef = useRef(null);
  const nameInputRef = useRef(null);
  const usernameInputRef = useRef(null);

  const checkUsernameAvailability = async (value) => {
    if (!value || value.length < 3) {
      setValidUsername(false);
      setShowUsernameStatus(true);
      console.log(`Username '${value}' status: Invalid - Too short or empty`);
      return;
    }

    setCheckingUsername(true);
    console.log(`Checking username '${value}'...`);

    try {
      const reservedRef = ref(db, "reservedUsernames");
      const reservedSnapshot = await get(reservedRef);

      if (reservedSnapshot.exists()) {
        const reservedUsernames = reservedSnapshot.val();
        console.log("Reserved usernames:", reservedUsernames);

        const isReserved =
          Array.isArray(reservedUsernames) &&
          reservedUsernames
            .map((name) => name.toLowerCase())
            .includes(value.toLowerCase());

        if (isReserved) {
          setValidUsername(false);
          setShowUsernameStatus(true);
          console.log(
            `Username '${value}' status: Invalid - Reserved username`
          );
          setCheckingUsername(false);
          return;
        }
      }

      const usernamesRef = ref(db, "usernames");
      const usernamesSnapshot = await get(usernamesRef);

      if (usernamesSnapshot.exists()) {
        const usernames = usernamesSnapshot.val();
        console.log("Existing usernames:", usernames);

        const isTaken = Object.values(usernames).some(
          (userData) =>
            userData &&
            userData.username &&
            userData.username.toLowerCase() === value.toLowerCase()
        );

        if (isTaken) {
          setValidUsername(false);
          setShowUsernameStatus(true);
          console.log(`Username '${value}' status: Invalid - Already taken`);
          setCheckingUsername(false);
          return;
        }
      }

      setValidUsername(true);
      setShowUsernameStatus(true);
      console.log(`Username '${value}' status: Valid - Available`);
    } catch (error) {
      console.error("Error checking username:", error);
      setValidUsername(false);
      setShowUsernameStatus(true);
    }

    setCheckingUsername(false);
  };

  const handleUsernameChange = (e) => {
    const value = e.target.value;

    if (value.includes(" ")) {
      const usernameInput = usernameInputRef.current;
      usernameInput.classList.add("shake");
      setShowUsernameStatus(false);

      setTimeout(() => {
        usernameInput.classList.remove("shake");
        setShowUsernameStatus(true);
      }, 600);

      setUsername(value.replace(/\s/g, ""));
      return;
    }

    setUsername(value);
    setShowUsernameStatus(false);
    setValidUsername(false);

    if (usernameTimeoutRef.current) {
      clearTimeout(usernameTimeoutRef.current);
    }

    usernameTimeoutRef.current = setTimeout(() => {
      checkUsernameAvailability(value);
    }, 500);
  };

  useEffect(() => {
    return () => {
      if (usernameTimeoutRef.current) {
        clearTimeout(usernameTimeoutRef.current);
      }
    };
  }, []);

  const validateUsername = (value, isBlur = false) => {
    if (isBlur && value.length < 3) {
      setUsernameError(true);
      setValidUsername(false);
      setTimeout(() => setUsernameError(false), 500);
      return value;
    }

    if (value.length > 20) {
      setUsernameError(true);
      setValidUsername(false);
      setTimeout(() => setUsernameError(false), 500);
      return value.slice(0, 20); // Max 20 characters
    }

    // Convert to lowercase
    value = value.toLowerCase();

    // Check for consecutive hyphens
    if (/-{2,}/.test(value)) {
      setUsernameError(true);
      setValidUsername(false);
      setTimeout(() => setUsernameError(false), 500);
    }

    // Remove consecutive hyphens
    value = value.replace(/-{2,}/g, "-");

    // Remove leading hyphen
    if (value.startsWith("-")) {
      setUsernameError(true);
      setValidUsername(false);
      setTimeout(() => setUsernameError(false), 500);
      value = value.slice(1);
    }

    // Handle trailing hyphen
    if (value.endsWith("-")) {
      if (isBlur) {
        setUsernameError(true);
        setValidUsername(false);
        setTimeout(() => setUsernameError(false), 500);
        value = value.slice(0, -1);
      }
    }

    // Count hyphens and handle max limit
    const hyphenCount = (value.match(/-/g) || []).length;
    if (hyphenCount > 5) {
      setUsernameError(true);
      setValidUsername(false);
      setTimeout(() => setUsernameError(false), 500);
      // Remove the last hyphen if it exceeds the limit
      const lastHyphenIndex = value.lastIndexOf("-");
      value = value.slice(0, lastHyphenIndex);
    }

    // Check if starts with number
    if (/^[0-9]/.test(value)) {
      setUsernameError(true);
      setValidUsername(false);
      setTimeout(() => setUsernameError(false), 500);
      return false;
    }

    // Only allow lowercase letters, numbers, and hyphens
    const validValue = value.replace(/[^a-z0-9-]/g, "");

    if (validValue !== value) {
      setUsernameError(true);
      setValidUsername(false);
      setTimeout(() => setUsernameError(false), 500);
    }

    return validValue;
  };

  const validateName = (value, isBlur = false) => {
    // Check minimum length on blur
    if (isBlur && value.length < 4) {
      setNameError(true);
      setTimeout(() => setNameError(false), 500);
      return value;
    }

    // Check for max length and trigger shake if exceeded
    if (value.length > 30) {
      setNameError(true);
      setTimeout(() => setNameError(false), 500);
      return value.slice(0, 30); // Max 30 characters
    }

    let newValue = value;

    // Check for non-alphabetic characters
    if (/[^a-zA-Z\s-]/.test(newValue)) {
      setNameError(true);
      setTimeout(() => setNameError(false), 500);
      newValue = newValue.replace(/[^a-zA-Z\s-]/g, "");
    }

    // Check for consecutive hyphens
    if (/-{2,}/.test(newValue)) {
      setNameError(true);
      setTimeout(() => setNameError(false), 500);
    }

    // Remove consecutive hyphens
    newValue = newValue.replace(/-{2,}/g, "-");

    // Remove leading hyphen
    if (newValue.startsWith("-")) {
      setNameError(true);
      setTimeout(() => setNameError(false), 500);
      newValue = newValue.slice(1);
    }

    // Handle trailing hyphen
    if (newValue.endsWith("-")) {
      if (isBlur) {
        setNameError(true);
        setTimeout(() => setNameError(false), 500);
        newValue = newValue.slice(0, -1);
      }
    }

    // Count hyphens and handle max limit
    const hyphenCount = (newValue.match(/-/g) || []).length;
    if (hyphenCount > 5) {
      setNameError(true);
      setTimeout(() => setNameError(false), 500);
      // Remove the last hyphen if it exceeds the limit
      const lastHyphenIndex = newValue.lastIndexOf("-");
      newValue = newValue.slice(0, lastHyphenIndex);
    }

    // Check if starts with letter
    if (newValue.length > 0 && !/^[a-zA-Z]/.test(newValue)) {
      setNameError(true);
      setTimeout(() => setNameError(false), 500);
      return false;
    }

    return newValue;
  };

  const handleNameChange = (e) => {
    const value = e.target.value;

    // Check for double spaces
    if (value.includes("  ")) {
      const nameInput = nameInputRef.current;
      nameInput.classList.add("shake");

      // Remove shake class after animation
      setTimeout(() => {
        nameInput.classList.remove("shake");
      }, 600);

      // Replace double spaces with single space
      setName(value.replace(/\s+/g, " "));
      return;
    }

    const validatedName = validateName(value);
    if (validatedName !== false) {
      setName(validatedName);
      // Set cursor to end
      const len = validatedName.length;
      setTimeout(() => {
        e.target.setSelectionRange(len, len);
      }, 0);
    }
  };

  const handleBlur = (e, type) => {
    const value = e.target.value;
    if (type === "name") {
      const validatedName = validateName(value, true);
      if (validatedName !== false) {
        setName(validatedName);
      }
    } else {
      const validatedUsername = validateUsername(value, true);
      if (validatedUsername !== false) {
        setUsername(validatedUsername);
      }
    }
  };

  const handleFocus = (e) => {
    const len = e.target.value.length;
    setTimeout(() => {
      e.target.setSelectionRange(len, len);
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let hasError = false;

    const trimmedName = name.trim();
    const trimmedUsername = username.trim();

    // Check name field
    if (!trimmedName || trimmedName.length < 4) {
      const nameInput = nameInputRef.current;
      nameInput.classList.add("input-error");
      setTimeout(() => nameInput.classList.remove("input-error"), 600);
      hasError = true;
    }

    // Check username field
    if (!trimmedUsername) {
      const usernameInput = usernameInputRef.current;
      usernameInput.classList.add("input-error");
      setTimeout(() => usernameInput.classList.remove("input-error"), 600);
      hasError = true;
    }

    // Don't proceed if any field is empty or name is too short
    if (hasError) return;

    // Check username validity
    if (!validUsername) {
      const usernameInput = usernameInputRef.current;
      usernameInput.classList.add("shake");
      setShowUsernameStatus(false);

      setTimeout(() => {
        usernameInput.classList.remove("shake");
        setShowUsernameStatus(true);
      }, 600);

      return;
    }

    try {
      const uid = auth.currentUser.uid;

      // Set username in usernames collection
      await set(
        ref(db, `usernames/${uid}/username`),
        trimmedUsername.toLowerCase()
      );

      // Update only username and name in users collection while preserving other data
      await update(ref(db, `users/${uid}`), {
        username: trimmedUsername.toLowerCase(),
        name: trimmedName,
      });

      console.log(`Profile updated successfully for uid: ${uid}`);
      console.log(`Username: ${trimmedUsername}`);
      console.log(`Name: ${trimmedName}`);

      // Close with a slight delay to ensure database operations are complete
      setTimeout(() => {
        // Force cleanup of any lingering elements
        const container = document.getElementById("signup-profile-container");
        if (container) {
          container.remove();
        }
        // Call the onClose callback
        if (typeof onClose === "function") {
          onClose();
        }
      }, 100);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  return (
    <div className="add-wallpaper-overlay">
      <div
        className={`add-wallpaper-dialog expanded`}
        onClick={(e) => e.stopPropagation()}
        style={{
          opacity: 1,
          transform: "scale(1)",
          transition: "opacity 0.2s ease, transform 0.2s ease",
        }}
      >
        <div className="dialog-header">
          <h2 className="add-wallpaper-title">Credentials</h2>
        </div>

        <div className="dialog-content">
          <form
            onSubmit={handleSubmit}
            noValidate
            className="add-wallpaper-form"
          >
            <div className="form-group">
              <label>Name</label>
              <input
                ref={nameInputRef}
                type="text"
                value={name}
                onChange={handleNameChange}
                onBlur={(e) => handleBlur(e, "name")}
                onFocus={handleFocus}
                placeholder="John Doe"
                required
                className={nameError ? "shake" : ""}
              />
            </div>

            <div className="form-group">
              <label>Username</label>
              <div className="input-container">
                <input
                  type="text"
                  placeholder="john-doe"
                  value={username}
                  onChange={handleUsernameChange}
                  ref={usernameInputRef}
                  className="input-field"
                />
                {username && showUsernameStatus && (
                  <div className="icon-container">
                    {validUsername ? (
                      <svg className="check-icon" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                      </svg>
                    ) : (
                      <svg className="cross-icon" viewBox="0 0 24 24">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
                      </svg>
                    )}
                  </div>
                )}
              </div>
            </div>

            <button type="submit" className="upload-button">
              Upload Details
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUpProfile;
