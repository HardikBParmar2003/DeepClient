import re

filepath = r"D:\deep clothes\client\src\pages\admin\AdminProfitLoss.jsx"
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Replace ?{ with ?{
content = content.replace("?{", "?{")

# 2. Remove '+' and '-' logic for signs, since colors will indicate it
# In Top Level:
# Old: {totalProfit >= 0 ? '+' : '-'}?{Math.abs(totalProfit).toFixed(2)}
content = content.replace("{totalProfit >= 0 ? '+' : '-'}?{Math.abs(totalProfit).toFixed(2)}", "?{Math.abs(totalProfit).toFixed(2)}")

# In Category breakdown:
# Old: {catProfit >= 0 ? '+' : ''}?{catProfit.toFixed(2)}
content = content.replace("{catProfit >= 0 ? '+' : ''}?{catProfit.toFixed(2)}", "?{Math.abs(catProfit).toFixed(2)}")

# In Detailed Table:
# Old: {profit >= 0 ? '+' : ''}?{profit.toFixed(2)}
content = content.replace("{profit >= 0 ? '+' : ''}?{profit.toFixed(2)}", "?{Math.abs(profit).toFixed(2)}")

# 3. Change text-green-400 to text-green-600 and text-red-400 to text-red-600 for Profit/Loss text
# Note: In deep clothes, they use a dark mode, text-green-600 might be hard to read, 
# but user specifically asked for "dark" green and red. I'll use text-green-500 and text-red-500 which is standard "darker" than 400.
# Actually let's just use text-green-600 and text-red-600 to be safe.
content = content.replace("'text-green-400'", "'text-green-600'")
content = content.replace("'text-red-400'", "'text-red-600'")
content = content.replace("text-green-400", "text-green-600")
content = content.replace("text-red-400", "text-red-600")


with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Fixed signs, currency symbols, and colors")

