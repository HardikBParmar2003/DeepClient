import re

filepath = r"D:\deep clothes\client\src\context\AuthContext.jsx"
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Add updateUser to AuthContext
update_fn = """  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  const updateUser = (userData) => {
    setUser(userData);
  };
"""
content = content.replace("  const logout = () => {\n    setUser(null);\n    setToken(null);\n    localStorage.removeItem('token');\n  };\n", update_fn)

# Add updateUser to Provider value
content = content.replace("value={{ user, token, loading, login, logout }}", "value={{ user, token, loading, login, logout, updateUser }}")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated AuthContext.jsx")
