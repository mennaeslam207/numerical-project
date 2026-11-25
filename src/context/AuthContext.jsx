import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("studyUser");

    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(
    () => !!localStorage.getItem("studyUser")
  );

  const [loading, setLoading] = useState(false);

  // Register
  const register = (name, email, password) => {
    if (!name || !email || !password) {
      return {
        success: false,
        message: "Please fill in all fields",
      };
    }

    const newUser = {
      id: crypto.randomUUID(),
      name,
      email,
    };

    localStorage.setItem(
      "studyUser",
      JSON.stringify(newUser)
    );

    setUser(newUser);
    setIsAuthenticated(true);

    return {
      success: true,
      user: newUser,
    };
  };

  // Login
  const login = (email, password) => {
    if (!email || !password) {
      return {
        success: false,
        message: "Email and password are required",
      };
    }

    const savedUsers = JSON.parse(
      localStorage.getItem("studyUsers") || "[]"
    );

    const foundUser = savedUsers.find(
      (item) =>
        item.email === email &&
        item.password === password
    );

    if (!foundUser) {
      return {
        success: false,
        message: "Invalid email or password",
      };
    }

    const loggedInUser = {
      id: foundUser.id,
      name: foundUser.name,
      email: foundUser.email,
    };

    localStorage.setItem(
      "studyUser",
      JSON.stringify(loggedInUser)
    );

    setUser(loggedInUser);
    setIsAuthenticated(true);

    return {
      success: true,
      user: loggedInUser,
    };
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("studyUser");

    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    setLoading,
    register,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
};

export default AuthContext;