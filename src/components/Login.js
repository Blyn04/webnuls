import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updatePassword,
  signOut,
  getAuth,
} from "firebase/auth";
import { auth, db } from "../backend/firebase/FirebaseConfig";
import { collection, query, where, getDocs, doc, updateDoc, Timestamp, addDoc, serverTimestamp } from "firebase/firestore";
import { notification, Modal } from "antd";
import bcrypt from "bcryptjs";
import "./styles/Login.css";

import trybg2 from './try-bg.svg'
import NotificationModal from "./customs/NotificationModal";

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
  const [newPassword, setNewPassword] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false); 
  const [modalMessage, setModalMessage] = useState("");
  const [signUpMode, setSignUpMode] = useState(false);
  const [signUpData, setSignUpData] = useState({
    name: "",
    email: "",
    employeeId: '',
    password: "",
    jobTitle: "",
    department: "",
    confirmPassword: "",
  });
  const navigate = useNavigate();


  const [animateInputs, setAnimateInputs] = useState(false);

  useEffect(() => {
    const handleBackButton = (event) => {
      event.preventDefault();
      window.history.pushState(null, "", window.location.href);
    };

    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handleBackButton);

    return () => {
      window.removeEventListener("popstate", handleBackButton);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSignUpChange = (e) => {
    const { name, value } = e.target;
    setSignUpData({ ...signUpData, [name]: value });
  };  

  const signUpAnimate = (e) =>{
    if(signUpMode === true){
      setSignUpMode(false)

      setAnimateInputs(true);
      setTimeout(() => setAnimateInputs(false), 1000);
    }
    else if(signUpMode ===false){
      setSignUpMode(true)

      setAnimateInputs(true);
      setTimeout(() => setAnimateInputs(false), 1000);
    }
  }
  
  const checkUserAndLogin = async () => {
    setIsLoading(true);
  
    try {
      const { email, password } = formData;
      const usersRef = collection(db, "accounts");
      const q = query(usersRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);
  
      let userDoc, userData, isSuperAdmin = false;
  
      // 🔎 First check regular accounts
      if (!querySnapshot.empty) {
        userDoc = querySnapshot.docs[0];
        userData = userDoc.data();

      } else {
        // 🔎 Then check if it's a super-admin
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

      if (userData.disabled) {
        setError("Your account has been disabled.");
        await signOut(auth);
        setIsLoading(false);
        return;
      }
  
      // 🧷 If password not set yet (new user)
      if (!isSuperAdmin && !userData.uid) {
        setIsNewUser(true);
        setIsLoading(false);
        return;
      }
  
      // 🔒 Block check
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
  
      // 🧠 Super-admin login (Firestore password)
      if (isSuperAdmin) {
        if (userData.password === password) {
          await updateDoc(userDoc.ref, { loginAttempts: 0 });
  
          const userName = userData.name || "Super Admin";
          localStorage.setItem("userId", userDoc.id);
          localStorage.setItem("userEmail", userData.email);
          localStorage.setItem("userName", userName);
          localStorage.setItem("userDepartment", userData.department || "Admin");
          localStorage.setItem("userPosition", "super-admin");
  
          navigate("/main/accounts", { state: { loginSuccess: true, role: "super-admin" } });
  
        } else {
          const newAttempts = (userData.loginAttempts || 0) + 1;
  
          if (newAttempts >= 4) {
            const unblockTime = Timestamp.now().toMillis() + 30 * 60 * 1000; // 30 minutes
            await updateDoc(userDoc.ref, {
              isBlocked: true,
              blockedUntil: Timestamp.fromMillis(unblockTime),
            });
  
            setError("Super Admin account blocked. Try again after 30 minutes.");

          } else {
            await updateDoc(userDoc.ref, { loginAttempts: newAttempts });
            setError(`Invalid password. ${4 - newAttempts} attempts remaining.`);
          }
        }
  
      } else {
        // ✅ Firebase Auth login for regular users/admins
        try {
          await signInWithEmailAndPassword(auth, email, password);
  
          await updateDoc(userDoc.ref, { loginAttempts: 0 });
  
          let role = (userData.role || "user").toLowerCase().trim().replace(/[\s_]/g, '-');
          if (role === "admin1" || role === "admin2") {
            role = "admin";
          }
  
          const userName = userData.name || "User";
          localStorage.setItem("userId", userDoc.id);
          localStorage.setItem("userEmail", userData.email);
          localStorage.setItem("userName", userName);
          localStorage.setItem("userDepartment", userData.department || "");
          // localStorage.setItem("userPosition", userData.role || "User");
          localStorage.setItem("userPosition", role);
          console.log(localStorage.getItem("userPosition"));

          await addDoc(collection(db, `accounts/${userDoc.id}/activitylog`), {
            action: "User Logged In (Website)",
            userName: userData.name || "User",
            timestamp: serverTimestamp(),
          });          
  
          switch (role) {
            case "admin":
              navigate("/main/dashboard", { state: { loginSuccess: true, role } });
              break;

            case "super-user":
              navigate("/main/dashboard", { state: { loginSuccess: true, role } });
              break;

            case "user":
              navigate("/main/requisition", { state: { loginSuccess: true, role } });
              break;

            default:
              setError("Unknown role. Please contact admin.");
              break;
          }
  
        } catch (authError) {
          console.error("Firebase Auth login failed:", authError.message);
  
          const newAttempts = (userData.loginAttempts || 0) + 1;
  
          if (newAttempts >= 4) {
            const unblockTime = Timestamp.now().toMillis() + 30 * 60 * 1000;
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
      }
  
    } catch (error) {
      console.error("Error during login:", error.message);
      setError("Unexpected error. Please try again.");

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
        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();
        const role = (userData.role || "user").toLowerCase();
        const normalizedRole = role === "admin1" || role === "admin2" ? "admin" : role;
  
        console.log("Creating Firebase Auth user...");
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;
  
        console.log("Saving UID to Firestore (not password):", firebaseUser.uid);
        await updateDoc(userDoc.ref, {
          uid: firebaseUser.uid
          // ❌ remove this: password: password
        });
  
        const userName = userData.name || "User";
        localStorage.setItem("userEmail", userData.email);
        localStorage.setItem("userName", userName);
        localStorage.setItem("userDepartment", userData.department || "Unknown");
        localStorage.setItem("userPosition", userData.role || "User");
  
        switch (normalizedRole) {
          case "super-admin":
            navigate("/main/accounts", { state: { loginSuccess: true, role: "super-admin" } });
            break;

          case "admin":
            navigate("/main/dashboard", { state: { loginSuccess: true, role: "admin" } });
            break;

          case "super-user":
            navigate("/main/dashboard", { state: { loginSuccess: true, role: "admin" } });
            break;

          case "user":
            navigate("/main/requisition", { state: { loginSuccess: true, role: "user" } });
            break;

          default:
            setError("Unknown role. Please contact admin.");
            return;
        }
  
        setIsNewUser(false);
        console.log("User registered and redirected:", normalizedRole);
  
      } else {
        setError("User record not found in Firestore.");
      }
  
    } catch (error) {
      console.error("Error setting password and UID:", error.message);
      if (error.code === "auth/email-already-in-use") {
        setError("Email already in use. Try logging in instead.");

      } else {
        setError("Failed to set password. Try again.");
      }
    }
  };

  const handleSignUp = async () => {
    const { name, email, employeeId, password, confirmPassword, jobTitle, department } = signUpData;
    const auth = getAuth();
  
    // Step 1: Ensure the email domain is valid
    const validDomains = ["nu-moa.edu.ph", "students.nu-moa.edu.ph"];
    const emailDomain = email.split('@')[1];
  
    if (!validDomains.includes(emailDomain)) {
      setError("Invalid email domain. Only @nu-moa.edu.ph and @students.nu-moa.edu.ph are allowed.");
      return;
    }
  
    // Step 2: Ensure passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
  
    try {
      // Step 3: Check if the employeeId already exists in Firestore in both 'pendingaccounts' and 'accounts'
      const employeeQueryPending = query(
        collection(db, "pendingaccounts"),
        where("employeeId", "==", employeeId.trim())
      );
      const employeeQueryAccounts = query(
        collection(db, "accounts"),
        where("employeeId", "==", employeeId.trim())
      );
  
      const emailQueryPending = query(
        collection(db, "pendingaccounts"),
        where("email", "==", email.trim().toLowerCase())
      );
      const emailQueryAccounts = query(
        collection(db, "accounts"),
        where("email", "==", email.trim().toLowerCase())
      );
  
      const [
        employeeSnapshotPending,
        employeeSnapshotAccounts,
        emailSnapshotPending,
        emailSnapshotAccounts,
      ] = await Promise.all([
        getDocs(employeeQueryPending),
        getDocs(employeeQueryAccounts),
        getDocs(emailQueryPending),
        getDocs(emailQueryAccounts),
      ]);
  
      if (!employeeSnapshotPending.empty || !employeeSnapshotAccounts.empty) {
        setError("This employee ID is already registered.");
        return;
      }
  
      if (!emailSnapshotPending.empty || !emailSnapshotAccounts.empty) {
        setError("This email is already registered.");
        return;
      }
  
      // Step 4: Create the Firebase user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
  
      // Step 5: Determine the role based on the job title
      let role = "user";  // Default role is 'user'
      if (jobTitle.toLowerCase() === "dean") {
        role = "admin";
        
      } else if (jobTitle.toLowerCase().includes("custodian")) {
        role = "super-user"; 

      } else if (jobTitle.toLowerCase() === "faculty") {
        role = "user"; 
      }
  
      // Step 6: Create a new document in the 'pendingaccounts' collection
      const sanitizedData = {
        name: name.trim().toLowerCase(),
        email: email.trim().toLowerCase(),
        employeeId: employeeId.trim().replace(/[^\d-]/g, ''),
        jobTitle,
        department,
        role,  // Assign role based on job title
        createdAt: serverTimestamp(),
        status: "pending", // Mark as pending
        uid: firebaseUser.uid,
      };
  
      // Add user data to 'pendingaccounts' collection
      await addDoc(collection(db, "pendingaccounts"), sanitizedData);
  
      // Step 7: Set the modal message and show the modal
      setModalMessage("Successfully Registered! Please check your email for further instructions. Your account is pending approval from the ITSO.");
      setIsModalVisible(true); // Open the modal
  
      // Clear input fields after successful registration
      setSignUpData({
        name: "",
        email: "",
        employeeId: '',
        password: "",
        confirmPassword: "",
        jobTitle: "",
        department: "",
      });
  
    } catch (error) {
      console.error("Sign up error:", error.message);

      if (error.code === "auth/email-already-in-use") {
        setError("Email already in use.");

      } else {
        setError("Failed to create account. Try again.");
      }
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
  
      setForgotPasswordSuccess("Password reset link sent! Please check your email.");
      setForgotPasswordError(""); 
      setTimeout(() => {
        setForgotPasswordEmail("");
      }, 50);

    } catch (error) {
      console.error("Error sending reset email:", error.message);
      setForgotPasswordError("Failed to send reset link. Please check the email.");
      setForgotPasswordSuccess("");
      setTimeout(() => {
        setForgotPasswordEmail("");
      }, 50);
    }
  };  

  return (
    <div className="login-container" >
      <div className="login-box">
        
        <div className="container2">
        <div className="image-div">
            <img src={trybg2} alt="This is the image"></img>
          </div>
        

        <div className="form-div">
        <h2 className= {signUpMode ?  "create-account-title": "login-title" }>
          {signUpMode ? "Create an Account" : isNewUser ? "Set Your Password" : "Login"}
        </h2>
        <form
          className={signUpMode ? "form-wrapper slide-in": "form-wrapper slide-in2"}
          onSubmit={(e) => {
            e.preventDefault();
            signUpMode
              ? handleSignUp()
              : isNewUser
              ? handleRegisterPassword()
              : checkUserAndLogin();
          }}
        >
          {signUpMode ? (
            <>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  value={signUpData.name}
                  onChange={handleSignUpChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={signUpData.email}
                  onChange={handleSignUpChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Employee ID</label>
                <input
                  type="text"
                  name="employeeId"
                  value={signUpData.employeeId}
                  onChange={handleSignUpChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Job Title</label>
                <select
                  name="jobTitle"
                  value={signUpData.jobTitle}
                  onChange={handleSignUpChange}
                  required
                >
                  <option value="">Select Job Title</option>
                  <option value="Faculty">Faculty</option>
                  <option value="Dean">Dean</option>
                  <option value="Laboratory Custodian">Laboratory Custodian</option>
                </select>
              </div>

              <div className="form-group">
                <label>Department</label>
                <select
                  name="department"
                  value={signUpData.department}
                  onChange={handleSignUpChange}
                  required
                >
                  <option value="">Select Department</option>
                  <option value="Medical Technology">Medical Technology</option>
                  <option value="Nursing">Nursing</option>
                  <option value="Dentistry">Dentistry</option>
                  <option value="Pharmacy">Pharmacy</option>
                  <option value="Optometry">Optometry</option>
                </select>
              </div>

              <div className="form-group password-group">
                <label>Password</label>
                <div className="password-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={signUpData.password}
                    onChange={handleSignUpChange}
                    required
                  />
                  <span
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "🔒" : "👁️"}
                  </span>
                </div>
              </div>
              
              <div className="form-group password-group">
                <label>Confirm Password</label>
                <div className="password-wrapper">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={signUpData.confirmPassword}
                    onChange={handleSignUpChange}
                    required
                  />
                  <span
                    className="toggle-password"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? "🔒" : "👁️"}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <>
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
                  <span
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "🔒" : "👁️"}
                  </span>

                  {error && <p className="error-message" >{error}</p>}
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
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? "🔒" : "👁️"}
                    </span>
                  </div>
                </div>
              )}
            </>
          )}

          <div></div>

          <button type="submit" className= {signUpMode ? "signup-btn" : "login-btn"} disabled={isLoading}>
            {isLoading ? (
              <div className="loader"></div>
            ) : signUpMode ? (
              "Sign Up"
            ) : isNewUser ? (
              "Set Password"
            ) : (
              "Login"
            )}
          </button>
        </form>

        <div className= { signUpMode? "bottom-label-div2":"bottom-label-div"}>

        {!signUpMode && !isNewUser && (
          <p
            className="forgot-password-link"
            style={{marginTop: '20px', cursor: 'pointer'}}
            onClick={() => setIsForgotPasswordModalVisible(true)}
          >
            Forgot Password?
          </p>
        )}

        <p className="switch-mode" >
          {signUpMode ? (
            <>
              Already have an account?{" "}
              <span onClick={() => signUpAnimate()}>Login here</span>
            </>
          ) : (
            <>
              Don’t have an account?{" "}
              <span onClick={() => signUpAnimate()}>Sign up here</span>
            </>
          )}
        </p>
        </div>


        </div>
        </div>
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

      <NotificationModal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        message={modalMessage} 
      />
    </div>
  );
};

export default Login;
