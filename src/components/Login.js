import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth, db } from "../backend/firebase/FirebaseConfig";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";

import "./styles/Login.css";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");

  const navigate = useNavigate();

  const adminCredentials = {
    email: "mikmik@nu-moa.edu.ph",
    password: "mikmik",
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const checkUserAndLogin = async () => {
    try {
      const { email, password } = formData;

      // Check if admin
      if (email === adminCredentials.email && password === adminCredentials.password) {
        navigate("/accounts", { state: { loginSuccess: true, role: "super-admin" } });
        return;
      }

      // Query Firestore for user with matching email
      const usersRef = collection(db, "accounts");
      const q = query(usersRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0]; // Get the first matching document
        const userData = userDoc.data();

        if (!userData.password) {
          setIsNewUser(true);
          return;
        }

        // User exists, attempt login with Firebase Auth
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log("User logged in:", userCredential.user);
        navigate("/dashboard", { state: { loginSuccess: true, role: userData.role || "user" } });

      } else {
        setError("User not found. Please contact admin.");
      }
    } catch (error) {
      console.error("Error during login:", error.message);
      setError("Invalid email or password. Please try again.");
    }
  };

  const handleRegisterPassword = async () => {
    if (formData.password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const { email, password } = formData;

      // Create account in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Query Firestore for the user's document
      const usersRef = collection(db, "accounts");
      const q = query(usersRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0].ref; // Reference to the Firestore document

        // Update Firestore document with password (not recommended for production)
        await updateDoc(userDoc, { password });

        console.log("Password set successfully for:", userCredential.user);
        navigate("/dashboard", { state: { loginSuccess: true, role: "user" } });
      } else {
        setError("User record not found in Firestore.");
      }
    } catch (error) {
      console.error("Error setting password:", error.message);
      setError("Failed to set password. Try again.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2 className="login-title">{isNewUser ? "Set Your Password" : "Login"}</h2>
        {error && <p className="error-message">{error}</p>}

        <form onSubmit={(e) => { e.preventDefault(); isNewUser ? handleRegisterPassword() : checkUserAndLogin(); }}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group password-group">
            <label>Password</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter your password"
              />
              <span className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? "🔒" : "👁️"}
              </span>
            </div>
          </div>

          {isNewUser && (
            <div className="form-group password-group">
              <label>Confirm Password</label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Confirm your password"
                />
              </div>
            </div>
          )}

          <button type="submit" className="login-btn">
            {isNewUser ? "Set Password" : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
