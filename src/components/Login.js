import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth, db } from "../backend/firebase/FirebaseConfig";
import { collection, query, where, getDocs, doc, updateDoc, Timestamp } from "firebase/firestore";
import bcrypt from "bcryptjs";
import "./styles/Login.css";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isForgotPasswordModalVisible, setIsForgotPasswordModalVisible] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordError, setForgotPasswordError] = useState("");
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const adminCredentials = {
    email: "mikmik@nu-moa.edu.ph",
    password: "mikmik",
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // const checkUserAndLogin = async () => {
  //   try {
  //     const { email, password } = formData;
  //     const usersRef = collection(db, "accounts");
  //     const q = query(usersRef, where("email", "==", email));
  //     const querySnapshot = await getDocs(q);
  
  //     if (!querySnapshot.empty) {
  //       const userDoc = querySnapshot.docs[0];
  //       const userData = userDoc.data();
  
  //       if (userData.isBlocked && userData.blockedUntil) {
  //         const now = Timestamp.now().toMillis();
  //         const blockedUntil = userData.blockedUntil.toMillis();

  //         if (now >= blockedUntil) {
  //           await updateDoc(userDoc.ref, {
  //             isBlocked: false,
  //             loginAttempts: 0,
  //             blockedUntil: null, 
  //           });

  //           console.log("Account unblocked successfully.");

  //         } else {
  //           const remainingTime = Math.ceil((blockedUntil - now) / 1000);
  //           setError(`Account is blocked. Try again after ${remainingTime} seconds.`);
  //           return;
  //         }
  //       }        
  
  //       if (userData.isBlocked) {
  //         setError("Account is blocked. Please try again later.");
  //         return;
  //       }

  //       try {
  //         const userCredential = await signInWithEmailAndPassword(auth, email, password);
  //         await updateDoc(userDoc.ref, { loginAttempts: 0 });
  //         navigate("/dashboard", { state: { loginSuccess: true, role: userData.role || "user" } });

  //       } catch (error) {
  //         const newAttempts = (userData.loginAttempts || 0) + 1;

  //         if (newAttempts >= 4) {
  //           // const unblockTime = Timestamp.now().toMillis() + 30 * 60 * 1000; 
  //           const unblockTime = Timestamp.now().toMillis() + 1 * 60 * 1000;
  //           await updateDoc(userDoc.ref, {
  //             isBlocked: true,
  //             blockedUntil: Timestamp.fromMillis(unblockTime),
  //           });

  //           setError("Account blocked after 4 failed attempts. Try again after 30 minutes.");

  //         } else {
  //           await updateDoc(userDoc.ref, { loginAttempts: newAttempts });
  //           setError(`Invalid password. ${4 - newAttempts} attempts remaining.`);
  //         }
  //       }
  
  //     } else {
  //       setError("User not found. Please contact admin.");
  //     }

  //   } catch (error) {
  //     console.error("Error during login:", error.message);
  //     setError("Invalid email or password. Please try again.");
  //   }
  // };

  const checkUserAndLogin = async () => {
    setIsLoading(true);

    try {
      const { email, password } = formData;
      const usersRef = collection(db, "accounts");
      const q = query(usersRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);

      let userDoc, userData, isSuperAdmin = false;
  
      if (!querySnapshot.empty) {
        userDoc = querySnapshot.docs[0];
        userData = userDoc.data();

      } else {
        const superAdminRef = collection(db, "super-admin");
        const superAdminQuery = query(superAdminRef, where("email", "==", email));
        const superAdminSnapshot = await getDocs(superAdminQuery);
  
        if (!superAdminSnapshot.empty) {
          userDoc = superAdminSnapshot.docs[0];
          userData = userDoc.data();
          isSuperAdmin = true;
        }
      }

      if (!userData) {
        setError("User not found. Please contact admin.");
        setIsLoading(false);
        return;
      }  

      if (!userData.password) {
        setIsNewUser(true); 
        setIsLoading(false);
        return;
      }

      if (userData.isBlocked && userData.blockedUntil) {
        const now = Timestamp.now().toMillis();
        const blockedUntil = userData.blockedUntil.toMillis();
  
        if (now < blockedUntil) {
          const remainingTime = Math.ceil((blockedUntil - now) / 1000);
          setError(`Account is blocked. Try again after ${remainingTime} seconds.`);
          setIsLoading(false);
          return;

        } else {
          await updateDoc(userDoc.ref, {
            isBlocked: false,
            loginAttempts: 0,
            blockedUntil: null,
          });

          console.log("Account unblocked successfully.");
        }
      }

      try {
        if (userData.password === password) {
          await updateDoc(userDoc.ref, { loginAttempts: 0 });
          const role = isSuperAdmin ? "super-admin" : (userData.role || "user").toLowerCase();
          
          const userName = userData.name || "User";
          localStorage.setItem("userEmail", userData.email);
          localStorage.setItem("userName", userName);
          localStorage.setItem("userDepartment", userData.department);
          localStorage.setItem("userPosition", userData.role);

          switch (role) {
            case "super-admin":
              navigate("/accounts", { state: { loginSuccess: true, role } });
              break;

            case "admin":
              navigate("/dashboard", { state: { loginSuccess: true, role } });
              break;

            case "user":
              navigate("/requisition", { state: { loginSuccess: true, role } });
              break;

            default:
              setError("Unknown role. Please contact admin.");
              break;
          }
        } else {
          const newAttempts = (userData.loginAttempts || 0) + 1;

          if (newAttempts >= 4) {
            const unblockTime = Timestamp.now().toMillis() + 1 * 60 * 1000;
            await updateDoc(userDoc.ref, {
              isBlocked: true,
              blockedUntil: Timestamp.fromMillis(unblockTime),
            });

            setError("Account blocked after 4 failed attempts. Try again after 30 minutes.");

          } else {
            await updateDoc(userDoc.ref, { loginAttempts: newAttempts });
            setError(`Invalid password. ${4 - newAttempts} attempts remaining.`);
          }
        }

      } catch (error) {
        console.error("Error during login:", error.message);
        setError("Invalid email or password. Please try again.");
      }
      
    } catch (error) {
      console.error("Error during login:", error.message);
      setError("Invalid email or password. Please try again.");

    } finally {
      setIsLoading(false); 
    }  
  };  

  const handleRegisterPassword = async () => {
    if (formData.password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
  
    try {
      const { email, password } = formData;
      const usersRef = collection(db, "accounts");
      const q = query(usersRef, where("email", "==", email.trim().toLowerCase()));
      const querySnapshot = await getDocs(q);
  
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0].ref;
  
        if (userDoc) {
          console.log("Updating password for user:", userDoc.id);
          await updateDoc(userDoc, { password });
          console.log("Password updated successfully:", password);
  
          // ✅ Navigate to Dashboard without Firebase Auth
          navigate("/dashboard", { state: { loginSuccess: true, role: "user" } });
          setIsNewUser(false);
        } else {
          setError("Failed to update user record. Please contact admin.");
        }
      } else {
        setError("User record not found in Firestore.");
      }
    } catch (error) {
      console.error("Error updating password:", error.message);
      setError("Failed to set password. Try again.");
    }
  };
  
  const handleForgotPassword = async () => {
    if (!forgotPasswordEmail) {
      setForgotPasswordError("Please enter your email.");
      return;
    }
  
    try {
      const usersRef = collection(db, "accounts");
      const q = query(usersRef, where("email", "==", forgotPasswordEmail));
      const querySnapshot = await getDocs(q);
  
      if (querySnapshot.empty) {
        setForgotPasswordError("Email not found. Please check and try again.");
        setForgotPasswordSuccess(""); 
        return;
      }

      await sendPasswordResetEmail(auth, forgotPasswordEmail);
  
      setForgotPasswordSuccess(
        "Password reset link sent! Please check your email."
      );

      setForgotPasswordError(""); 

      setTimeout(() => {
        setForgotPasswordEmail("");
      }, 50);

    } catch (error) {
      console.error("Error sending reset email:", error.message);
      setForgotPasswordError(
        "Failed to send reset link. Please check the email."
      );
      
      setForgotPasswordSuccess("");

      setTimeout(() => {
        setForgotPasswordEmail("");
      }, 50);
    }
  };  

  return (
    <div className="login-container">
      <div className="login-box">
        <h2 className="login-title">{isNewUser ? "Set Your Password" : "Login"}</h2>
        {error && <p className="error-message">{error}</p>}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            isNewUser ? handleRegisterPassword() : checkUserAndLogin();
          }}
        >
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
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Confirm your password"
                />
                <span
                  className="toggle-password"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? "🔒" : "👁️"}
                </span>
              </div>
            </div>
          )}

          <button type="submit" className="login-btn"  disabled={isLoading}>
            {isLoading ? <div className="loader"></div> : isNewUser ? "Set Password" : "Login"}
          </button>
        </form>

        {!isNewUser && (
          <p className="forgot-password-link" onClick={() => setIsForgotPasswordModalVisible(true)}>
            Forgot Password?
          </p>
        )}
      </div>

      {isForgotPasswordModalVisible && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Forgot Password</h3>
            <p>Enter your email to receive a reset link.</p>
            <input
              type="email"
              value={forgotPasswordEmail}
              onChange={(e) => setForgotPasswordEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
            {forgotPasswordError && (
              <p className="error-message">{forgotPasswordError}</p>
            )}
            {forgotPasswordSuccess && (
              <p className="success-message">{forgotPasswordSuccess}</p>
            )}
            <div className="modal-actions">
              <button onClick={handleForgotPassword} className="modal-btn">
                Send Reset Link
              </button>
              <button
                onClick={() => setIsForgotPasswordModalVisible(false)}
                className="modal-cancel-btn"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
